// Grouping engine for the web console's 조편성 screen.
// Pure functions: given members + options, produce balanced groups locally.
//
// Modes:
//  - average: group average handicaps as equal as possible (snake + swap pass)
//  - sum:     group handicap sums as equal as possible (team formats)
//  - abcd:    tier draw - split the field into 4 handicap tiers (A/B/C/D),
//             each group draws one player per tier (classic tournament draw),
//             then a same-tier swap pass tightens the averages
//  - fresh:   "새 얼굴 우선" - minimize pairings that already played together
//             (history from recorded rounds + saved schedules), with the
//             handicap spread as a secondary objective
//  - random:  shuffled draw
//
// Options that combine with every mode:
//  - genderMix: nudge groups toward an even gender ratio (guarded swaps)
//  - together:  pairs that must end up in the same group (merged into units)
//  - apart:     pairs that must not share a group (hard constraint in passes)
//
// No group exceeds ceil(n / groupCount) members, except when a together-unit
// itself is larger than that cap (units are never split).

import type { ApiMember } from './api';

export type GroupingMode = 'average' | 'sum' | 'abcd' | 'fresh' | 'random';

export interface GroupingOptions {
  mode: GroupingMode;
  genderMix?: boolean;
  together?: [number, number][];
  apart?: [number, number][];
  /** "idA-idB" (idA < idB) -> how many times that pair already played together */
  historyPairs?: Map<string, number>;
  /** Injectable RNG for tests; defaults to Math.random */
  rng?: () => number;
}

export interface FormedGroup {
  groupName: string;
  players: ApiMember[];
  metricValue: number;
}

export interface GroupingResult {
  groups: FormedGroup[];
  reasoning: string;
  /** total repeated pairings inside the produced groups (fresh-mode quality) */
  repeatPairs: number;
  /** pairs from `apart` that could not be separated (should normally be 0) */
  apartViolations: number;
}

const pairKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);
const isFemale = (m: ApiMember) => m.gender === 'female' || m.gender === '여';

function shuffled<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Merge `together` pairs into units via union-find. Units move as one block. */
function buildUnits(members: ApiMember[], together: [number, number][]): ApiMember[][] {
  const parent = new Map<number, number>();
  const find = (x: number): number => {
    let r = x;
    while (parent.get(r) !== r) r = parent.get(r)!;
    return r;
  };
  members.forEach((m) => parent.set(m.id, m.id));
  together.forEach(([a, b]) => {
    if (parent.has(a) && parent.has(b)) parent.set(find(a), find(b));
  });
  const byRoot = new Map<number, ApiMember[]>();
  members.forEach((m) => {
    const r = find(m.id);
    if (!byRoot.has(r)) byRoot.set(r, []);
    byRoot.get(r)!.push(m);
  });
  return [...byRoot.values()];
}

export function buildGroups(selected: ApiMember[], opts: GroupingOptions): GroupingResult {
  const rng = opts.rng ?? Math.random;
  const apart = opts.apart ?? [];
  const history = opts.historyPairs ?? new Map<string, number>();
  const groupCount = Math.max(1, Math.ceil(selected.length / 4));
  const maxSize = Math.max(1, Math.ceil(selected.length / groupCount));

  const apartSet = new Set(apart.map(([a, b]) => pairKey(a, b)));
  const isApart = (a: number, b: number) => apartSet.has(pairKey(a, b));
  const apartClash = (m: ApiMember, g: ApiMember[]) => g.some((x) => isApart(m.id, x.id));

  const units = buildUnits(selected, opts.together ?? []);
  const unitOf = new Map<number, ApiMember[]>();
  units.forEach((u) => u.forEach((m) => unitOf.set(m.id, u)));
  const lockedIds = new Set(units.filter((u) => u.length > 1).flatMap((u) => u.map((m) => m.id)));
  const unitAvg = (u: ApiMember[]) => u.reduce((s, m) => s + m.handicap, 0) / u.length;

  const pairCost = (gs: ApiMember[][]) =>
    gs.reduce((total, g) => {
      let c = 0;
      for (let i = 0; i < g.length; i++)
        for (let j = i + 1; j < g.length; j++) c += history.get(pairKey(g[i].id, g[j].id)) ?? 0;
      return total + c;
    }, 0);
  const avgSpread = (gs: ApiMember[][]) => {
    const vals = gs.map((g) => (g.length ? g.reduce((s, m) => s + m.handicap, 0) / g.length : 0));
    return Math.max(...vals) - Math.min(...vals);
  };

  const newGroups = (): ApiMember[][] => Array.from({ length: groupCount }, () => []);

  /** Snake-deal units (sorted by avg handicap) with a per-group size cap. */
  const snakeDeal = (unitList: ApiMember[][]): ApiMember[][] => {
    const gs = newGroups();
    const seq: number[] = [];
    for (let r = 0; ; r++) {
      const row = Array.from({ length: groupCount }, (_, i) => (r % 2 === 0 ? i : groupCount - 1 - i));
      seq.push(...row);
      if (seq.length >= unitList.length) break;
    }
    unitList.forEach((u, i) => {
      let target = seq[i];
      if (gs[target].length + u.length > maxSize) {
        // find the emptiest group that fits; overflow only if none fits
        let bestFit = -1;
        for (let g = 0; g < groupCount; g++) {
          if (gs[g].length + u.length <= maxSize && (bestFit === -1 || gs[g].length < gs[bestFit].length)) bestFit = g;
        }
        target = bestFit === -1
          ? gs.indexOf(gs.reduce((a, b) => (a.length <= b.length ? a : b)))
          : bestFit;
      }
      u.forEach((m) => gs[target].push(m));
    });
    return gs;
  };

  let groups: ApiMember[][];

  if (opts.mode === 'abcd') {
    groups = newGroups();
    const sorted = [...selected].sort((a, b) => a.handicap - b.handicap);
    const tierOf = new Map<number, number>();
    sorted.forEach((m, i) => tierOf.set(m.id, Math.min(3, Math.floor((i * 4) / sorted.length))));
    const placed = new Set<number>();
    // together-units first, into the emptiest group
    units.filter((u) => u.length > 1).sort((a, b) => unitAvg(a) - unitAvg(b)).forEach((u) => {
      let target = 0;
      for (let g = 1; g < groupCount; g++) if (groups[g].length < groups[target].length) target = g;
      u.forEach((m) => { groups[target].push(m); placed.add(m.id); });
    });
    // deal each tier shuffled, round-robin, size-capped, apart-aware
    for (let t = 0; t < 4; t++) {
      const tierMembers = shuffled(sorted.filter((m) => tierOf.get(m.id) === t && !placed.has(m.id)), rng);
      let cursor = t % groupCount;
      tierMembers.forEach((m) => {
        let placedAt = -1;
        for (let k = 0; k < groupCount; k++) {
          const g = (cursor + k) % groupCount;
          if (groups[g].length < maxSize && !apartClash(m, groups[g])) { placedAt = g; break; }
        }
        if (placedAt === -1) {
          for (let k = 0; k < groupCount; k++) {
            const g = (cursor + k) % groupCount;
            if (groups[g].length < maxSize) { placedAt = g; break; }
          }
        }
        if (placedAt === -1) placedAt = cursor % groupCount;
        groups[placedAt].push(m);
        cursor = placedAt + 1;
      });
    }
    swapPass(groups, {
      metric: (g) => (g.length ? g.reduce((s, m) => s + m.handicap, 0) / g.length : 0),
      movable: (m) => !lockedIds.has(m.id),
      canSwap: (a, b) => tierOf.get(a.id) === tierOf.get(b.id),
      apartClash, unitOf,
    });
  } else if (opts.mode === 'random') {
    groups = newGroups();
    shuffled(units, rng).forEach((u, i) => {
      let target = -1;
      for (let k = 0; k < groupCount; k++) {
        const g = (i + k) % groupCount;
        if (groups[g].length + u.length <= maxSize && u.every((m) => !apartClash(m, groups[g]))) { target = g; break; }
      }
      if (target === -1) {
        for (let k = 0; k < groupCount; k++) {
          const g = (i + k) % groupCount;
          if (groups[g].length + u.length <= maxSize) { target = g; break; }
        }
      }
      if (target === -1) target = i % groupCount;
      u.forEach((m) => groups[target].push(m));
    });
  } else if (opts.mode === 'fresh') {
    // Local search: minimize repeat pairings first, handicap spread second,
    // but never let the spread blow past a cap - fresh faces should not come
    // at the price of lopsided groups.
    const improveFresh = (gs: ApiMember[][]) => {
      let bestCost = pairCost(gs);
      let bestSpread = avgSpread(gs);
      const spreadCap = Math.max(bestSpread, 2.0);
      let improved = true;
      let guard = 0;
      while (improved && guard++ < 200) {
        improved = false;
        outer: for (let a = 0; a < gs.length; a++) {
          for (let b = a + 1; b < gs.length; b++) {
            for (let i = 0; i < gs[a].length; i++) {
              for (let j = 0; j < gs[b].length; j++) {
                const ma = gs[a][i], mb = gs[b][j];
                if (lockedIds.has(ma.id) || lockedIds.has(mb.id)) continue;
                if (apartClash(ma, gs[b].filter((x) => x.id !== mb.id))) continue;
                if (apartClash(mb, gs[a].filter((x) => x.id !== ma.id))) continue;
                [gs[a][i], gs[b][j]] = [mb, ma];
                const c = pairCost(gs), s = avgSpread(gs);
                if (s <= spreadCap && (c < bestCost - 1e-9 || (Math.abs(c - bestCost) <= 1e-9 && s < bestSpread - 1e-9))) {
                  bestCost = c; bestSpread = s; improved = true; break outer;
                }
                [gs[a][i], gs[b][j]] = [ma, mb];
              }
            }
          }
        }
      }
      return { cost: bestCost, spread: bestSpread };
    };
    const sortedUnits = [...units].sort((a, b) => unitAvg(a) - unitAvg(b));
    let bestGroups = snakeDeal(sortedUnits);
    let bestScore = improveFresh(bestGroups);
    // random restarts escape local optima cheaply at this roster size
    for (let r = 0; r < 10; r++) {
      const candidate = snakeDeal(shuffled(sortedUnits, rng));
      const score = improveFresh(candidate);
      if (score.cost < bestScore.cost || (score.cost === bestScore.cost && score.spread < bestScore.spread)) {
        bestGroups = candidate; bestScore = score;
      }
    }
    groups = bestGroups;
  } else {
    // average / sum
    const sortedUnits = [...units].sort((a, b) => unitAvg(a) - unitAvg(b));
    groups = snakeDeal(sortedUnits);
    swapPass(groups, {
      metric: (g) =>
        opts.mode === 'sum'
          ? g.reduce((s, m) => s + m.handicap, 0)
          : g.length ? g.reduce((s, m) => s + m.handicap, 0) / g.length : 0,
      movable: (m) => !lockedIds.has(m.id),
      apartClash, unitOf,
    });
  }

  repairApart(groups, apart, lockedIds, apartClash);
  if (opts.genderMix) genderPass(groups, opts.mode, lockedIds, apartClash, history, pairCost, avgSpread);

  const metricOf = (g: ApiMember[]) =>
    opts.mode === 'sum'
      ? g.reduce((s, m) => s + m.handicap, 0)
      : g.length ? g.reduce((s, m) => s + m.handicap, 0) / g.length : 0;
  let apartViolations = 0;
  groups.forEach((g) => {
    for (let i = 0; i < g.length; i++)
      for (let j = i + 1; j < g.length; j++) if (isApart(g[i].id, g[j].id)) apartViolations++;
  });

  const reasoningByMode: Record<GroupingMode, string> = {
    average: '평균 핸디캡이 비슷해지도록 스네이크 배정 후 교환 보정했습니다.',
    sum: '핸디캡 합계가 비슷해지도록 스네이크 배정 후 교환 보정했습니다.',
    abcd: '핸디캡 4등급(A/B/C/D)으로 나눠 조마다 등급별로 추첨하고, 같은 등급끼리 교환해 평균을 다듬었습니다.',
    fresh: history.size
      ? '지난 라운드·일정에서 같은 조였던 조합을 최대한 피해서 편성했습니다.'
      : '참고할 지난 기록이 없어 핸디캡 균형 위주로 편성했습니다.',
    random: '무작위로 편성했습니다. 실력 균형이 필요하면 핸디캡 균형 모드를 쓰세요.',
  };

  // distinct pairs in the result that have any shared history
  let repeatPairs = 0;
  groups.forEach((g) => {
    for (let i = 0; i < g.length; i++)
      for (let j = i + 1; j < g.length; j++) if ((history.get(pairKey(g[i].id, g[j].id)) ?? 0) > 0) repeatPairs++;
  });

  return {
    groups: groups.map((g, i) => ({ groupName: `${i + 1}조`, players: g, metricValue: metricOf(g) })),
    reasoning: reasoningByMode[opts.mode],
    repeatPairs,
    apartViolations,
  };
}

/** Generic swap pass narrowing the spread of `metric` across groups. */
function swapPass(
  groups: ApiMember[][],
  cfg: {
    metric: (g: ApiMember[]) => number;
    movable: (m: ApiMember) => boolean;
    canSwap?: (a: ApiMember, b: ApiMember) => boolean;
    apartClash: (m: ApiMember, g: ApiMember[]) => boolean;
    unitOf: Map<number, ApiMember[]>;
  },
) {
  const spread = () => {
    const vals = groups.map(cfg.metric);
    return Math.max(...vals) - Math.min(...vals);
  };
  let best = spread();
  let improved = true;
  let guard = 0;
  while (improved && guard++ < 100) {
    improved = false;
    outer: for (let a = 0; a < groups.length; a++) {
      for (let b = a + 1; b < groups.length; b++) {
        for (let i = 0; i < groups[a].length; i++) {
          for (let j = 0; j < groups[b].length; j++) {
            const ma = groups[a][i], mb = groups[b][j];
            if (!cfg.movable(ma) || !cfg.movable(mb)) continue;
            if (cfg.canSwap && !cfg.canSwap(ma, mb)) continue;
            if (cfg.apartClash(ma, groups[b].filter((x) => x.id !== mb.id))) continue;
            if (cfg.apartClash(mb, groups[a].filter((x) => x.id !== ma.id))) continue;
            [groups[a][i], groups[b][j]] = [mb, ma];
            const s = spread();
            if (s < best - 1e-9) { best = s; improved = true; break outer; }
            [groups[a][i], groups[b][j]] = [ma, mb];
          }
        }
      }
    }
  }
}

/** Try to separate apart-pairs that construction left together. */
function repairApart(
  groups: ApiMember[][],
  apart: [number, number][],
  lockedIds: Set<number>,
  apartClash: (m: ApiMember, g: ApiMember[]) => boolean,
) {
  for (let attempt = 0; attempt < 3; attempt++) {
    let anyViolation = false;
    for (const [x, y] of apart) {
      const gi = groups.findIndex((g) => g.some((m) => m.id === x) && g.some((m) => m.id === y));
      if (gi === -1) continue;
      anyViolation = true;
      const g = groups[gi];
      const movableMember = [x, y].find((id) => !lockedIds.has(id));
      if (movableMember === undefined) continue;
      const member = g.find((m) => m.id === movableMember)!;
      let bestSwap: { gj: number; j: number; delta: number } | null = null;
      for (let gj = 0; gj < groups.length; gj++) {
        if (gj === gi) continue;
        for (let j = 0; j < groups[gj].length; j++) {
          const other = groups[gj][j];
          if (lockedIds.has(other.id)) continue;
          if (apartClash(member, groups[gj].filter((_, k) => k !== j))) continue;
          if (apartClash(other, g.filter((m) => m.id !== member.id))) continue;
          const delta = Math.abs(other.handicap - member.handicap);
          if (!bestSwap || delta < bestSwap.delta) bestSwap = { gj, j, delta };
        }
      }
      if (bestSwap) {
        const other = groups[bestSwap.gj][bestSwap.j];
        g[g.indexOf(member)] = other;
        groups[bestSwap.gj][bestSwap.j] = member;
      }
    }
    if (!anyViolation) break;
  }
}

/**
 * Nudge groups toward an even female ratio. Guarded per mode so the pass
 * cannot wreck what the mode optimized: balance modes keep their spread
 * within +0.5 strokes, fresh keeps its repeat cost and stays within
 * +1.0 strokes of spread, random is unguarded.
 */
function genderPass(
  groups: ApiMember[][],
  mode: GroupingMode,
  lockedIds: Set<number>,
  apartClash: (m: ApiMember, g: ApiMember[]) => boolean,
  history: Map<string, number>,
  pairCost: (gs: ApiMember[][]) => number,
  avgSpread: (gs: ApiMember[][]) => number,
) {
  const all = groups.flat();
  const totalFemale = all.filter(isFemale).length;
  if (!all.length || !totalFemale) return;
  const expected = (g: ApiMember[]) => (totalFemale / all.length) * g.length;
  const imbalance = () =>
    groups.reduce((s, g) => s + Math.abs(g.filter(isFemale).length - expected(g)), 0);
  const baseSpread = avgSpread(groups);
  const baseCost = pairCost(groups);
  let best = imbalance();
  let improved = true;
  let guard = 0;
  while (improved && guard++ < 50) {
    improved = false;
    outer: for (let a = 0; a < groups.length; a++) {
      for (let b = a + 1; b < groups.length; b++) {
        for (let i = 0; i < groups[a].length; i++) {
          for (let j = 0; j < groups[b].length; j++) {
            const ma = groups[a][i], mb = groups[b][j];
            if (isFemale(ma) === isFemale(mb)) continue;
            if (lockedIds.has(ma.id) || lockedIds.has(mb.id)) continue;
            if (apartClash(ma, groups[b].filter((x) => x.id !== mb.id))) continue;
            if (apartClash(mb, groups[a].filter((x) => x.id !== ma.id))) continue;
            [groups[a][i], groups[b][j]] = [mb, ma];
            const imb = imbalance();
            let ok = imb < best - 1e-9;
            if (ok && (mode === 'average' || mode === 'sum' || mode === 'abcd')) ok = avgSpread(groups) <= baseSpread + 0.5;
            if (ok && mode === 'fresh') ok = pairCost(groups) <= baseCost && avgSpread(groups) <= baseSpread + 1.0;
            if (ok) { best = imb; improved = true; break outer; }
            [groups[a][i], groups[b][j]] = [ma, mb];
          }
        }
      }
    }
  }
  void history;
}

/**
 * Build the history pair-weight map from recorded rounds and saved schedules.
 * Saved schedule groups are exact foursomes: weight 1 per occurrence.
 * A round session only proves the pair played the same outing (its real
 * foursomes are not recorded), so it contributes the probability that the
 * pair actually shared a group: 3 / (sessionSize - 1) for 4-player groups.
 */
export function buildHistoryPairs(
  rounds: { players: { memberId: number | null }[] }[],
  schedules: { groups?: { members?: { id: number }[] }[] }[],
): Map<string, number> {
  const map = new Map<string, number>();
  const addGroup = (ids: number[], weight: number) => {
    for (let i = 0; i < ids.length; i++)
      for (let j = i + 1; j < ids.length; j++) {
        const k = pairKey(ids[i], ids[j]);
        map.set(k, (map.get(k) ?? 0) + weight);
      }
  };
  rounds.forEach((r) => {
    const ids = r.players.map((p) => p.memberId).filter((x): x is number => x != null);
    if (ids.length > 1) addGroup(ids, 3 / (ids.length - 1));
  });
  schedules.forEach((s) => (s.groups ?? []).forEach((g) => addGroup((g.members ?? []).map((m) => m.id), 1)));
  return map;
}

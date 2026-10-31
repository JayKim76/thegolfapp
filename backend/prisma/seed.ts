import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Read data from JSON file
    const dataPath = path.join(__dirname, 'seed-data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(rawData);

    // Clear existing data
    // Delete in order to avoid foreign key constraints
    await prisma.round.deleteMany();
    await prisma.roundSession.deleteMany();
    await prisma.group.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.member.deleteMany();
    await prisma.club.deleteMany();

    // Single-club model: one club (모임), one admin managing every member.
    const club = await prisma.club.create({
        data: { id: 1, name: 'EagleView 골프 모임', description: '관리자가 전체 회원을 관리하는 단일 모임' }
    });
    console.log(`Created club: ${club.name} (id=${club.id})`);

    console.log('Cleared existing data.');

    // Import Members
    console.log(`Importing ${data.members.length} members...`);
    for (const m of data.members) {
        const genderReq = m.gender === '남' ? 'male' : 'female';
        await prisma.member.create({
            data: {
                id: m.id, // Use explicit ID to match scores
                clubId: club.id,
                name: m.name,
                email: `user${m.id}@example.com`, // Synthetic email
                phone: m.phone,
                handicap: m.handicap, // Float
                gender: genderReq,
                type: 'Regular',
                status: 'active',
                joinDate: new Date(), // Default to now
            }
        });
    }

    // Import Scores (Rounds): one RoundSession per date, one Round per player
    if (data.scores && data.scores.length > 0) {
        console.log(`Importing ${data.scores.length} scores...`);
        const byDate = new Map<string, any[]>();
        for (const s of data.scores) {
            if (!data.members.find((m: any) => m.id === s.member_id)) continue;
            if (!byDate.has(s.date)) byDate.set(s.date, []);
            byDate.get(s.date)!.push(s);
        }
        for (const [date, scores] of byDate) {
            const session = await prisma.roundSession.create({ data: { date } });
            await prisma.round.createMany({
                data: scores.map((s: any) => ({
                    sessionId: session.id,
                    memberId: s.member_id,
                    date: s.date,
                    score: s.score,
                })),
            });
        }
        console.log(`Created ${byDate.size} round sessions.`);
    }

    // Postgres: explicit ids (club 1, member ids from the data file) do not
    // advance SERIAL sequences. Without this, the first API-created member
    // would collide with a seeded id. (SQLite handled this automatically.)
    try {
        await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Club"', 'id'), (SELECT MAX(id) FROM "Club"))`);
        await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Member"', 'id'), (SELECT MAX(id) FROM "Member"))`);
        console.log('Sequences advanced past seeded ids.');
    } catch {
        // Non-Postgres datasource: nothing to do.
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

#!/usr/bin/env bash
# Backs up the SQLite database (backend/prisma/dev.db) with a timestamp.
# Uses sqlite3's .backup when available (safe while the server runs);
# otherwise falls back to a plain copy (run at a quiet time).
# Keeps the newest 14 backups in backend/backups/.
set -euo pipefail
cd "$(dirname "$0")/.."

DB="prisma/dev.db"
DEST_DIR="backups"
KEEP=14

if [ ! -f "$DB" ]; then
  echo "DB not found: $DB" >&2
  exit 1
fi

mkdir -p "$DEST_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
DEST="$DEST_DIR/dev-$STAMP.db"

if command -v sqlite3 >/dev/null 2>&1; then
  sqlite3 "$DB" ".backup '$DEST'"
else
  cp "$DB" "$DEST"
  echo "note: sqlite3 CLI not found, used plain file copy."
fi

echo "backup created: $DEST"

# Prune old backups, keep the newest $KEEP
ls -1t "$DEST_DIR"/dev-*.db 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -f

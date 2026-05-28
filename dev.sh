#!/usr/bin/env bash
# Launch the Vorarlberg Peaks dev environment in tmux.
# Usage: ./dev.sh [session-name]
#   Attach if the session already exists.

SESSION="${1:-peaks}"
ROOT="$(cd "$(dirname "$0")" && pwd)"

if tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "Session '$SESSION' already exists — attaching."
  tmux attach-session -t "$SESSION"
  exit 0
fi

# Window 1 — dev servers (split vertically: API left | Web right)
tmux new-session  -d -s "$SESSION" -n "dev" -c "$ROOT"
tmux send-keys    -t "$SESSION:dev" "pnpm --filter api start:dev" Enter
tmux split-window -h -t "$SESSION:dev" -c "$ROOT"
tmux send-keys    -t "$SESSION:dev" "pnpm --filter web dev" Enter

# Window 2 — shell / migrations / prisma studio
tmux new-window   -t "$SESSION" -n "shell" -c "$ROOT"

# Focus back on the dev window, left pane (API)
tmux select-window -t "$SESSION:dev"
tmux select-pane   -t "$SESSION:dev.1"

tmux attach-session -t "$SESSION"

#!/usr/bin/env bash
set -e

echo "Menyiapkan pnpm dan dependensi SafeZone..."
corepack enable
pnpm install

echo "Memasang Antigravity CLI (agy) untuk kendali jarak jauh..."
if ! command -v agy &> /dev/null; then
  curl -fsSL https://antigravity.google/cli/install.sh | bash || true
fi

export PATH="$HOME/.local/bin:$PATH"
if ! grep -q '.local/bin' "$HOME/.bashrc" 2>/dev/null; then
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
fi

echo "Selesai! Ketik: pnpm remote (atau agy --remote-control) untuk mulai dari HP Android."

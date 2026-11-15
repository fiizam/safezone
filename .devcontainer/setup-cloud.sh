#!/usr/bin/env bash
set -e

echo "Menyiapkan pnpm dan dependensi SafeZone..."
corepack enable
pnpm install

echo "Memasang Antigravity CLI (agy) resmi untuk Linux..."
mkdir -p "$HOME/.local/bin"
AGY_URL=$(curl -fsSL "https://antigravity-cli-auto-updater-974169037036.us-central1.run.app/manifests/linux_amd64.json" | grep -o '"url": *"[^"]*"' | cut -d'"' -f4)
curl -fsSL "$AGY_URL" | tar -xz -C "$HOME/.local/bin"
mv -f "$HOME/.local/bin/antigravity" "$HOME/.local/bin/agy"
chmod +x "$HOME/.local/bin/agy"
export PATH="$HOME/.local/bin:$PATH"
"$HOME/.local/bin/agy" install || true

if ! grep -q '.local/bin' "$HOME/.bashrc" 2>/dev/null; then
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
fi

echo "Selesai! Ketik: agy --remote-control untuk mulai kendali dari HP Android."

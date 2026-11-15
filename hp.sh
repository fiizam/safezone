#!/usr/bin/env bash
set -e

export PATH="$HOME/.local/bin:$HOME/.gemini/bin:$HOME/AppData/Local/agy/bin:$PATH"

if ! command -v agy >/dev/null 2>&1; then
  echo "Memasang Antigravity CLI (agy) otomatis..."
  mkdir -p "$HOME/.local/bin"
  AGY_URL=$(curl -fsSL "https://antigravity-cli-auto-updater-974169037036.us-central1.run.app/manifests/linux_amd64.json" | grep -o '"url": *"[^"]*"' | cut -d'"' -f4)
  curl -fsSL "$AGY_URL" | tar -xz -C "$HOME/.local/bin"
  mv -f "$HOME/.local/bin/antigravity" "$HOME/.local/bin/agy"
  chmod +x "$HOME/.local/bin/agy"
fi

exec agy --remote-control

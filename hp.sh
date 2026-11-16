#!/usr/bin/env bash
set -e

mkdir -p "$HOME/.local/bin"
mkdir -p "$HOME/.gemini/antigravity-cli/cache"
export PATH="$HOME/.local/bin:$HOME/.gemini/bin:$HOME/AppData/Local/agy/bin:$PATH"

# Otomatis tandai onboarding selesai agar tidak nyangkut di layar Terms of Service [Previous] / [Done] di HP
cat << 'EOF' > "$HOME/.gemini/antigravity-cli/cache/onboarding.json"
{
  "consumerOnboardingComplete": true,
  "enterpriseOnboardingComplete": false,
  "onboardingComplete": true
}
EOF

# Buat jembatan xdg-open agar GitHub Codespaces otomatis membuka link di browser HP
cat << 'EOF' > "$HOME/.local/bin/xdg-open"
#!/usr/bin/env bash
echo ""
echo "=========================================="
echo "BUKA LINK INI DI BROWSER HP:"
echo "$1"
echo "=========================================="
echo ""
if [ -n "$BROWSER" ]; then
  "$BROWSER" "$@" >/dev/null 2>&1 || true
fi
EOF
chmod +x "$HOME/.local/bin/xdg-open"

if ! command -v agy >/dev/null 2>&1; then
  echo "Memasang Antigravity CLI (agy) otomatis..."
  AGY_URL=$(curl -fsSL "https://antigravity-cli-auto-updater-974169037036.us-central1.run.app/manifests/linux_amd64.json" | grep -o '"url": *"[^"]*"' | cut -d'"' -f4)
  curl -fsSL "$AGY_URL" | tar -xz -C "$HOME/.local/bin"
  mv -f "$HOME/.local/bin/antigravity" "$HOME/.local/bin/agy"
  chmod +x "$HOME/.local/bin/agy"
fi

echo "Menyalakan Web Chat Antigravity Mobile Remote (Port 3030)..."
exec node scripts/remote-ui.mjs

{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.pnpm
    pkgs.curl
  ];
  idx = {
    extensions = [
      "Vue.volar"
      "bradlc.vscode-tailwindcss"
    ];
    workspace = {
      onCreate = {
        setup = "pnpm install && (curl -fsSL https://antigravity.google/cli/install.sh | bash || true)";
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["pnpm" "dev" "--port" "$PORT" "--host" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}

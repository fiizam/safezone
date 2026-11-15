{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.pnpm
    pkgs.curl
    pkgs.gnutar
    pkgs.gzip
  ];
  idx = {
    extensions = [
      "Vue.volar"
      "bradlc.vscode-tailwindcss"
    ];
    workspace = {
      onCreate = {
        setup = "pnpm install && bash .devcontainer/setup-cloud.sh";
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

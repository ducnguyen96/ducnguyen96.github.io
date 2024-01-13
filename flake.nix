{
  description = "nodejs_20 devShell";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {
          inherit system;
        };
      in rec {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            nodePackages.yarn
          ];

          shellHook = ''
            export PATH="./node_modules/.bin:$PATH"
          '';
        };
      }
    );
}

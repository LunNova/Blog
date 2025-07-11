# SPDX-FileCopyrightText: 2025 LunNova
#
# SPDX-License-Identifier: MIT

{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-25.05";
    flake-utils.url = "github:numtide/flake-utils";
    pre-commit-hooks = {
      url = "github:cachix/pre-commit-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    rust-overlay.inputs.nixpkgs.follows = "nixpkgs";
    rust-overlay.url = "github:oxalica/rust-overlay";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      pre-commit-hooks,
      rust-overlay,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs {
          inherit system overlays;
        };
        rust-bin = pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
        rustfmt = pkgs.lib.getExe' rust-bin "rustfmt";
      in
      {
        checks = {
          pre-commit-check = pre-commit-hooks.lib.${system}.run {
            src = ./.;
            hooks = {
              statix.enable = true;
              nixfmt-rfc-style.enable = true;
              deadnix.enable = true;
              rustfmt = {
                enable = true;
                entry = "rustfmt --config-path ${./rustfmt.toml}";
                package = rust-bin;
              };
            };
          };
        };
        formatter = pkgs.treefmt.withConfig {
          runtimeInputs = with pkgs; [
            nixfmt-rfc-style
            rust-bin
          ];
          settings = {
            tree-root-file = ".git/index";
            formatter = {
              nixfmt = {
                command = "nixfmt";
                includes = [ "*.nix" ];
              };
              rustfmt = {
                command = "rustfmt";
                options = pkgs.lib.mkForce [
                  "--config-path"
                  ./rustfmt.toml
                ];
                includes = [ "*.rs" ];
              };
            };
          };
        };
        devShells.default = pkgs.mkShell {
          inherit (self.checks.${pkgs.system}.pre-commit-check) shellHook;

          buildInputs = [
            pkgs.sass
            pkgs.swc
            pkgs.cargo-modules
            pkgs.cargo-nextest
            pkgs.cargo-expand
            pkgs.cargo-release
            pkgs.cargo-workspaces
            pkgs.cargo-machete
            pkgs.reuse
            rust-bin
          ];

          # Set strict miri flags for memory safety validation
          MIRIFLAGS = "-Zmiri-strict-provenance -Zmiri-symbolic-alignment-check -Zmiri-tree-borrows";
        };
      }
    );
}

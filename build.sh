#!/usr/bin/env bash
set -euo pipefail
[ -d public ] && rm -rf public
nix run nixpkgs#zola -- build
nix run nixpkgs#minify -- --html-keep-comments --html-keep-whitespace --html-keep-end-tags --html-keep-document-tags -r -o public/ public/

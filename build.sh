#!/usr/bin/env bash
set -euo pipefail
[ -d public ] && rm -rf public
nix run pkgs#zola -- build
nix run pkgs#minify -- --html-keep-comments --html-keep-whitespace --html-keep-end-tags --html-keep-document-tags -r -o public/ public/

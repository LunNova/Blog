#!/usr/bin/env bash
set -euo pipefail
[ -d public ] && rm -rf public

swc compile --config-file .swcrc static/bsky-comments.jsx --out-dir ./
sass --sourcemap=none theme/sass/theme.scss theme/static/theme.css
cargo run --manifest-path ~/sync/dev/lun/rust-monorepo/site/Cargo.toml --release -- render . public/
nix run nixpkgs#minify -- --html-keep-comments --html-keep-whitespace --html-keep-end-tags --html-keep-document-tags \
  --match="*.html" --match="*.css" --match="*.js" \
  -r -o public/ public/

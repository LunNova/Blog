#!/usr/bin/env nix-shell
#!nix-shell -i bash -p typst python3 jq coreutils optipng imagemagick
# https://lunnova.dev/articles/typst-opengraph-embed/
set -euo pipefail

[ $# -ne 1 ] && { echo "Usage: $0 <article.md>" >&2; exit 1; }
ARTICLE_PATH="$1"
[ ! -f "$ARTICLE_PATH" ] && { echo "Error: File not found: $ARTICLE_PATH" >&2; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$SCRIPT_DIR/og-template"

FRONTMATTER=$(awk '/^\+\+\+$/{flag=!flag;next}flag' "$ARTICLE_PATH")
[ -z "$FRONTMATTER" ] && { echo "Error: No frontmatter in $ARTICLE_PATH" >&2; exit 1; }

FRONTMATTER_JSON=$(echo "$FRONTMATTER" | python3 "$TEMPLATE_DIR/parse-toml.py" /dev/stdin)
[ -z "$FRONTMATTER_JSON" ] && { echo "Error: Failed to parse frontmatter" >&2; exit 1; }

TITLE=$(echo "$FRONTMATTER_JSON" | jq -r '.title // empty')
[ -z "$TITLE" ] && { echo "Error: No title in frontmatter" >&2; exit 1; }

DESCRIPTION=$(echo "$FRONTMATTER_JSON" | jq -r '.description // empty')
DATE=$(echo "$FRONTMATTER_JSON" | jq -r '.date // empty')
TAGS=$(echo "$FRONTMATTER_JSON" | jq -c '(.tags // .taxonomies.tags // []) | sort')

RELATIVE_PATH=$(realpath --relative-to="$SCRIPT_DIR" "$ARTICLE_PATH")
HASH=$(echo -n "$RELATIVE_PATH" | sha256sum | cut -d' ' -f1)
CROP_X=$((16#${HASH:0:8} % 316))
CROP_Y=$((16#${HASH:8:8} % 1525))

[[ "$ARTICLE_PATH" == *.md ]] || { echo "Error: Must be .md file" >&2; exit 1; }
OUTPUT_PATH="$(dirname "$ARTICLE_PATH")"/og-image.png

DATA_JSON=$(jq -n \
    --arg title "$TITLE" \
    --arg description "$DESCRIPTION" \
    --arg date "$DATE" \
    --argjson tags "$TAGS" \
    --argjson crop_x "$CROP_X" \
    --argjson crop_y "$CROP_Y" \
    '{title: $title, description: $description, date: $date, tags: $tags, crop_x: $crop_x, crop_y: $crop_y}')

echo "Generating: '$TITLE' → $OUTPUT_PATH"
set -x

pushd "$TEMPLATE_DIR" >/dev/null
TEMP_2X=$(mktemp --suffix=.png)
trap "rm -f $TEMP_2X" EXIT

typst compile --format png --input "data=$DATA_JSON" template.typ "$TEMP_2X"
popd >/dev/null
magick "$TEMP_2X" -resize 1200x630 -quality 95 "$OUTPUT_PATH"
optipng -quiet -strip all "$OUTPUT_PATH"

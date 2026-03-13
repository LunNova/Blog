#!/usr/bin/env bash
# Batch generate OG images for all non-draft articles
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/static/og-images/articles"

find "$SCRIPT_DIR/content/articles" -name "*.md" | while read -r md_file; do
	# Determine slug
	if [[ "$(basename "$md_file")" == "index.md" ]]; then
		slug=$(basename "$(dirname "$md_file")")
	else
		slug=$(basename "$md_file" .md)
	fi

	# Skip section index pages
	# TODO: generate a proper custom OG image for the articles index
	if [[ "$(basename "$md_file")" == "_index.md" ]]; then
		continue
	fi

	if [[ -f "$OUTPUT_DIR/$slug.png" ]]; then
		echo "Skipping $slug (exists)"
		continue
	fi

	if grep -qE '^(draft|stub) = true' "$md_file"; then
		echo "Skipping $slug (draft/stub)"
		continue
	fi

	"$SCRIPT_DIR/generate-og-image.sh" "$md_file"
done

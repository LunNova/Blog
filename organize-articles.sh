#!/usr/bin/env bash
# organize articles by year
set -eu
cd "$(dirname "$0")"/content/articles

DRY=echo
[ "${1:-}" = -x ] && DRY=

mkdir -p _2021 _2022 _2023 _2024 _2025

year() { grep -m1 '^date' "$1" | grep -oE '[0-9]{4}' || :; }

# move <index_file> <current_year> <item_to_move>
move() {
	y=$(year "$1")
	[ -z "$y" ] && { echo "# no date: $1"; return; }
	[ "$y" -lt 2021 ] && y=2021
	[ "$y" -gt 2025 ] && y=2025
	[ "$2" = "$y" ] && return
	$DRY mv "${3%/}" "_$y/"
}

for d in */; do
	case $d in _*) continue;; esac
	[ -f "${d}index.md" ] && move "${d}index.md" "" "$d"
done

for f in *.md; do
	[ "$f" = _index.md ] && continue
	[ -f "$f" ] && move "$f" "" "$f"
done

for yd in _20*/; do
	cur=${yd:1:4}
	for d in "$yd"*/; do
		[ -f "${d}index.md" ] && move "${d}index.md" "$cur" "$d"
	done
	for f in "$yd"*.md; do
		[ -f "$f" ] && move "$f" "$cur" "$f"
	done
done

[ "$DRY" ] && echo "# dry run, -x to execute"

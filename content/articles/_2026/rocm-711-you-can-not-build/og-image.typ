// Evangelion-style OG image for "ROCm 7.11: you can (not) build"
// nix-shell -p corefonts typst imagemagick optipng --run 'typst compile --format png og-image.typ /tmp/rocm-og-2x.png && magick /tmp/rocm-og-2x.png -resize 1200x630 -quality 95 og-image.png && optipng -quiet -strip all og-image.png && rm /tmp/rocm-og-2x.png'

#let width = 1200pt
#let height = 630pt
#let eva-red = rgb("#d32f2f")
#let dot-red = rgb("#d32f2f").transparentize(70%)
#let bg-dark = rgb("#0a0a0a")
#let pad = 40pt
#let serif = ("Times New Roman", "TeX Gyre Termes", "Liberation Serif", "DejaVu Serif")
#let sans = ("TeX Gyre Adventor", "SF Pro Display", "DejaVu Sans")

#set page(width: width, height: height, margin: 0pt)
#set text(font: "CaskaydiaCove NF", fill: white)

// Dark reddish-black background
#place(left + top, rect(width: width, height: height, fill: bg-dark))

// Red accent bar — left edge
#place(left + top, rect(width: 8pt, height: height, fill: eva-red))

// Embossed "m" shadow — red, offset down-right, behind main text
#place(left + top, dx: pad + 12pt, dy: 30pt + 8pt,
  scale(x: 79%, origin: left + top,
    text(font: serif, size: 170pt, weight: "bold", fill: eva-red)[#hide[ROC]m]
  )
)

// "ROCm" — bold condensed serif, 79% horizontal scaling (matches article CSS)
#place(left + top, dx: pad, dy: 30pt,
  scale(x: 79%, origin: left + top,
    text(font: serif, size: 170pt, weight: "bold", "ROCm")
  )
)

// ":7.1.1" — red condensed serif, dots at 30% opacity
#place(left + top, dx: pad, dy: 190pt,
  scale(x: 79%, origin: left + top,
    text(font: serif, size: 120pt, weight: "bold", fill: eva-red)[:7.1#text(fill: dot-red)[.]1]
  )
)

// Faint htop CPU bars bleeding through the background
#let htop-green-base = rgb("#33d17a")
#let htop-red-base = rgb("#e05050")
#let htop-dim-base = rgb("#888888")
#let bar-size = 24pt
#let bar-max = 30
#let bar-base-fade = 1%
#let bar(id, green-n, pct, idx) = {
  let fade = bar-base-fade + idx * 4%
  let pad-n = bar-max - green-n - 2
  text(font: "Unifont", size: bar-size, fill: htop-dim-base.transparentize(fade))[#id\[]
  text(font: "Unifont", size: bar-size, fill: htop-green-base.transparentize(fade), "|" * green-n)
  text(font: "Unifont", size: bar-size, fill: htop-red-base.transparentize(fade), "|" * 2)
  text(font: "Unifont", size: bar-size, fill: htop-dim-base.transparentize(fade), " " * pad-n + pct + "]")
}
#place(left + top, dx: 600pt, dy: -20pt,
  block(width: 750pt, spacing: 4pt, {
    bar(" 0", 28, "100.0%",  0); linebreak()
    bar(" 1", 27, " 99.2%",  1); linebreak()
    bar(" 2", 28, " 99.8%",  2); linebreak()
    bar(" 3", 28, "100.0%",  3); linebreak()
    bar(" 4", 26, " 97.5%",  4); linebreak()
    bar(" 5", 28, "100.0%",  5); linebreak()
    bar(" 6", 27, " 99.6%",  6); linebreak()
    bar(" 7", 28, "100.0%",  7); linebreak()
    bar(" 8", 27, " 98.9%",  8); linebreak()
    bar(" 9", 28, "100.0%",  9); linebreak()
    bar("10", 28, " 99.7%", 10); linebreak()
    bar("11", 26, " 97.1%", 11); linebreak()
    bar("12", 28, "100.0%", 12); linebreak()
    bar("13", 27, " 99.4%", 13); linebreak()
    bar("14", 28, "100.0%", 14); linebreak()
    bar("15", 28, " 99.9%", 15); linebreak()
    bar("16", 27, " 98.3%", 16); linebreak()
    bar("17", 28, "100.0%", 17); linebreak()
    bar("18", 28, " 99.5%", 18); linebreak()
    bar("19", 28, "100.0%", 19); linebreak()
    bar("20", 27, " 98.7%", 20); linebreak()
    bar("21", 28, "100.0%", 21); linebreak()
    bar("22", 28, " 99.3%", 22); linebreak()
    bar("23", 26, " 96.8%", 23); linebreak()
//    bar("24", 28, "100.0%", 24); linebreak()
//    bar("25", 28, " 99.9%", 25); linebreak()
//    bar("26", 27, " 98.1%", 26); linebreak()
//    bar("27", 28, "100.0%", 27); linebreak()
//    bar("28", 28, " 99.6%", 28); linebreak()
//    bar("29", 28, "100.0%", 29); linebreak()
//    bar("30", 27, " 99.4%", 30); linebreak()
//    bar("31", 28, "100.0%", 31)
  })
)

// "you can (not) build" — geometric sans, wide tracking
#place(right + top, dx: -20pt, dy: 400pt,
  //text(font: serif, size: 90pt, weight: "regular", fill: rgb("#fafafa"), tracking: 3pt,
  //  "YOU CAN (NOT) BUILD"
  //)
	scale(x: 70%, origin: right + top,
    text(font: serif, size: 120pt, weight: "bold", tracking: 3pt)[#text(fill: eva-red)[You can ]#text(fill: rgb("#fafafa"))[(not)]#text(fill: eva-red)[ build.]]
  )
)

// Footer — matches default OG template style: date left, lunnova.dev right
#place(bottom + left, dx: pad, dy: -30pt,
  block(width: width - 2 * pad,
    stack(
      dir: ltr,
      text(size: 48pt, weight: "medium", fill: rgb(140, 140, 140), "2026-02-22"),
      h(1fr),
      text(size: 48pt, weight: "semibold", fill: rgb(130, 130, 165), "lunnova.dev")
    )
  )
)

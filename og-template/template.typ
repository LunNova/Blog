// Blog OG-image template
// Generates Open Graph images for blog articles with starfield background
// https://lunnova.dev/articles/typst-opengraph-embed/

#let data = json(bytes(sys.inputs.data))

// Constants
#let width = 1200pt
#let height = 630pt
#let padding = 45pt
#let bg-width = 1515
#let bg-height = 2154

#let normalize_whitespace(text) = {
  text.replace(regex("\\s+"), " ").trim()
}

// Page setup
#set page(width: width, height: height, margin: 0pt)
#set text(font: "CaskaydiaCove NF", fill: white)

// Background with cropping
#place(left + top, block(
  width: width,
  height: height,
  clip: true,
  inset: 0pt,
  place(
    left + top,
    dx: -data.crop_x * 1pt,
    dy: -data.crop_y * 1pt,
    image("bg-full.png", width: bg-width * 1pt, height: bg-height * 1pt)
  )
))

// Title and description container
#place(left + top, dx: padding, dy: padding, block(
  width: width - 2 * padding,
  height: height - 2 * padding,
  {
    // Semi-transparent dark container behind title and description
    place(left + top, rect(
      width: 100%,
      fill: rgb(0, 0, 0, 65%),
      radius: 8pt,
      inset: 30pt,
      {
        // Title
        block(width: 100%, text(
          size: 64pt,
          weight: "bold",
          fill: white,
          data.title
        ))

        v(20pt)

        // Description
        if data.at("description", default: none) != none {
          block(width: 100%, text(
            size: 36pt,
            weight: "regular",
            fill: rgb(220, 220, 220),
            normalize_whitespace(data.description)
          ))
        }
      }
    ))

    // Footer with tags, date and branding
    place(bottom + left, stack(
      dir: ttb,
      spacing: 10pt,
      {
        // Tags
        if data.at("tags", default: ()).len() > 0 {
          block({
            for (i, tag) in data.tags.enumerate() {
              if i > 0 { h(8pt) }
              box(
                fill: rgb(180, 180, 220, 30%),
                radius: 4pt,
                inset: (x: 8pt, y: 8pt),
                text(
                  size: 36pt,
                  weight: "medium",
                  fill: rgb(200, 200, 230),
                  "#" + tag
                )
              )
            }
          })
        }
      },
      {
        // Date and branding
        stack(
          dir: ltr,
          text(size: 48pt, weight: "medium", fill: rgb(200, 200, 200), data.date),
          h(1fr),
          text(size: 48pt, weight: "semibold", fill: rgb(180, 180, 220), "lunnova.dev")
        )
      }
    ))
  }
))

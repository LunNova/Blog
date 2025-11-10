+++
title = "Dynamic starfield-ish background with CSS and SVG"
date = 2025-11-08
description = "Snippets for a simple starfield backdrop that changes on each page"

embed_image = "/articles/starfieldish-background/og-image.png"

tags = ["lunnova.dev-meta", "webdev"]
+++

<figure>

<div class="comparison-slider">
  <img src="./page1.png" alt="Before comparison" />
  <div class="img-wrapper">
    <img src="./page2.png" alt="After comparison" />
  </div>
  <div class="slider-control"></div>
  <input type="range" min="0" max="100" value="50" aria-label="Image comparison slider" />
</div>

<figcaption>

Comparison of the same area on two different pages (drag to compare)

</figcaption>
</figure><br>

The background starfield on lunnova.dev updates slightly when changing pages; it's actually the same repeating SVG patterns viewed from different positions.

Fixed background galaxies represented by static dots juxtaposed with changing closer dot and gradients tries to give the impression of moving within a nebula.

- Distinct tile sizes create a large non-repeating composite pattern period, although each tile's repeats are visible if you look closely
- Opposite anchors against the full viewport: `top-left` vs `bottom-right` means different article heights reveal different portions of the tiled patterns

### Implementation layer 1: html element

- SVG tiled at 607×613px
- Anchored to `left top`
- Lots of stars, varying sizes (0.5-2px) and colors

```html
  <g opacity='0.7'>
    <circle cx='80' cy='80' r='2' fill='#ffffff'/>
    <circle cx='320' cy='240' r='1' fill='#7ee8e3'/>
    <circle cx='600' cy='160' r='2' fill='#ffffff'/>
    <circle cx='240' cy='480' r='1' fill='#6b5cb7'/>
    <circle cx='720' cy='600' r='1.6' fill='#7ee8e3'/>
    <!-- ... more stars -->
  </g>
```

```css
html {
  background: url("data:image/svg+xml,...") repeat left top / 607px 613px,
    /* gradient layers below. it's nebula time! */
}
```

### Implementation layer 2: body element

- SVG tiled at 373×373px
- Anchored to `right bottom`
- Fewer stars, sparser distribution

```html
  <g opacity='0.6'>
    <circle cx='51' cy='89' r='1' fill='#ffffff'/>
    <circle cx='173' cy='234' r='0.8' fill='#7ee8e3'/>
    <circle cx='298' cy='67' r='1.2' fill='#ffffff'/>
    <circle cx='89' cy='298' r='0.6' fill='#5ecbcd'/>
    <!-- ... more stars -->
  </g>
```

```css
body {
  background: transparent url("data:image/svg+xml,...");
  background-size: 373px 373px;
  background-position: right bottom;
}
```

### Implementation layer 3: body::after element

You get the idea! Another layer with a distinct size, and this time `background-position: calc(13vw + 47px) calc(19vh + 83px);` to make its position unique with the other tiles as the viewport changes.

<style>
.comparison-slider {
  position: relative;
  max-width: 800px;
  overflow: hidden;
  border-radius: 8px;

  img {
    display: block;
    width: 100%;
    height: auto;
    user-select: none;
    -webkit-user-drag: none;
  }

  .img-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--slider-value, 50%);
    height: 100%;
    overflow: hidden;
    z-index: 2;

    img {
      width: 800px;
      max-width: none;
    }
  }

  .slider-control {
    position: absolute;
    top: 0;
    left: var(--slider-value, 50%);
    transform: translateX(-50%);
    width: 4px;
    height: 100%;
    background: white;
    z-index: 3;
    pointer-events: none;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);

    &::before {
      content: '⬌';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      color: #333;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      pointer-events: auto;
      cursor: ew-resize;
    }
  }

  input[type="range"] {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 100%;
    height: 40px;
    opacity: 0;
    cursor: ew-resize;
    z-index: 4;
    margin: 0;
  }
}
</style>

<script>
(function() {
  const slider = document.querySelector('.comparison-slider');
  const input = slider.querySelector('input[type="range"]');

  input.addEventListener('input', () => {
    slider.style.setProperty('--slider-value', input.value + '%');
  });

  slider.style.setProperty('--slider-value', input.value + '%');
})();
</script>

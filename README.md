# Theme Toggle Widget — starter

A framework-free embeddable theme toggle with segmented, cycle, and switch variants.

## Test locally
Keep `theme-toggle.js` and `demo.html` in the same folder and open `demo.html` in a browser (or use a local static server).

## Embed on another website
First publish `theme-toggle.js` to a public HTTPS host, then add:

```html
<script src="https://YOUR-PUBLIC-HOST/theme-toggle.js" defer></script>
<div data-theme-toggle data-variant="switch"></div>
```

Variants: `segmented`, `cycle`, `switch`.

Optional attributes:

```html
<div data-theme-toggle data-variant="segmented" data-modes="light,dark,system" data-label data-size="lg"></div>
```

- `data-modes`: comma-separated modes for segmented/cycle variants.
- `data-label`: show visible labels where supported.
- `data-size`: `sm`, default, or `lg`.

## Configuration
Place this before the external script if you want to customize defaults:

```html
<script>
  window.ThemeToggleWidgetConfig = {
    storageKey: "my-site-theme",
    defaultMode: "system",
    groupLabel: "Website theme",
    labels: { light: "Light", dark: "Dark", system: "System" }
  };
</script>
<script src="https://YOUR-PUBLIC-HOST/theme-toggle.js" defer></script>
```

## Important integration note
The widget sets `data-theme="light|dark"` and `data-theme-mode="light|dark|system"` on the page's `<html>` element. The target website must have CSS or an existing theme system that responds to those attributes. The widget alone cannot recolor every arbitrary website.

## Publish with GitHub Pages
1. Create a repository and add `theme-toggle.js`, `demo.html`, and this README.
2. In repository Settings → Pages, configure publishing from your chosen branch/folder.
3. Verify the generated public HTTPS URL loads the JavaScript file.
4. Replace `https://YOUR-PUBLIC-HOST/theme-toggle.js` in the embed snippet with that real URL.

This starter does not yet have a public hosted URL; publishing it is a separate step. Check the target site's Content Security Policy before using an external script.

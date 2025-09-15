# HeadBasics Resource Hints & Preload Best Practices

This document explains how and why to use resource hints and preloads in your `<head>` for optimal performance. Use these strategies in `HeadBasics.astro` or your main layout's `<head>`.

---

## 1. Preconnect

Use for third-party resources you know you’ll use (fonts, analytics, CDN):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

---

## 2. Preload critical CSS

If you have a main CSS file that’s render-blocking, preload it:

```html
<link rel="preload" href="/path/to/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/path/to/main.css"></noscript>
```

---

## 3. Preload critical fonts

For custom fonts, preload the WOFF2 file:

```html
<link rel="preload" href="/fonts/your-font.woff2" as="font" type="font/woff2" crossorigin>
```

---

## 4. Preload hero images or above-the-fold images

If you have a large hero/banner image, preload it as you did with your logo:

```html
<link rel="preload" href="/assets/hero.webp" as="image" type="image/webp">
```

---

## 5. Preload important JS (rare, but possible)

If you have a critical JS file needed for above-the-fold interactivity, you can preload it:

```html
<link rel="preload" href="/path/to/critical.js" as="script">
```

---

## 6. Prefetch for future navigation

For resources needed on the next page (not the current one), use prefetch:

```html
<link rel="prefetch" href="/next-page.js" as="script">
```

---

## 7. Remove unused resource hints

Only add preloads for resources that are truly critical for first paint or user interaction. Too many preloads can actually slow down the page.

---

**Summary:**

- Use resource hints and preloads for what’s needed for the first screen or critical user interaction.
- Place these tags as early as possible in your `<head>` (e.g., in `HeadBasics.astro`).
- Review and remove any that are not providing measurable benefit.

---
name: "豆哥在此"
description: "Paper and Cursor appearances for Chinese and English article reading."
colors:
  paper-clay: "#c96442"
  paper-link: "#a34a2b"
  paper-link-hover: "#8f3f24"
  paper-ivory: "#faf9f5"
  paper-ink: "#141413"
  paper-muted: "#6b6860"
  paper-linen: "#f5f3ec"
  paper-border: "rgba(20, 20, 19, 0.08)"
  paper-dark-clay: "#d97757"
  paper-dark-link-hover: "#ebb09a"
  paper-dark-background: "#181816"
  paper-dark-text: "#ece9e2"
  paper-dark-surface: "#21211e"
  paper-dark-border: "rgba(236, 233, 226, 0.1)"
  cursor-link: "#735431"
  cursor-ivory: "#f7f7f2"
  cursor-ink: "#25241e"
  cursor-muted: "#66645b"
  cursor-surface: "#eeeee6"
  cursor-border: "#dfdfd5"
  cursor-dark-link: "#d8b98a"
  cursor-dark-background: "#14120b"
  cursor-dark-text: "#e8e7df"
  cursor-dark-surface: "#1c1b14"
  cursor-dark-border: "#343228"
  reading-drawer-shadow: "rgba(0, 0, 0, 0.35)"
  reading-contents-backdrop: "rgba(0, 0, 0, 0.55)"
typography:
  paper-ui:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC', 'Microsoft YaHei', sans-serif"
  paper-heading:
    fontFamily: "'Cormorant Garamond', 'Songti SC', 'Source Han Serif SC', 'Noto Serif SC', 'Georgia', serif"
    fontWeight: 600
    letterSpacing: "-0.01em"
  paper-body:
    fontFamily: "'EB Garamond', 'Songti SC', 'Source Han Serif SC', 'Noto Serif SC', 'Georgia', -apple-system, 'PingFang SC', serif"
    fontSize: "1.2rem"
    lineHeight: 1.88
  paper-body-lora:
    fontFamily: "'Lora', 'Songti SC', 'Source Han Serif SC', 'Noto Serif SC', 'Georgia', -apple-system, 'PingFang SC', serif"
    fontSize: "1.08rem"
    lineHeight: 1.88
  paper-body-crimson:
    fontFamily: "'Crimson Pro', 'Songti SC', 'Source Han Serif SC', 'Noto Serif SC', 'Georgia', -apple-system, 'PingFang SC', serif"
    fontSize: "1.15rem"
    lineHeight: 1.86
  cursor-headline:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Noto Sans SC', sans-serif"
    fontSize: "clamp(1.8rem, 2.8vw, 2.6rem)"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.03em"
  cursor-title:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Noto Sans SC', sans-serif"
    fontSize: "clamp(1.2rem, 1.5vw, 1.5rem)"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "-0.025em"
  cursor-body:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Noto Sans SC', sans-serif"
    fontSize: "1.125rem"
    lineHeight: 1.85
  cursor-body-serif:
    fontFamily: "'Lora', 'Songti SC', 'Noto Serif SC', Georgia, serif"
    fontSize: "1.125rem"
    lineHeight: 1.85
  cursor-body-kai:
    fontFamily: "'LXGW WenKai Screen', 'Kaiti SC', 'STKaiti', 'KaiTi', 'Noto Serif SC', serif"
    fontSize: "1.125rem"
    lineHeight: 1.9
  reading-control:
    fontSize: "1rem"
  contents-shortcut-hint:
    fontSize: "0.8rem"
    fontWeight: 400
  contents-empty-notice:
    fontSize: "0.95rem"
    lineHeight: 1.6
  code:
    fontFamily: "'IBM Plex Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.88rem"
    lineHeight: 1.62
rounded:
  compact: "3px"
  cursor-detail: "4px"
  cursor-card: "5px"
  picker: "6px"
  paper-control: "8px"
  paper-card: "14px"
  reading-dialog-base: "1rem"
  paper-dialog: "16px"
  paper-pill: "9999px"
spacing:
  standard: "1rem"
  cursor-paragraph: "1.4rem"
  paper-paragraph: "1.45rem"
  cursor-card-inset: "1.65rem"
  desktop-gutter: "5vw"
components:
  appearance-toggle:
    backgroundColor: "var(--button-bg)"
    textColor: "var(--text-color)"
    rounded: "{rounded.picker}"
    padding: "0.35rem 0.65rem"
  appearance-option:
    textColor: "var(--text-color)"
    rounded: "{rounded.compact}"
    padding: "0.5rem 0.7rem"
  cursor-article-card:
    backgroundColor: "var(--card-bg)"
    rounded: "{rounded.cursor-card}"
    padding: "{spacing.cursor-card-inset}"
  paper-article-card:
    backgroundColor: "var(--card-bg)"
    rounded: "{rounded.paper-card}"
    padding: "1.75rem 1.75rem 1.25rem"
---

# Design system: 豆哥在此

## Overview

Paper and Cursor are selectable appearances of the same article site. [PRODUCT.md](PRODUCT.md) owns the identity, content, and navigation constraints. Paper uses editorial serifs and warm clay accents. Cursor follows the approved Cursor website and blog reference: sans-serif type, restrained surfaces, and fine boundaries. Both use the same responsive article width.

**Appearance ownership.** [_paper.scss](_sass/themes/_paper.scss) applies under `:root:not([data-site-theme="cursor"])`; [_cursor.scss](_sass/themes/_cursor.scss) applies under `:root[data-site-theme='cursor']`. [_reading.scss](_sass/themes/_reading.scss) owns shared layout, and [_appearance.scss](_sass/themes/_appearance.scss) owns the picker. Extend the appropriate owner.

## Colors

The frontmatter records the reused core palettes. Paper pairs ivory and linen with clay accents; its dark mode uses espresso surfaces and pale text. Cursor uses warm ivory or black surfaces, brown or warm gold links, muted metadata, and thin boundaries. Components consume the active CSS custom properties.

Paper keeps its clay accent separate from link text: light-mode links use `paper-link` and `paper-link-hover`, while blockquote borders, timeline nodes, and selected task markers retain `paper-clay`. Dark-mode link text retains `paper-dark-clay` with `paper-dark-link-hover` on hover. Paper overrides Chirpy's fixed hover orange for article and navigation links; directory highlights and text accents use the active link role. Both explicit color modes and the system fallback define these roles.

Paper's code labels, line numbers, and sidebar attribution use readable foreground colors without reducing the attribution group's opacity. Treat line numbers used to explain code as text with a 4.5:1 contrast floor; task-state markers and copy icons use a 3:1 floor. Copy icons inherit the button's foreground on hover, and copy-success checks retain a separate green with sufficient contrast in each mode.

Shared overlay colors have distinct roles: `reading-drawer-shadow` supplies the opened mobile right drawer's shadow tint; `reading-contents-backdrop` dims the page behind the contents dialog. Both layers use the same color in light and dark modes. Their source is [_reading.scss](_sass/themes/_reading.scss).

[_config.yml](_config.yml) defaults `visual_theme` to `paper`. Light, dark, and system color modes remain independent. Both stylesheets honor explicit `data-bs-theme` or `data-mode` attributes, then use the system preference when neither is present.

## Typography

Paper's default Garamond scheme pairs Cormorant Garamond headings with EB Garamond body text. Lora and Crimson Pro use their selected family for both roles. The interface retains `paper-ui`. Cursor cycles through Inter with Chinese sans-serif fallbacks (`sans`), LXGW WenKai Screen (`kai`), and Lora with Chinese serif fallbacks (`serif`). These choices change the reading body; interface text, headings, tables, and code keep their existing faces and metrics. Kai uses 1.9 leading; the other two use 1.85. The body sizes remain equal across choices.

Shared reading controls retain the active appearance's interface font. `reading-control` records the topbar buttons' base size; child SVG icons and the Aa label keep their own metrics. `contents-shortcut-hint` defines the normal-weight keyboard hint beside the dialog title. `contents-empty-notice` defines the explanation shown when an article has no heading directory. These roles describe auxiliary controls and messages, and their source is [_reading.scss](_sass/themes/_reading.scss).

[_includes/metadata-hook.html](_includes/metadata-hook.html) requests the web fonts. [site-appearance.js](assets/js/site-appearance.js) stores appearance in `preferred-site-theme`, Paper fonts in `preferred-font`, and Cursor fonts in `preferred-cursor-font`. It applies the selection in the page head. The schemes retain separate preferences.

The Kai choice loads the local [LXGW WenKai Screen stylesheet](assets/fonts/lxgw-wenkai-screen/font.css), copied with its WOFF2 subsets from `lxgw-wenkai-screen-web@1.321.0`. Its Unicode subsets use `font-display: swap`; the supplied face is Regular (400), so browsers synthesize bold and italic where requested. [The font author's screen-reading edition](https://github.com/lxgw/LxgwWenKai-Screen) and [the webfont package](https://github.com/CMBill/lxgw-wenkai-screen-web) describe its source. [OFL.txt](assets/fonts/lxgw-wenkai-screen/OFL.txt) accompanies the font assets. When the webfont is unavailable, the Kai system stack supplies the fallback.

## Layout

At 992px and above, the shared layout uses collapsible columns. Articles start with both panels closed; other layouts start open. Below that breakpoint, drawers start closed and the controller permits one open at a time. The right drawer is 300px wide, capped at 85vw. Sources: [_reading.scss](_sass/themes/_reading.scss), [_layouts/default.html](_layouts/default.html), and [reading-mode.js](assets/js/reading-mode.js).

Article and tail widths belong to the shared layout. Both appearances follow Paper's fluid columns, with 5vw outer gutters on desktop and the same inherited responsive container gutters below 992px. Sidebar state changes the available width; appearance selection does not. Scrollbar thickness is shared to keep the reserved space consistent. Below 850px (849.98px in CSS), Cursor body type becomes 1.0625rem, article titles 1.75rem, and card padding 1.2rem. Shared controls become 40px square; both appearances hide the combined layout button and sticky title so the controls fit.

Below 360px (359.98px in CSS), the shared picker tightens and hides its chevron. Paper card padding inherits 1rem below 768px, then uses its frontmatter padding. Sources: [_reading.scss](_sass/themes/_reading.scss), [_cursor.scss](_sass/themes/_cursor.scss), [_appearance.scss](_sass/themes/_appearance.scss), and Chirpy's `_sass/pages/_home.scss`, pinned by [Gemfile.lock](Gemfile.lock). Spacing tokens name observed uses rather than a universal scale.

## Elevation & Depth

**Cursor card stability.** Article, category, and related-post cards have no shadow or hover translation. Hover changes their surface tone. Cursor's topbar is opaque and removes the shared blur. Paper cards retain subtle shadows and a small lift. Shared drawers, menus, and the contents dialog retain overlay shadows. Exact shadows and motion belong to the sidecar.

The `reading-drawer` shadow appears only on the opened right drawer below 992px. The contents dialog retains its own shadow; its backdrop covers the rest of the page with `reading-contents-backdrop` and a blur. Both effects belong to the shared reading layout.

## Shapes

Paper retains rounded cards, pill tags, and soft table and code frames. Cursor uses small corners, straight blockquotes, and thin boundaries. Its controls and code frames use `cursor-detail`; tables and inline code use `compact`. Its contents dialog and the shared picker use `picker`. Sources: the three appearance stylesheets.

The shared contents-dialog rule supplies `reading-dialog-base` as a fallback. Paper's appearance stylesheet overrides it with `paper-dialog` using `!important`; Cursor's appearance stylesheet overrides it with `picker`. Keep the fallback and appearance-specific corners distinct when extending the dialog.

## Components

The topbar appearance picker offers Paper and Cursor. Its selected option has a round marker and `aria-pressed`; the toggle exposes `aria-expanded`. Hover and focus use the active palette. Mobile search hides the picker. [_includes/topbar.html](_includes/topbar.html) owns the markup; the sidecar previews the open state.

**Sidebar access grouping.** Recently Updated and Trending Tags use headings and whitespace, without section-level left borders. Both appearances keep the inherited `1rem` left inset and `4rem` gap between these modules. The shared right-panel divider separates the sidebar from article content.

Article cards have one visible surface with transparent wrappers. Cursor uses interface type and muted metadata; Paper retains serif reading and a title accent on hover. The sidecar includes both card treatments. Technical code tables retain one outer frame, horizontal scrolling, and an aligned number gutter in [_reading.scss](_sass/themes/_reading.scss).

[reading-mode.js](assets/js/reading-mode.js) owns font cycling, drawers, sticky titles, and the contents dialog. Its shortcuts remain `-` for home, `[` and `]` for panels, `=` for the desktop reading layout, `\` for article contents, and Escape for dismissal. On narrow screens, `=` opens the navigation drawer or closes an open drawer. Shared navigation and search retain their existing structure. [_config.yml](_config.yml) excludes PRODUCT.md and DESIGN.md from the public build.

## Do's and Don'ts

- Do preserve each appearance's palette, font choices, and Chinese fallbacks.
- Do keep article width shared and Cursor cards stable on hover.
- Do retain navigation, search, contents access, and keyboard controls.
- Don't couple appearance selection to color mode or share one saved font key.
- Don't add a second card surface or apply Paper's lift and pill geometry to Cursor.

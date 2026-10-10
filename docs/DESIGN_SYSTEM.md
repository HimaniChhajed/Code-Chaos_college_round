# Design System

## 1. Design Direction
Style: 3D Neo-Brutalism, unapologetic.
Mood: loud, tactile, confident, and obviously hand-made. Interfaces feel like physical blocks you can press.
Design Principles:
- Everything interactive is a physical object: thick border, hard offset shadow, moves toward the shadow when pressed.
- Contrast over subtlety. Flat colors only. No gradients, no blur, no glassmorphism.
- Information first. The app opens on the dashboard, never on a marketing hero.
- 3D is for data (Three.js scenes), not for decoration. Forms, tables and nav stay real DOM.
- No purple, violet or indigo anywhere.

> UI PROMPT ADDENDUM: paste the author's own Neo-Brutalism UI prompt below. If it conflicts with this file, this file wins until the conflict is resolved explicitly.
>
> NeoBrutalism Design System

### Personality
Raw, systematic, and unapologetic. NeoBrutalism communicates competence through contrast — every element is visible, every border is declared, every shadow is hard. It feels like it was designed by someone who understands both Swiss grid theory and punk music simultaneously. Bold enough to demand attention, structured enough to convert.

### The Two Non-Negotiable Rules
Before anything else — these two rules must be present on EVERY element, without exception:

**Rule 1 — Hard Border:**
```css
border: 3px solid #0A0A0A;
border-radius: 4px; /* 4px MAX — no more */
```

**Rule 2 — Hard Offset Shadow (no blur, no spread):**
```css
box-shadow: 5px 5px 0 #0A0A0A;
```
Never use `blur` in box-shadow. Never use `rgba` for the shadow color. The shadow is always flat black at 100% opacity. This is what makes NeoBrutalism instantly recognizable.

### Color System

**Base palette:**
- Background: #FFFEF0 — paper beige, NOT pure white. The slight warmth prevents harshness.
- Black: #0A0A0A — used for ALL borders, shadows, and primary text. Never pure #000000.
- White: #FFFFFF — used for card surfaces that need to lift off the beige background.

**The 6 accent colors (rotate across sections — never use all at once):**
- Electric Yellow: #FFE600 — primary CTA, hero badges, section highlights, active states
- Hot Magenta: #FF3EA5 — secondary accent, destructive actions, attention markers
- Vivid Cyan: #00C2CB — feature blocks, info states, link accents
- Deep Purple: #7B2FBE — stats sections, full-bleed contrast panels
- Signal Green: #00C853 — success states, checkmarks, positive indicators
- Bright Orange: #FF6B35 — warmth accent, pricing highlights

**Pastel variants (for bento card backgrounds — softer but still bold):**
- Pastel Yellow: #FFDB58
- Pastel Cyan: #87CEEB
- Pastel Pink: #FFC0CB
- Pastel Green: #BAFCA2
- Pastel Purple: #C4A1FF
- Pastel Orange: #FFA07A

**Usage rule:** Pick 2-3 accent colors per page maximum. The background, black, and white are always present. Accents rotate per section.

### Typography — The Hierarchy System

Font: Space Grotesk (preferred) or Inter — both have the geometry that works with neo-brutalist grids.

```
Display / H1:  clamp(40px, 6vw, 72px), weight 900, letter-spacing -0.03em, UPPERCASE, line-height 0.95
H2:            clamp(28px, 4vw, 44px), weight 900, letter-spacing -0.03em, UPPERCASE, line-height 1.0
H3:            clamp(20px, 2.5vw, 28px), weight 800, letter-spacing -0.02em
Body:          16-18px, weight 400-500, line-height 1.6, color #333
Label/Meta:    12-13px, weight 700, letter-spacing 0.08-0.12em, UPPERCASE, color #666
Section Tag:   11px, weight 700, letter-spacing 0.12em, UPPERCASE, white text on black bg pill
```

**Critical rule:** Display headings MUST be uppercase. Lowercase display text breaks the brutalist aesthetic.

### The Section Tag Component
Every section starts with this small label that announces what the section is:
```html
<div style="
  display: inline-block;
  background: #0A0A0A;
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 5px 14px;
  border-radius: 2px;
  margin-bottom: 16px;
">SECTION LABEL</div>
```

### Button System — The Press Effect
Buttons in NeoBrutalism simulate a physical push-down interaction:

```css
/* Default state */
.btn {
  border: 3px solid #0A0A0A;
  border-radius: 4px;
  box-shadow: 5px 5px 0 #0A0A0A;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.02em;
  padding: 12px 24px;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

/* Hover — button lifts slightly before press */
.btn:hover {
  transform: translate(2px, 2px);
  box-shadow: 3px 3px 0 #0A0A0A;
}

/* Active — fully pressed in */
.btn:active {
  transform: translate(5px, 5px);
  box-shadow: 0 0 0 #0A0A0A;
}
```

**Button variants:**
- Primary (Yellow): `background: #FFE600; color: #0A0A0A` — the main CTA. Yellow on beige reads as the most important action.
- Dark: `background: #0A0A0A; color: #FFFFFF` — secondary CTA, high-contrast contexts.
- White/Outline: `background: #FFFFFF; color: #0A0A0A` — browse/secondary actions on any background.
- Accent: `background: [accent]; color: #0A0A0A or #FFFFFF` — contextual to section.

### Card Components

**Standard card:**
```css
.card {
  background: #FFFFFF;
  border: 3px solid #0A0A0A;
  border-radius: 4px;
  box-shadow: 5px 5px 0 #0A0A0A;
  padding: 28px;
  transition: transform 0.15s, box-shadow 0.15s;
}
.card:hover {
  transform: translate(-3px, -3px);
  box-shadow: 8px 8px 0 #0A0A0A;
}
```
On hover, cards slide UP-LEFT and the shadow gets bigger — opposite of the button press effect. Cards feel like they're being picked up; buttons feel like they're being pushed down.

**Accent card (for bento grids):**
Same border + shadow, but with a pastel or vivid background instead of white. Rotate colors: yellow, cyan, pink, green, purple, orange across adjacent cards.

**Dark card:**
`background: #0A0A0A; color: #FFFFFF` — used for stats or featured items. Yellow numbers on black for maximum impact.

### Bento Grid Layout
The bento grid is the signature layout pattern for feature sections:

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px; /* tight gap — the borders do the visual separation */
}
```

**Size variants in the grid:**
- `1×1` (normal): standard feature card
- `2×1` (wide): most important feature — goes at top or bottom
- `1×2` (tall): stat card or featured feature with room for a big number
- `2×2` (large): hero feature with illustration

**Rule:** Every bento card has a different background color. No two adjacent cards share the same color.

### Navbar
```
White background | 3px bottom border | height 60px
Left: Logo mark (accent bg + black border) + brand name UPPERCASE
Center-left: nav links (plain, hover = yellow bg)
Right: Ghost link "Log in" + Yellow pill button "Sign up"
Sticky: yes
```
No dropdown menus with rounded corners. If dropdowns exist: full-border, flat, hard-shadow panel.

### Announcement Bar
Above the navbar:
```css
background: #0A0A0A;
color: #FFE600;
font-size: 13px;
font-weight: 700;
letter-spacing: 0.05em;
padding: 8px 24px;
text-align: center;
```
Contains: marketing message + "CHECK IT OUT →" link in yellow. Creates immediate visual priority.

### Hero Section — Asymmetric Two-Column
```
Left column (55%): badge pill + giant h1 + subtitle + button row + trust checkmarks
Right column (45%): abstract blocks / illustration / product preview
```

**Hero badge pill** (above h1):
```css
background: #FFE600;
border: 3px solid #0A0A0A;
border-radius: 4px;
box-shadow: 3px 3px 0 #0A0A0A;
padding: 5px 14px;
font-size: 12px;
font-weight: 700;
letter-spacing: 0.08em;
text-transform: uppercase;
```

**Trust checkmarks** (below buttons):
```css
/* Each item: */
display: flex; align-items: center; gap: 6px;
/* Check icon: */
background: #00C853; border: 2px solid #0A0A0A; border-radius: 2px;
width: 18px; height: 18px; /* contains ✓ */
font-size: 13px; font-weight: 600;
```

### Features Strip (below hero)
4 equal columns, each with a border-right (last has none). Each column:
- Colored icon box (different accent per item, 36×36px, bordered)
- UPPERCASE feature title
- Short description in #555
- "↗" arrow bottom-right, appears on hover
- Full column background shifts to yellow on hover

### Stats Section
Full-bleed deep purple (`#7B2FBE`) background. White borders between items. Four columns:
- Cols 1-3: stat number in `#FFE600` (huge), label in `rgba(255,255,255,0.8)`
- Col 4: "TRUSTED BY" label + brand name badges (white text on semi-transparent bg)

### Testimonial Cards
White background, hard border, hard shadow. Three columns:
- Oversized opening quote mark in `#FFE600`, font-family Georgia, font-size 48px
- Body text in #333, font-size 14px
- Author: avatar circle (colored by accent rotation) + name + role
- Hover: card lifts (-3px, -3px) with bigger shadow

### Newsletter / CTA Band
Two patterns:

**Full-bleed yellow CTA (before footer):**
- Background: `#FFE600`, border-top + border-bottom: `3px solid #0A0A0A`
- Large bold headline (uppercase, huge, left) + body text + button (right)
- No border-radius on the section itself — full bleed edge to edge

**Newsletter strip (above footer):**
- Background: `#0A0A0A`
- Title in white, subtitle in `rgba(255,255,255,0.6)`
- Email input: white bg, hard left border, fused with subscribe button (yellow bg, right side)
- Input `border-right: none` + button `border-radius: 0 4px 4px 0`

### Footer
- Background: `#0A0A0A`
- 4-column grid: brand (with logo mark) + 3 link columns
- Column headers: `#FFE600`, uppercase, 12px, letter-spacing 0.1em
- Links: `rgba(255,255,255,0.55)`, hover → white
- Separator: `1px solid rgba(255,255,255,0.15)` (NOT 3px — footer is quiet)

### The Arrow Convention
NeoBrutalism uses arrows as the universal "follow this link / expand / go" signal:
- External links: `↗` (diagonal up-right)
- Internal navigation: `→` (right)
- Expand/more: `↓`
- Back: `←`
- Never use chevrons (`>`) — too subtle. Always use bold directional arrows.

### Input Fields
```css
.input {
  border: 3px solid #0A0A0A;
  border-radius: 4px;
  background: #FFFFFF;
  padding: 12px 16px;
  font-family: [same as body];
  font-size: 15px;
  font-weight: 500;
  outline: none;
}
.input:focus {
  box-shadow: 4px 4px 0 #0A0A0A;
}
/* Error state: */
.input.error {
  border-color: #FF3EA5;
  box-shadow: 4px 4px 0 #FF3EA5;
}
```

### Spacing System (strict 8pt grid)
```
4px  — micro gaps (icon to text)
8px  — tight spacing (badge padding, small gaps)
12px — bento grid gap
16px — component internal spacing
24px — between related components
32px — section sub-spacing
48px — section padding (mobile)
64px — section padding (desktop)
96px — major section separation
```
Never use odd spacing values (5px, 7px, 11px, etc.). Every measurement divides by 4.

### Responsive Behavior
- Mobile: hero stacks single column, hero-right block hides, nav links hide, features strip goes 2-col → 1-col
- Bento grid: 3-col → 2-col → 1-col. Wide/tall cards lose their span overrides at 1-col.
- Stats: 4-col → 2-col → 1-col
- Font sizes use `clamp()` throughout — never hard pixel values for display text
- Padding scales: 64px desktop → 40px tablet → 20px mobile
- All hover effects disabled on touch devices (`:hover` only activates on pointer)

### What NOT to Do
- Never use `border-radius` larger than 4px on structural elements (8px+ = NeoBrutalism starts dying)
- Never use `box-shadow` with a blur value (e.g. `0 4px 12px rgba(0,0,0,0.1)` is forbidden)
- Never use gradients as primary backgrounds (accent fills only, no gradient CTA buttons)
- Never center-align body text (only hero headings and full-bleed stat sections are centered)
- Never use more than 3 accent colors on a single page
- Never use soft colors like `#eee`, `#f0f0f0`, or desaturated blues — every color must be intentional and strong
- Never break the grid — all column gaps must be consistent (12px for bento, 16px for standard layouts)
- Never use color alone to communicate state — always pair color with a shape/icon change (accessibility)
]

## 2. Brand
Brand Name: Nexus
Logo: text wordmark "NEXUS" in the heading font, ink on signal-yellow block with hard shadow. No icon gradients.
Brand Voice: direct, short sentences, verbs first. No filler, no emoji in UI copy.

## 3. Color Palette (tokens in Tailwind @theme)
Primary (signal): #FFD600
Secondary (cobalt): #1D4ED8
Background (paper): #F3EEE3
Surface: #FFFFFF
Text (ink): #111111
Muted Text: #4A4A4A
Border: #111111
Success (mint): #1FD18B
Warning: #FF9F1C
Error / pending approval (tomato): #FF4B2B
Rule: only these colors. Add a token here before using a new one.

## 4. Typography
Font Family: Archivo + JetBrains Mono via next/font
Heading Font: Archivo, weight 800-900, uppercase for H1/H2
Body Font: Archivo, weight 500
Mono: JetBrains Mono for numbers, IDs, labels, table headers
H1: 40px / 900 / 1.05
H2: 28px / 800 / 1.1
H3: 20px / 800 / 1.2
Body: 16px / 500 / 1.5
Small: 13px / 600 / 1.4 (mono for labels)

## 5. Spacing
Base Unit: 4px
Spacing Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96

## 6. Border Radius
Small: 0px
Medium: 0px
Large: 0px
Pill: 0px for UI (neo-brutalism is square). Exception: status dots may be circles.

## 7. Shadows (hard, no blur)
Small: 3px 3px 0 0 #111
Medium: 6px 6px 0 0 #111
Large: 10px 10px 0 0 #111
Pressed: 2px 2px 0 0 #111 with element translated 4px 4px

## 8. Buttons
Primary Button: signal bg, ink text, 3px ink border, medium shadow, uppercase 800.
Secondary Button: white bg, same border and shadow.
Danger Button: tomato bg, ink text.
Disabled: paper-dark bg (#D9D3C4), muted text, no shadow, cursor not-allowed.
Loading: label replaced by a stepped (non-smooth) mono "..." animation; button stays same size.

## 9. Inputs
Default: white bg, 3px ink border, no radius, mono placeholder in muted.
Focus: 3px cobalt outline offset 2px plus small shadow.
Error: tomato border, error text below in mono, aria-describedby set.
Disabled: paper-dark bg.
Placeholder: muted text, never the only label.

## 10. Cards
Padding 24px, 3px ink border, white surface, medium shadow. Optional colored header strip (signal / mint / cobalt) 3px-bordered.

## 11. Navigation
Header: 64px, ink bottom border 3px, workspace switcher left, user menu right.
Sidebar: 240px, ink right border, items are blocks; active item is signal bg with shadow.
Mobile Navigation: bottom bar with 5 blocks, 3px top border.

## 12. States
Loading: block skeletons with striped paper pattern, no shimmer.
Empty: bordered box, one sentence, one primary action.
Error: tomato-bordered box with plain-language message and Retry button.
Success: mint toast with hard shadow, auto-dismiss 4s.
Disabled: see Buttons.
Approval pending: tomato badge "NEEDS APPROVAL" everywhere a HIGH step appears.

## 13. Icons
Icon Library: hand-drawn SVG set in /components/icons (no lucide).
Default Size: 20px (24px in nav)
Icon Style: outline, 3px stroke, square caps and joins.

## 14. Three.js Scenes
- React Three Fiber + drei, loaded with next/dynamic (ssr:false).
- Flat/toon materials, black outline pass, orthographic-leaning camera, no bloom, no gloss.
- Max 2 canvases per page; unmount on route change.
- Every scene has an SVG fallback with identical data.
- Respect prefers-reduced-motion (no idle rotation).

## 15. Responsive Design
Mobile: single column, bottom nav, scenes replaced by SVG fallback under 480px.
Tablet: collapsible sidebar.
Desktop: fixed sidebar, 12-col grid with visible 3px dividers.
Breakpoints: Mobile < 640px, Tablet 640-1024px, Desktop > 1024px.

## 16. Accessibility
- Semantic HTML, native <dialog> for modals.
- Contrast: ink on paper/signal/mint passes AA; never put ink text on cobalt (use white).
- Full keyboard navigation, visible focus (cobalt outline).
- Accessible labels on every control; color is never the only signal (badges carry text).
- prefers-reduced-motion respected.

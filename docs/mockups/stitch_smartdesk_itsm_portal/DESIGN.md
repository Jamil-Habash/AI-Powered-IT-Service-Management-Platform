---
name: SmartDesk Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44474f'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#747780'
  outline-variant: '#c4c6d0'
  surface-tint: '#475e8c'
  primary: '#03224d'
  on-primary: '#ffffff'
  primary-container: '#1f3864'
  on-primary-container: '#8ba2d5'
  inverse-primary: '#afc6fb'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#1f2427'
  on-tertiary: '#ffffff'
  tertiary-container: '#34393c'
  on-tertiary-container: '#9ea2a6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#afc6fb'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#2e4673'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#dfe3e7'
  tertiary-fixed-dim: '#c3c7cb'
  on-tertiary-fixed: '#171c1f'
  on-tertiary-fixed-variant: '#43474b'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.03em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 260px
  container-padding: 2rem
  gutter: 1.5rem
  unit-xs: 0.25rem
  unit-sm: 0.5rem
  unit-md: 1rem
  unit-lg: 1.5rem
  unit-xl: 2rem
---

## Brand & Style
The design system is engineered for efficiency, clarity, and trust within an enterprise IT Service Management environment. The personality is professional, systematic, and dependable, minimizing cognitive load for technicians who spend hours interacting with complex data.

The aesthetic follows a **Corporate / Modern** approach with a focus on high functional density. It utilizes a restrained color palette, purposeful whitespace, and a clear information hierarchy to ensure that critical ticket information is never obscured by decorative elements.

## Colors
The palette is anchored by a deep navy primary for navigation and structural elements, providing a sense of stability. The soft blue accent is reserved for primary actions and interactive states.

- **Surface Colors:** Use `#FFFFFF` for primary content cards and `#F8FAFC` for the global application background to create a subtle contrast between the page and the workspace.
- **Status Semantic Palette:** Distinct hues are assigned to ticket states:
  - **Open:** Soft Blue (Actionable)
  - **In Progress:** Amber (Active attention)
  - **Resolved:** Emerald (Success/Completion)
  - **Closed/Canceled:** Slate Gray (De-emphasized)
  - **Critical Priority:** Rose Red (Immediate urgency)

## Typography
This design system utilizes **Inter** for its exceptional legibility in data-heavy interfaces and its neutral, modern tone.

- **Hierarchical Usage:** Headlines use a semi-bold weight with tight letter-spacing for a cohesive, professional look. 
- **Body Text:** The standard size is 14px (`body-md`) to allow for high information density without sacrificing readability.
- **Data Labels:** Small, uppercase labels with slight letter-spacing are used for table headers and form field captions to differentiate metadata from user-generated content.

## Layout & Spacing
The layout is based on a **fixed sidebar + fluid content area** model. 

- **Sidebar:** A persistent 260px left-hand navigation allows for deep hierarchical access.
- **Grid:** Content within the fluid area follows a 12-column system with 24px gutters.
- **Rhythm:** Spacing follows a 4px (0.25rem) baseline scale. Use `unit-md` (16px) for standard internal component padding and `unit-lg` (24px) for spacing between distinct layout blocks.
- **Responsive:** On tablet, the sidebar collapses into an icon-only rail. On mobile, the sidebar moves to a hidden drawer, and container padding reduces to 1rem.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and extremely **Ambient Shadows** to maintain a clean SaaS aesthetic.

- **Level 0 (Background):** `#F8FAFC` - The canvas layer.
- **Level 1 (Cards/Sidebar):** White background with a 1px border (`#E2E8F0`) and a very soft shadow: `0px 1px 3px rgba(0, 0, 0, 0.05), 0px 10px 15px -3px rgba(0, 0, 0, 0.02)`.
- **Level 2 (Modals/Dropdowns):** White background with a more pronounced shadow to indicate focus and separation from the main UI: `0px 20px 25px -5px rgba(0, 0, 0, 0.1)`.
- **Outline Usage:** Use thin, low-contrast borders for form fields and table rows instead of shadows to keep the interface feeling "flat" and lightweight.

## Shapes
The design system uses a consistent **Rounded** (8px) corner radius to soften the professional interface and make it feel more accessible.

- **Standard Elements:** 8px (`rounded-md`) for cards, input fields, and primary buttons.
- **Pills/Badges:** Full rounding (999px) for status indicators and priority tags to clearly distinguish them from interactive buttons.
- **Selection States:** Navigation hover states and list item selections should use a 6px radius to fit comfortably within 8px parent containers.

## Components
- **Buttons:** 
  - *Primary:* Solid `#3B82F6` with white text.
  - *Secondary:* Ghost style with `#1F3864` text and border.
  - *Sizing:* 36px height for standard actions; 44px for primary page actions.
- **Status Pills:** Small 12px bold text, centered. Use a light background (10% opacity of the status color) with high-contrast text of the same hue for maximum readability.
- **Input Fields:** 1px border (`#CBD5E1`), 8px radius. On focus, the border changes to `#3B82F6` with a 3px soft blue outer glow.
- **Sidebar Nav:** Deep Navy (`#1F3864`) background. Active items use a semi-transparent white highlight (`rgba(255,255,255,0.08)`) and a 4px accent line on the far left.
- **Data Tables:** Clean rows with 1px bottom borders. Header cells should have a subtle gray background (`#F1F5F9`) to anchor the data.
- **Priority Indicators:** Use a vertical bar or colored dot icon next to the text for accessibility, ensuring color is not the only signifier of urgency.
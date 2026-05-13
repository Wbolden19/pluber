# Design Brief

## Direction

Pluber — trusted, energetic Uber-like marketplace for home services. Two-sided platform (homeowners + workers) with map-centric job discovery and secure payment escrow.

## Tone

Bold modern with technology confidence — electric blue/green primary paired with trustworthy dark navy backgrounds. Professional yet approachable for both gig workers and homeowners posting jobs.

## Differentiation

Interactive map overlay with job cards and worker radius visualization; clear visual separation between homeowner and worker surfaces; electric green action buttons for "Accept Job" and "Post Job" create instinctual call-to-action recognition.

## Color Palette

| Token      | OKLCH         | Role                                      |
| ---------- | ------------- | ----------------------------------------- |
| background | 0.16 0.02 200 | Deep navy base — trust, professionalism   |
| foreground | 0.93 0.01 200 | Off-white text, high contrast             |
| card       | 0.21 0.025 200| Elevated surfaces, jobs/profiles          |
| primary    | 0.68 0.18 190 | Cyan-blue accent, interactive elements    |
| accent     | 0.72 0.22 140 | Electric green, high-priority CTAs        |
| secondary  | 0.25 0.03 200 | Subtle dividers, inactive states          |
| muted      | 0.25 0.03 200 | Disabled text, secondary information      |
| border     | 0.32 0.025 200| Card edges, section dividers               |
| destructive| 0.55 0.22 25  | Cancellations, warnings (red-orange)      |

## Typography

- **Display**: Space Grotesk — bold, geometric, tech-forward heading voice for hero, page titles, role badges
- **Body**: DM Sans — clean, professional, approachable at all sizes for UI labels, descriptions, metadata
- **Mono**: Geist Mono — code blocks, transaction IDs, service cost breakdowns
- **Scale**: Hero `text-5xl md:text-7xl font-bold tracking-tight` | H2 `text-3xl md:text-5xl font-bold tracking-tight` | Label `text-sm font-semibold tracking-widest uppercase` | Body `text-base leading-relaxed`

## Elevation & Depth

Four-level surface hierarchy: dark background → card layer with subtle border and shadow → elevated card on hover (0 4px 12px shadow) → floating modals/toasts with max elevation. All depth through shadow, not color inversion.

## Structural Zones

| Zone         | Background     | Border               | Notes                                                        |
| ------------ | -------------- | -------------------- | ------------------------------------------------------------ |
| Header/Nav   | bg-card        | border-b border-border | Navigation, role toggle, user profile. Sticky on scroll.     |
| Map          | bg-background  | —                    | Full-width Leaflet map, job pins, worker radius overlay      |
| Content      | bg-background  | —                    | Job cards grid, worker profiles, alternating section styling |
| Job Card     | bg-card        | border border-border  | Rounded-lg, shadow-card, hover:shadow-elevated effect        |
| Footer       | bg-secondary   | border-t border-border| Links, support, company info; tinted secondary background    |
| Modals       | bg-card        | —                    | Payment escrow flow, job acceptance, maximum z-elevation     |

## Spacing & Rhythm

Gap sections 6rem (md:8rem); card grid columns gap 1.5rem; micro-spacing 0.5rem–1rem for button padding, label margins. Dense job list on mobile, spacious grid on desktop — responsive rhythm follows content density.

## Component Patterns

- **Buttons**: Primary (bg-primary, hover:opacity-90, active:scale-95) for secondary actions | Accent (bg-accent) for high-priority CTAs (Post Job, Accept Job, Pay)
- **Cards**: Rounded-lg, bg-card, border-border with shadow-card; hover elevates to shadow-elevated
- **Badges**: Role badges (Homeowner/Worker) use uppercase text-sm, pill shape (rounded-full), secondary background with muted text
- **Job Cards**: Hero image top, title bold, service category label, price prominent, distance/worker rating below-the-fold, CTA at bottom
- **Map**: Leaflet with custom marker icons, radius circle overlay, tap card to focus job on map

## Motion

- **Entrance**: Fade-in 0.4s ease-out for card lists; slide-up 0.3s for modals. Stagger card animations on grid load (60ms between).
- **Hover**: All interactive elements `transition-smooth` (0.3s cubic-bezier) opacity and transform changes (scale-95 on active).
- **Decorative**: None; prioritize functional clarity over ambient animation. Exception: light pulsing for "live" job indicators.

## Constraints

- No generic AI purple gradients; navy + electric green primary only
- All color tokens via CSS variables; never raw hex or rgb() in components
- Map interaction must not interfere with card tap targets
- Payment/escrow UI must be fully accessible (WCAG AA+ contrast, keyboard nav)
- Worker profile photos and homeowner avatars must load via object-storage extension

## Signature Detail

Electric green accent on subtle navy base creates immediate visual identity within marketplace UX category — distinct from Uber/DoorDash blue monotones. Color pairing signals both trustworthiness (navy) and urgency (electric green), optimized for gig-work action psychology.

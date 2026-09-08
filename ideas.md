# ReviewSniper UI — Design Brainstorm

## Approach 1
**Theme Name:** Crisis Command / Airy Precision  
**Very Brief Intro:** Ek bright, calm command surface jahan serious lead intelligence ko focused, trustworthy aur high-signal feel diya jaye. Cobalt action accents aur layered white surfaces product ko fast bhi rakhen aur premium bhi.  
**Probability:** 0.08

## Approach 2
**Theme Name:** Editorial Intelligence Ledger  
**Very Brief Intro:** Magazine-style layout jahan headings, dividers aur evidence-led data blocks ReviewSniper ko ek research desk jaisa character dein. Warm paper tones aur ink-like navy seriousness ko reinforce karein.  
**Probability:** 0.04

## Approach 3
**Theme Name:** Signal Room / Dark Operations  
**Very Brief Intro:** Low-key midnight workspace with focused electric-blue signals, compact panels and a tactical atmosphere. Ye direction high-alert monitoring ko dramatic banati hai magar reference ke airy lightness se kaafi different hai.  
**Probability:** 0.02

# Chosen Direction: Crisis Command / Airy Precision

## Design Movement
Contemporary enterprise editorial fused with Swiss information design and soft-glass SaaS surfaces. The interface should feel like a high-trust operations console, not a generic admin template.

## Core Principles
1. **Signal over decoration:** Every visual hierarchy decision should help the user scan, compare, and act quickly.
2. **Bright confidence:** Keep the base canvas light and breathable; reserve saturated color for actions, status, and selected navigation.
3. **Human-scale precision:** Pair clear product language with compact metadata, consistent alignment, and restrained micro-interactions.
4. **Evidence-ready emptiness:** When real API data is not connected, show honest empty states instead of invented records or metrics.

## Color Philosophy
The canvas uses porcelain white and cool mist blue to create calm working space. Cobalt and indigo represent decisive action and trust; pale periwinkle fills provide depth without visual noise. Red is reserved for crisis semantics, not branding. The signature color is **ReviewSniper Cobalt #3268EE**: direct, ownable, and visible against the pale interface.

## Layout Paradigm
Use an asymmetric two-zone composition. Auth is a split-screen command entrance: a brand/story panel on the left and a compact action card on the right. The dashboard is a persistent left rail plus a broad working canvas, with the data surface anchored by a strong table frame rather than a centered marketing grid. On smaller screens, collapse the rail into a top control strip while preserving the same reading order.

## Signature Elements
- A **target-reticle mark** made from a four-point cobalt crosshair and a central signal dot.
- **Crisis blue rail:** the active navigation state uses a narrow cobalt-to-indigo treatment with a subtle shadow, not a heavy gradient everywhere.
- **Airy evidence cards:** white cards with generous padding, hairline borders, compact metadata, and one meaningful accent icon per card.

## Interaction Philosophy
Interactions should feel like a fast operator's console: focused, reversible, and explicit. Login and signup actions are local presentation states only; they must not imply authentication success. Dashboard navigation can change selected UI state, while unavailable tools should clearly say they are awaiting backend/API connection.

## Animation
Use short 160–220ms ease-out transitions for hover, active, and input focus. Auth panels enter with a small upward shift and opacity reveal. Dashboard cards stagger by 45ms only on first load. Buttons compress to 97% on press. Avoid animated numbers or fake loading states because they could imply live data. Respect prefers-reduced-motion and remove non-essential transforms.

## Typography System
Use **Manrope** for UI/body copy and **DM Sans** for strong display headings. Manrope keeps dense controls legible; DM Sans gives the brand and page titles a confident editorial silhouette. Headings use tight tracking and 700–800 weight. Labels use 11–12px uppercase or sentence-case metadata with letter spacing. Body copy stays 13–15px with relaxed line height.

## Brand Essence
ReviewSniper is a crisis-led review intelligence workspace for agencies that turn negative customer signals into qualified opportunities. It is different because it makes the earliest reputation risk actionable.  
**Personality:** focused, credible, sharp.

## Brand Voice
Headlines are direct and outcome-led. CTAs use clear verbs. Microcopy is calm, useful, and honest about system state; never invent activity or social proof.

Example lines:
- “Find the signal before the competitor does.”
- “Connect your review source to surface live crisis leads.”

## Wordmark & Logo
Use a custom reticle symbol beside a two-tone wordmark: “Review” in deep navy and “Sniper” in cobalt. The mark is a four-point target made from open strokes, with a small center dot, giving the name a visual signature without relying on a default text logo.

## Signature Brand Color
**ReviewSniper Cobalt — #3268EE**

## Implementation Reminder
All page and component files should reinforce the same direction: pale blue-white surfaces, cobalt action hierarchy, Manrope + DM Sans, soft depth, honest empty states, and no fabricated customer/review data.

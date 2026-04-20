# OperationsEdge — Project Instructions

Static affiliate content site for UK operations, warehouse, and logistics professionals. Deployed to Netlify. Pure HTML/CSS, no build tooling.

## Deploy

Always deploy with: `netlify deploy --prod --dir .`

## Design Context

### Users
Mixed audience of UK operations professionals: warehouse floor supervisors checking on mobile during breaks, mid-level ops managers researching software at a desk, and senior logistics/supply-chain leaders making vendor comparisons. They are time-poor, sceptical of hype, and value practical signal over polished presentation. They may land from a Google search mid-task, not browsing for pleasure.

### Brand Personality
Straight-talking peer. The voice of an experienced colleague who's been on the floor, knows the tools, and gives you the honest verdict without padding it out. Not authoritative from the top down — authoritative from earned experience. Three words: **direct, grounded, credible**.

### Aesthetic Direction
- **Reference**: Wirecutter / RTINGS — methodical, review-first, trust built through rigour and transparency. Sparse decoration, dense useful content, hierarchy that guides the eye to what matters.
- **Anti-reference**: Generic SaaS marketing sites, purple gradients, hero sections with stock photos of smiling warehouse workers, over-rounded "approachable" B2B aesthetics.
- **Theme**: System-adaptive (light-dark via CSS `prefers-color-scheme`). Light mode should feel like clean newsprint; dark mode should feel like a focused reading environment, not a "cool tech" dark UI.
- **Colour**: Keep the steel blue (#1B609D) brand hue but ground it — it should anchor the interface, not glow. Neutrals should be tinted slightly toward this hue. No cyan-on-dark, no gradient accents.
- **Typography**: Avoid the current Outfit font (reflex default). Needs a pairing that feels like a reliable trade publication — a sturdy, slightly characterful sans for UI/body, and a display face with some editorial weight for headings.

### Design Principles
1. **Information before impression** — hierarchy serves the reader's task (compare, decide, act), not the site's visual ambition.
2. **Earn trust through rigour** — structured comparisons, clear rating criteria, honest limitations stated upfront. Design should make the methodology visible.
3. **No-fluff layout** — if a section, element, or decoration doesn't help the user decide, remove it. No hero stat grids, no icon-above-every-heading templates.
4. **Operational precision** — consistent spacing scales, tight grids, purposeful use of white space. The interface should feel like it was built by someone who understands that ops people use systems, not just look at them.
5. **Context-aware** — comfortable on mobile in portrait during a break; equally readable on a wide desktop monitor. Adapts rather than shrinks.

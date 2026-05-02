---
type: community
cohesion: 0.50
members: 8
---

# Error Concentration Dashboard

**Cohesion:** 0.50 - moderately connected
**Members:** 8 nodes

## Members
- [[Error Rate by Zone (Relative) Zone A High, Zone B High, Zone C Low, Zone D Low, Zone E Low]] - image - linkedin/post-06-errors-not-random/slide-04-dashboard (1).png
- [[Error Type Breakdown Donut Chart Wrong item 38%, Wrong quantity 27%, Missed item 22%, Location error 13%]] - image - linkedin/post-06-errors-not-random/slide-04-dashboard (1).png
- [[Error Types Tracked 4 (wrong item, qty, missed, location)]] - image - linkedin/post-06-errors-not-random/slide-04-dashboard (1).png
- [[High-Error Zones 2 of all zones — 60%+ of all errors]] - image - linkedin/post-06-errors-not-random/slide-04-dashboard (1).png
- [[Key Insight 2 zones, 60%+ of all errors — both had fixable layout and slotting issues; generic retraining would have addressed 0% of the actual cause]] - image - linkedin/post-06-errors-not-random/slide-04-dashboard (1).png
- [[LinkedIn Carousel Errors Are Not Random]] - image - linkedin/post-06-errors-not-random/slide-04-dashboard (1).png
- [[Picking Errors — Concentration & Type Analysis Dashboard]] - image - linkedin/post-06-errors-not-random/slide-04-dashboard (1).png
- [[Root Cause Level System not operator (layout, slotting, environment)]] - image - linkedin/post-06-errors-not-random/slide-04-dashboard (1).png

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Error_Concentration_Dashboard
SORT file.name ASC
```

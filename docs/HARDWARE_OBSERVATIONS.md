# D200 observations — 2026-10-12

Reported by the user on the installed ImageSlide GIF 0.9.0 Windows x64 setup.
The Studio executable inspected at installation was 3.3.9.0 with the pinned hash.
The active large-display slot was read-only verified as the fork action at `3_2`.
Firmware, media details, observation duration and actual frame cadence were not
recorded. These are user observations, not automated hardware measurements.

| Selected backend | Studio preview | Physical D200 large display |
|---|---|---|
| Native GIF | GIF animates | A frozen GIF frame |
| PNG frames | Not separately reported after the switch | Animation works |

The user's confirmation was: “It works on the PNG Frames!”

**Decision for this tested setup: use PNG frames.** The existing backend sends
prepared PNG frames through direct type-1 image delivery using one bounded shared
scheduler, capped at 10 FPS. Studio native-GIF animation is not evidence of physical
native support. This decision is based on the physical observation, not a code-0
reply. Native mode remains available explicitly for other firmware/Studio tests;
there is no automatic switching based on acknowledgements.

Version 0.9.0 defaults to Native GIF for new settings. Select **GIF playback →
PNG frames** in the Inspector for this tested D200. The user selected that option;
the agent did not rewrite installed settings or profiles. No reinstall is needed.

This establishes basic physical PNG-frame animation on one setup. It does not
establish sustained performance, exact delay/finite-loop behavior, all-media
compatibility, clean static/information replacement, page/reconnect lifecycle or
macOS animation. Those checks remain in MANUAL_VALIDATION.md. No store submission
or broad hardware-verified release claim follows from this observation.

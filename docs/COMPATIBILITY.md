# Compatibility evidence (2026-10-12)

## Verified sources

Upstream https://github.com/arkamax404-max/SlideImgPlugin remains at
`cd8c36cb7a9cb0d632fa048777c23f938ed9f5c8`, version 0.8.1. MIT copyright Santiago Pérez is retained.
Official repositories inspected locally:

* https://github.com/UlanziTechnology/plugin-common-node at `9e478b2586a4ebdadbd590fc8f80519df18a8d32`
* https://github.com/UlanziTechnology/plugin-common-html at `0aeb6a26b43cd45b8a5426689ca6e59c1a36b43d`
* https://github.com/UlanziTechnology/UlanziDeckPlugin-SDK at `550ab80c69285ecf259bd494a7fff767c14f0c0f`
* [Manifest reference](https://github.com/UlanziTechnology/UlanziDeckPlugin-SDK/blob/550ab80c69285ecf259bd494a7fff767c14f0c0f/manifest.md): four main UUID segments, action suffix, Node 20.12.2 host.

## Observed upstream behavior

Custom protocol adapter preserves `clear(string[])`, both `setactive` and `setActive`, argv address/port, global settings and the target identifiers in both packet envelopes. Slideshow accepts only key `3_2`, renders 458×196, and uses one-second gallery/information ticks. GIF extensions and loader MIME support are absent.

Setup is a private saved-profile technique, not a public display-assignment API. Windows helpers require exact executable versions/hashes for 3.2.11.0 and 3.3.9.0. The manifest minimum is not helper compatibility evidence. No build pins may be relaxed.

## Fork policy and unverified assumptions

Candidate UUID `com.ggazzeta.ulanzi.imageslidegif` has four segments; actions append `.slideshow`/`.setup`. Windows x64 is the first packaged target. macOS source and pinned native packages are preserved, but animation there is unverified. No physical D200 or running Studio session is available to this work so far. Native GIF rendering, static replacement and page/reconnect behavior require the manual checklist. No public store submission or hardware-verified claim is authorized.

Baseline run: Node 22.14.0, npm ci, audit reported zero vulnerabilities, 58/59 tests passed. One macOS helper test failed removing a temporary fixture on Windows (`ENOTEMPTY`); this is recorded rather than treated as a passed baseline.

Read-only host inventory subsequently verified running Studio **3.3.9.0** with
SHA-256 `8c5580461eb44326d1fd05e21de3b435772ab0a5efff301ee355d304cb760f1d`,
exactly one pinned helper build. The independent fork folder is not installed.
The user confirms D200 is available for observation. No native/device delivery
has occurred. Current saved-profile clone preparation was refused because of an
unresolved external ProfileUUID reference; a complete official original export
is needed rather than relaxing that guard. Original installed profiles are intact.

Later installation/physical observations: the approved plugin-only installation
completed with 197/197 package files matching. The user reports Native GIF animates
in Studio but freezes on the D200, while PNG frames works on the physical display.
Recommend PNG frames on this tested setup. This does not verify other firmware,
all lifecycle/performance cases or macOS. See HARDWARE_OBSERVATIONS.md.

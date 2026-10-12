# ImageSlide GIF 0.9.0 — independent ggazzeta fork

MIT copyright Santiago Pérez retained. Not an official Ulanzi plugin.
Source/instructions: https://github.com/ggazzeta/SlideImgGIF.
**Physical native GIF and PNG-frame support is unverified.**

Windows x64 is the first target. macOS x64/arm64 native dependencies are bundled
and statically checked; this does not establish macOS animation support.
Node >=20.12.2, Sharp 0.35.5 and ws 8.21.3. Dependencies are included; no npm
installation or external background service is required.

Only after explicit installation approval, close Studio manually and import the
plugin ZIP if Studio supports that operation, or place this single folder in
`%APPDATA%\Ulanzi\UlanziDeck\Plugins`. The independent UUID/folder can coexist
with upstream. Do not replace another plugin or alter any audio/button settings.

Large display key 3_2 uses an observed private profile technique. Prefer preparing
and importing a reviewed independent clone of an untouched Studio export. The
source tools regenerate package/page/action IDs, preserve device/unrelated
semantics and SmallViewMode:2, and refuse an upstream slideshow or unrelated slot.
No personal profile is bundled. Importing a profile or writing saved profiles
requires separate explicit approval.

Setup Large Display is an alternative, not a public assignment API. It preserves
exact device/profile/page/Setup-instance binding, request hashes, verified backups,
atomic writes/readback and restore. Windows pins exact Studio 3.2.11.0 and 3.3.9.0
executable hashes. Manifest minimum is not a reason to relax those checks. The
helper waits for you to close Studio, never terminates it, and relaunches only
its pinned executable after approved setup. macOS requires manual reopen.

Choose a top-level PNG/JPG/JPEG/SVG/GIF folder in the Inspector. GIFs are one
gallery item with the existing dwell time, which can cut an animation mid-cycle.
Native sends once per activation/media change; PNG frames is an explicit
experimental fallback up to 10 FPS; poster displays a static first frame. Finite
embedded loops are independent from slideshow wrap-around. Information panels
keep their own frequencies and durations. Refresh handles same-stat replacements.

GIF policies: 8 MiB input, 2048 pixels per side, 200 frames, 20 million decoded
pixels, 16 MiB prepared output, one worker, 15-second watchdog, 64 MiB combined
prepared-cache/gallery budgets. Actual process RSS is higher due to decoder/
encoder/transient buffers. Invalid media is skipped while valid static content
continues. These are project limits, not documented firmware limits.

Rollback: switch back to the untouched original profile. With Studio manually
closed, remove only this independent folder or restore a previous fork backup.
For saved-page Setup changes, use this fork's Restore with its own verified
backup/receipt. Upstream receipts are rejected; upstream Restore remains available
through the original upstream plugin/state. Never reinterpret upstream lineage.

Studio and physical D200 tests must be recorded separately. Browser/simulator
rendering or code-0 replies do not prove device animation. Follow the repository's
manual checklist for timing/loops, direct PNG replacement, page changes/reconnect,
Inspector closure, sustained playback and resource measurements before making
any verified animation claim. No store submission is part of this package.

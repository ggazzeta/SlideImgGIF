# ImageSlide GIF — independent ggazzeta fork

GIF preparation and three playback choices for the D200 458×196 large display,
preserving the static slideshow, clock, WeatherAPI and CPU/GPU/RAM panels.
**The user confirms PNG-frame animation works on the tested D200; Native GIF
animates in Studio but freezes on that device.** See [hardware observations](docs/HARDWARE_OBSERVATIONS.md)
for the limited test scope. This is a community fork, not an
official Ulanzi plugin.

Fork: https://github.com/ggazzeta/SlideImgGIF. Based on
[SlideImgPlugin](https://github.com/arkamax404-max/SlideImgPlugin) revision
`cd8c36cb7a9cb0d632fa048777c23f938ed9f5c8` (0.8.1), MIT copyright Santiago Pérez.
Fork version: 0.10.1. The private profile technique attribution remains with
https://github.com/chilleno/claude-deck as acknowledged by upstream.

## Playback

Select a top-level PNG/JPG/JPEG/SVG/GIF folder. Name/date ordering, full-content
SHA-256 duplicate suppression and watching remain. Originals are never modified.
GIF frames are composited, independently centre-cropped and bounded by the
[performance policies](docs/PERFORMANCE_LIMITS.md). Bad media is skipped with
Inspector feedback while valid images continue. Use Refresh beside folder
selection for same-size/same-mtime replacements.

* **Native GIF**: explicit documented candidate; sends once on activation/media
  change. Physical support is unverified. No invented speed/pause/completion API.
* **PNG frames**: explicit experimental fallback, one shared monotonic scheduler,
  up to 10 FPS, backpressure and outdated-frame skipping via direct image delivery.
* **Static poster**: safe GIF first-frame fallback.

For the tested D200, select **GIF playback → PNG frames**. Version 0.10.0 uses
PNG frames for fresh settings and preserves an existing explicit backend during
migration. Sustained timing/lifecycle validation and macOS animation remain pending.

Media dwell time remains the slideshow interval (minimum five seconds). Changing
items may end a GIF mid-cycle. Gallery wrap-around and embedded GIF loops are
separate; finite GIFs hold the final frame until dwell expires. **Settings are now
independent per profile**, including folders, timings, backend and information
preferences. Pages within one profile share that profile's settings. Each profile
starts with a copy of the last 0.9.0 shared preferences, then changes independently.
The original shared snapshot and private backups are retained for rollback. See
[profile migration](docs/PROFILE_SETTINGS_MIGRATION.md).

## Installation and rollback — separate approval

Package: `com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin.zip`, rooted in that
folder. Windows x64 is the first target. macOS x64/arm64 dependencies are packaged
and statically verified; physical GIF support is unverified on every platform.
Dependencies are bundled; do not run npm in the installed plugin. Verify
SHA256SUMS.txt. Build/tests never install or send to Studio.

Installing, importing a clone, sending the device probe or writing saved profiles
requires explicit approval of the concrete operation. No Kenku project/release,
other buttons/plugins, Voicemeeter, Focusrite or audio routing are changed.

After approval, close Studio manually. Import the plugin ZIP through Studio if
supported, or extract its single folder into `%APPDATA%\Ulanzi\UlanziDeck\Plugins`.
UUID `com.ggazzeta.ulanzi.imageslidegif` and its matching folder coexist with
upstream. `Install-ImageSlidePlugin.ps1 -WhatIf` performs read-only preflight when
Studio is closed; without -WhatIf it installs this fork and starts Studio. The
installer validates checksums, staged inventory and safe paths, and preserves
timestamped fork backups with rollback on failure. `-ProfileFile` is optional;
none is bundled. Review/approve profile import separately when appropriate.

Prefer an independent clone of an untouched original export:

```powershell
python tools/profile_tool.py inspect <original.ulanziDeckProfile>
python tools/profile_tool.py patch <original.ulanziDeckProfile> <new-gif-clone.ulanziDeckProfile> --profile-id <exact-page-id> --clone-name "ImageSlide GIF"
```

The tool preserves device and unrelated semantics, regenerates package/page/action
IDs, retains `SmallViewMode:2`, writes/readbacks a new export and fresh receipt.
It refuses upstream slideshow/unrelated actions in slot `3_2`, even with --force.
Keep original exports, clones and receipts local: they may contain personal data
and must not be committed/shipped. Import only the concrete reviewed clone.

Setup Large Display is an alternative **private profile technique**, not an
official assignment API. Exact device/profile/page/Setup-instance binding,
request hashes, backups, atomic writes and readback/restore checks remain.
Windows helper pins exact executable hashes for Studio 3.2.11.0 and 3.3.9.0;
the manifest minimum does not relax this. The helper waits for manual closure,
never terminates Studio, and relaunches the pinned executable only after approved
setup. macOS is ProfilesV2/manual reopen. Do not invoke Setup without approval.

Rollback: switch to the untouched original profile. With Studio manually closed,
remove only the fork folder or restore the installer's timestamped fork backup.
For saved-page Setup changes, use the fork's Restore with its verified receipt
and backup. Upstream receipts are never migrated or interpreted as fork receipts;
use upstream Restore with its original plugin/state when needed. See
[migration](MIGRATION.md).

## Build and test

Plain JavaScript/Node and HTML Inspector. Sharp **0.35.5**, ws **8.21.3**, Node
minimum **20.12.2**; exact lockfile and native-package integrity checks remain.
No framework, FFmpeg or service is added.

```powershell
cd com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin
npm ci
npm test
node tools/gif-probe.js --generate
node tools/check-gifs.js "C:\path\to\download.gif"
cd ..
python -m unittest discover -s tests -v
python tools/build_release.py
```

Packaging retrieves each pinned architecture's archive and checks lock integrity
and PE/Mach-O inventories, avoiding host optional-dependency pruning. Outputs:
plugin ZIP, ImageSlideGIF-source.zip, ImageSlideGIF-SetupHelper.zip and fresh
checksums. No personal profile, upstream receipt/checksum, runtime cache, test
output, third-party GIF or unrelated binary ships. Historical artifacts remain
in Git history and a local excluded upstream-distribution archive.

Read [compatibility](docs/COMPATIBILITY.md), [backend research](docs/GIF_BACKEND_RESEARCH.md),
[architecture](docs/ARCHITECTURE.md), [test results](docs/TEST_RESULTS.md),
[identity boundaries](docs/IDENTITY_BOUNDARIES.md), and the
[Studio/D200 checklist](docs/MANUAL_VALIDATION.md). Automated/simulator evidence
is separate from hardware observations. No store submission or verified physical
animation claim is part of this initial implementation.

To choose supported downloads, prefer smaller/shorter GIF variants and validate
them in a holding folder before adding them to the slideshow. Compressed size
alone cannot predict decoded/prepared memory. The read-only checker reports
PASS/REJECT and exact reasons using the real pipeline; see
[download guidance](docs/GIF_DOWNLOAD_GUIDE.md).

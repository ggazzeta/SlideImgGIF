# PNG-only preparation research — 2026-10-13

## Verified sources

Sharp 0.35.5 remains pinned, with ws 8.21.3 unchanged. Its exact pipeline source
calculates resize factors using `pageHeight`, crops with `CropMultiPage`, and
supports multi-page TIFF output. GIF input must explicitly use animated/pages.
Sources: https://raw.githubusercontent.com/lovell/sharp/v0.35.5/src/pipeline.cc,
https://sharp.pixelplumbing.com/api-constructor/,
https://sharp.pixelplumbing.com/api-output/#tiff,
https://sharp.pixelplumbing.com/api-output/#png.
libvips GIF loading delegates disposal/partial-frame compositing to its native
decoder; pages are not independent patches:
https://www.libvips.org/API/current/ctor.Image.gifload_buffer.html.
Gifsicle offers resizing, optimization and frame manipulation:
https://www.lcdf.org/gifsicle/. Its compressed-file optimization alone does not
bound composited frame memory, and would add a separately packaged executable.

## Observed 0.10.1 source

Preparation materializes a full source RGBA strip and a second normalized strip,
retains Base64 PNGs and re-encodes a native GIF even for PNG playback. Preparation
cache and gallery retention have independent budgets. Every discovered GIF is
fully prepared. The user confirmed PNG playback on the physical D200, reported
native freeze, and now explicitly requests removal of native/poster choices.

## Candidate under test

Use only existing Sharp/libvips. Test one sequential animated decode/resize into
a private, bounded temporary multi-page TIFF, then read selected composited pages
and encode lossless PNGs. This moves the normalized intermediate out of JavaScript
RAM; it does not establish a hard native RSS bound. No repeated GIF decode per
playback frame, no external service/process, no uploaded media, no source edits.
Validate temporal/visual output against known disposal/transparency fixtures.

Sample high-rate inputs at the existing 10 FPS display cadence, preserve one-cycle
duration and embedded loop count, and retain the terminal frame for finite loops.
Reuse identical normalized frames by pixel hash. Keep original timing for sources
whose frame delays are already at least 100 ms. Bound short clips by duration as
well as source frame count/work. New limits must be recorded with actual benchmark
results before claiming improved memory or broader compatibility.

## Cache design under implementation

Discover/validate a GIF and prepare its poster; fully prepare current/next media
on demand. Derived PNG packs use source SHA-256 plus a preparation-schema version.
Keep binary PNGs and send strings in small shared LRUs, with coalesced reads and
bounded async frame requests. Use a private, bounded disk LRU with atomic writes,
validated metadata/frame hashes, safe paths, no links, and generation/lease guards.
Profiles share cache content without sharing preferences or display ownership.
Native GIF methods remain only for the isolated research probe, not production
playback. Posters remain internal loading/stop images, not a user playback mode.

## Physical assumptions

The existing 10 FPS cap/backpressure policy is retained; no faster firmware
capability is claimed. Synthetic/file tests cannot establish D200 cadence or
Studio responsiveness. The new package will require separately approved install
and physical switching/sustained playback checks.

## Prototype decision

The direct animated resize-to-TIFF prototype failed exact synthetic pixels at frame boundaries. The revised prototype decodes/composites once to an **unresized** private multi-page TIFF and resizes each selected page independently; all three known partial/disposal frames matched exactly. Choose that verified per-page path. Temporary source TIFF is bounded by the 64-million source-pixel budget plus a 272 MiB file cap, one job only, and unconditional cleanup. This exchanges temporary local disk I/O for lower JavaScript raw-buffer retention. No claim of universally optimal CPU/RSS is made.

Exact Windows runtime codec readback: libvips 8.18.7, libpng 1.6.58, TIFF 4.7.2.
The inspected pinned native GIF loader is https://raw.githubusercontent.com/libvips/libvips/v8.18.7/libvips/foreign/nsgifload.c. It advertises sequential demand and a current composited bitmap, while retaining the compressed source. The pipeline does not claim an incremental compressed-input decoder or zero native allocation. npm audit recheck on 2026-10-13: zero vulnerabilities; no dependency change.

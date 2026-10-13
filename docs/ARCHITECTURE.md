# Current media architecture ? 0.11.0

Production GIFs use PNG frames only. Discovery validates full content hashes and
prepares only posters. Current/next media triggers a single reusable worker, with
owned buffer transfer, a two-job waiting queue, watchdog and ten-second idle exit.
libvips 8.18.7 composites GIF disposal/partial frames once into a bounded temporary
TIFF; selected pages are resized separately to avoid frame-edge interpolation.
10 FPS sampling follows compositing, keeps cycle duration/finite final pixels and
reuses identical normalized pixels. PNG encoding is lossless and cached.

`prepared-media-store.js` stores versioned SHA-256 derived PNG packs atomically,
validates metadata/frame hashes and keeps small shared binary/URI/metadata LRUs.
A live-process ownership file prevents another runtime from deleting working
stages; stale ownership recovery is serialized. A bounded recency checkpoint is
written on graceful close, not every frame. Current media has an eviction lease.
A separate source-checker cache avoids contention with a running Studio plugin.
Temporary and committed cache paths never use source filenames.

One monotonic scheduler has at most one pending async read per display context.
It checks backlog before/after reads, drops overdue/stale results and stops on
replacement/removal. Preparation cancellation protects another profile still
initializing; shutdown waits for pending atomic commits and reads before releasing
cache ownership. The existing single-owner D200 slot arbitration, Inspector context
filter, settings registry, weather/system coalescing and gallery dwell logic remain.
No decoding or PNG encoding happens on a playback tick or through the Inspector.
Internal posters provide loading/stop replacement; they are not a playback option.

The sections below preserve the earlier architecture/research history.

# Architecture

Version 0.10.0 adds `ProfileRuntime` above the existing slideshow engine. It uses
read-only exact ActionID-to-profile resolution and a versioned profile-leaf store
transported through global settings. Each profile owns its slideshow engine and
timeline, while GIF scheduling, the 1 Hz gallery clock, preparation, gallery
memory, folder watchers, weather requests and system samples are shared. The
flat legacy preferences remain for rollback, with private verified backups and
SDK readback before saves are applied. See PROFILE_SETTINGS_MIGRATION.md for the
identity, lifecycle, migration and failure boundaries. The following description
also covers the original single-engine core used inside each profile.

`images.js` asynchronously opens only real top-level files, checks identity before
and after reading, never writes sources and hashes all content. `slideshow.js`
preserves global settings, name/date ordering, deduplication, watcher/debounce,
gallery dwell and information frequency/duration. Explicit Refresh discards the
stat cache; a same-size/same-mtime replacement is then hashed again. Periodic
rescans retain the stat cache to avoid repeated decoding. User Refresh is the
authority when a replacement deliberately preserves filesystem timestamps.

`gif-media.js` walks GIF blocks before Sharp decoding, bounds canvas, frame count
and stacked pixels, and intentionally decodes all pages. Libvips composes partial
frames/disposal. Each composited RGBA frame is separately cropped/resized using
centre cover. PNG frames are prepared once. GIF re-encoding uses a raw strip
with explicit pageHeight/delays/loop and keeps duplicate frames. The loop extension
stores repeats; the player and Sharp encoder use total iterations: no extension
means one play, zero means infinite, N repeats means N+1 plays. Zero delay is
preserved for native GIF; PNG streaming treats zero as 100 ms. This is an explicit
playback policy, not a device timing claim. Palette/alpha quantisation is inherent
in GIF output; PNG frames preserve the composed resized RGBA result.

`media-preparer.js` runs one internal worker job, coalesces identical hashes,
limits its queue and has a terminating watchdog. Prepared buffers are shared
by content hash across active contexts. No external process/service is used.
Main-thread scans/read operations are asynchronous. One guarded gallery tick
remains at 1 Hz. Scan and lifecycle generations are distinct; late scans cannot
replace media after settings changes/deactivation. Animation does not depend on
the Inspector or its socket.

`animation-player.js` owns one monotonic deadline scheduler across all frame-mode
contexts. It selects the current frame from elapsed time, skips superseded frames,
and sends only when the socket backlog budget allows. No pending frame queue exists.
Finite embedded loops hold the last frame until gallery dwell expires. Native
mode sends once on activation/media change; unchanged ticks/rescans do not replay
it. A static/information item replaces native delivery through the existing direct
method. Deactivation attempts a direct poster replacement; local work is removed
even if the socket is already closed. Firmware cessation remains a hardware test.

The custom protocol adapter is extended minimally. Outer and statelist target
identifiers, clear events, both active spellings, settings and argv remain intact.
A bounded reconnect delay registers again and relies on Studio to replay add/active
contexts; shutdown cancels reconnect. The runtime still accepts only large key
`3_2`. After explicit approval, `GG_IMAGESLIDE_GIF_PROBE_CONTEXT` selects an
isolated capability probe inside the fork's existing main runtime. Slideshow/Setup
handlers are not bound in that process-only test mode, preventing duplicate main
connections and competing gallery ticks. Production normal-key eligibility and
persisted settings remain unchanged; generated probe assets cover both contexts.

Setup retains the private-profile boundary and exact upstream executable pins.
Fork schemas and separate state roots reject upstream lineage. Profile cloning
regenerates package/page/Action IDs and preserves Device and unrelated semantics;
the tool now refuses non-built-in slot actions even when `--force` is supplied.
No installed profile is part of automated testing or release artifacts.

The profile runtime separates stored preferences from physical display ownership. All profile/page contexts bound to one saved D200 device UUID share a single 3_2 output lease. It revokes the previous gallery and animation context before starting its replacement. Sequence numbers reject stale async activations; unresolved device identity conservatively shares one output lease. Read-only private current-profile/page metadata suppresses inactive add events. No new SDK capability/profile getter is assumed. The Inspector is permanently bound to its action context and ignores another action's packets. False active strings/numbers are normalized before lifecycle dispatch.

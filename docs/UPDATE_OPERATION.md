# Prepared 0.11.0 ? not installed

The user requested PNG-frame playback only, more leeway for short GIFs, and lower
preparation/playback memory and CPU usage. This update removes native/poster
Inspector choices, normalizes known old backend values to PNG frames, and preserves
all profile folders, dwell and information preferences in the existing schema.

It adds lazy current/next preparation, per-page compositing/resizing, high-rate
sampling with preserved cycle duration/finite final pixels, lossless PNG frame
reuse, a reusable idle worker, and bounded private binary/send/disk caches. Defaults
are 16 MiB GIF input, 600 source frames, 64 million source pixels and a 20-second
cycle. Sampling can skip brief frames. Sources remain unchanged.

The installed 0.10.1 remains untouched. A future concrete replacement will require
explicit approval and manual Studio closure. The installer replaces only this
fork's folder under %APPDATA%\Ulanzi\UlanziDeck\Plugins, preserves a rollback
backup, validates/readbacks staged files and starts Studio normally. It never
terminates Studio, imports profiles, invokes Setup, changes saved layout/action
parameters, alters Studio binaries or touches other plugins/audio/Kenku settings.

On first use the new runtime creates this fork's private derived cache under
%LOCALAPPDATA%\ggazzeta\ImageSlideGIF\png-v2 (macOS ~/Library/Caches/ggazzeta/ImageSlideGIF/png-v2).
The 256 MiB disk cache and temporary TIFF/PNG packs are bounded, source-content
keyed, atomic and private. Peak temporary disk use can reach about 592 MiB; this
is the tradeoff for lower raw-buffer retention. See PERFORMANCE_LIMITS.md.
The source checker uses a separate cache. No media is uploaded.

Rollback: close Studio manually and restore the preserved 0.10.1 fork folder.
Preferences use the same schema; no whole-Studio settings file is restored.
The derived cache is ignored by old versions. Known prior fork metadata gains
only explicit version acceptance for restore; exact build pins, identities,
parameters, hashes, receipts and backup requirements remain unchanged.

Automated and synthetic performance evidence is in TEST_RESULTS.md and the
CACHE_*.json reports. Physical 0.11.0 playback/profile switching, sustained CPU,
memory, frame cadence and Studio responsiveness remain manual validation steps.
No store submission or hardware-verified release claim is included.

Final reviewed ZIP hash/size and source revision will be recorded after packaging.

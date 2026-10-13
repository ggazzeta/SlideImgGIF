# Performance policies ? 0.11.0

These are project policies, **not Ulanzi firmware limits**.

| Resource | Limit |
|---|---:|
| Compressed GIF / static source | 16 MiB / 8 MiB |
| GIF canvas, each side | 2048 pixels |
| Source GIF frames | 600 |
| Aggregate source / normalized work | 64 million pixels each |
| One effective GIF cycle | 20 seconds |
| Prepared unique binary PNGs | 64 MiB per clip |
| Prepared playback references | at most 201 (10 FPS plus terminal frame) |
| Runtime disk cache | 256 MiB, 512 entries |
| Temporary source TIFF | 272 MiB, one job only |
| Binary frame / Base64 send LRUs | 8 MiB / 2 MiB shared |
| Prepared metadata / discovery posters LRUs | 4 MiB / 4 MiB |
| Shared static/gallery-poster retention | 32 MiB |
| Coalesced simultaneous frame reads | 4 |
| Worker jobs / waiting buffers | 1 / 2 |
| Worker watchdog / native decode operation | 30 seconds / 20 seconds |
| Idle worker lifetime | 10 seconds |
| GIF scheduler / WebSocket backlog | 10 FPS / 1 MiB |

There is no source/normalized full RGBA stack in JavaScript in production GIF
preparation. Native libvips/libnsgif still needs the compressed input and compositing
buffers; OS allocators/page cache and Sharp's own transient allocations mean these
policies are **not a process RSS ceiling**. The native cache is disabled in the
worker. Source buffers transfer to the worker when owned and transferable; waiting
buffers are bounded. Static inputs retain the existing 40-million-pixel policy.

Worst-case preparation can temporarily use the 256 MiB disk cache plus a 272 MiB
TIFF and a 64 MiB pending PNG pack (about 592 MiB, excluding small metadata).
Intermediate files are removed on success, failure, cancellation and next-start
recovery. Cache entries are atomic, validated and source-content/version keyed;
a live process owns the cache. Another runtime is refused rather than deleting
its working files. The source checker has a separate 256 MiB cache.

Discovery reads/hashes sources and decodes only posters. Current/next GIFs are
prepared; PNG encoding happens once per content/schema cache miss, never per
playback frame. Inactive galleries release their data. A warm frame uses the
URI LRU; otherwise it uses binary cached PNGs or a coalesced bounded disk read.
Base64 conversion can repeat after URI eviction. Frame reads do not accumulate
behind the scheduler: at most one is outstanding per context; overdue/stale results
are dropped. No weather polling increase or per-profile frame timer is introduced.

No lossy palette quantization is enabled. Duplicate normalized frames reuse bytes;
low-rate inputs retain their effective delays. High-rate inputs are sampled after
correct disposal/compositing, preserving cycle duration and final pixels but losing
some brief frames. Zero delays use the existing 100 ms policy. Finite embedded loops
hold the final frame; slideshow dwell may still end an item mid-cycle.

See CACHE_PERFORMANCE_MEASUREMENTS.json for one isolated synthetic comparison and
MEDIA_CACHE_RESEARCH.md for codec sources/tradeoffs. Studio responsiveness, actual
D200 cadence/sustained playback and macOS animation remain manual checks.

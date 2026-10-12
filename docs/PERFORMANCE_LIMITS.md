# Performance policies

These are conservative project policies, **not Ulanzi firmware limits**.

| Resource | Initial limit |
|---|---:|
| Compressed source file | 8 MiB |
| GIF canvas, each side | 2048 pixels |
| GIF frames | 200 |
| Aggregate source decoded pixels | 20 million |
| Aggregate normalized pixels | 20 million |
| Prepared GIF + PNG frame strings | 16 MiB per media |
| Content-addressed preparation cache | 32 MiB |
| Gallery retained prepared content | 32 MiB |
| Worker concurrency | 1 |
| Waiting preparation jobs | 8 |
| Worker watchdog | 15 seconds |
| Individual native processing operation | 10 seconds |
| PNG scheduler | up to 10 FPS |
| WebSocket bytes in flight | 1 MiB |

In 0.10.0, the 32 MiB gallery budget is shared across all active profiles rather
than repeated per profile; inactive profiles release their prepared gallery.
There is still one shared GIF scheduler and one gallery clock. Identical folder
watchers, weather requests and system samples are shared. Preference metadata
has separate project caps of 256 profiles and 1 MiB serialized settings; private
backup/read-only lookup bounds are described in PROFILE_SETTINGS_MIGRATION.md.

The pinned encoder accepts delay values up to 65535 ms and iteration counts up
to 65535. Sources outside that encoding range are rejected with an actionable
timing error rather than silently changing finite loops or frame timing.

RGBA decoded data can use 80 MB, with another 80 MB normalized strip. Native
codec buffers and encoding copies add transient memory. Prepared caches together
are bounded at 64 MiB; this is not a process-RSS limit. A refresh can temporarily
retain old and new gallery contents. Existing static inputs retain their 40 MP
limit and asynchronous Sharp processing. Smaller galleries are recommended until
device measurements establish a comfortable working set. Preparation processes
one media item at a time; invalid media is skipped with an actionable Inspector
message, and valid static media remains in the gallery.

10 FPS is an initial candidate cap, not evidence that Studio or D200 can sustain
it. Native GIF has no documented adjustable FPS API. Frame mode intentionally
skips overdue frames and can distort perceived timing for very short frame delays;
it does not count frames as gallery slides or increase weather requests. Actual
bytes in flight use `ws.bufferedAmount`; acknowledgements do not select a backend.
See PERFORMANCE_MEASUREMENTS.json for local worker/fake-socket measurements and
MANUAL_VALIDATION.md for the missing Studio/device measurements.

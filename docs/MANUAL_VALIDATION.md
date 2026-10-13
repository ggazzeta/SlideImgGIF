# Studio and physical D200 validation

Current result: the user reports Native GIF animates in Studio but freezes on the
physical D200; PNG frames animates on the physical device. The approved plugin-only
installation is complete. Synthetic probe, sustained measurements and the remaining
lifecycle cases are pending. See HARDWARE_OBSERVATIONS.md. Simulator/browser, Studio preview,
code-0 replies and successful sends do not prove physical animation. Fill separate
Studio and D200 results; record Studio executable version/hash, firmware, connection
type, OS, backend and exact context. Do not record keys, personal paths or image payloads.

## Native capability probe first

1. After explicit approval, install only the independent GIF plugin. Preserve the
   original export; prepare/import a clone with a fresh name and IDs using the
   profile tool. Slot `3_2` must have a built-in small-window source action.
2. From source plugin directory run `node tools/gif-probe.js --generate` (no send).
   This creates red/green/blue 458×196 frames with 200/400/600 ms delays and infinite
   looping. No third-party media is involved.
3. Obtain an exact normal-key control context and then the actual large-display
   context on a separately approved test profile. Production slideshow rejects
   normal keys; the isolated capability mode accepts either exact fork context.
4. After explicit approval, close Studio manually and launch it from a shell with
   process-only environment variable `GG_IMAGESLIDE_GIF_PROBE_CONTEXT` set to the
   exact `fork-action-uuid___key___ActionID` string. The fork's existing main runtime
   binds only the capability probe, preventing a duplicate main socket or gallery
   tick from racing with the test. On matching add/active, it sends type 3 GIF data
   URI, then direct type 1 PNG after 10 seconds. Other contexts are ignored and
   global settings are not rewritten. Standalone `--send-approved` is refused.
   Stop/relaunch Studio manually without this process-only variable to return to
   normal playback. No other plugin reads this fork-specific variable.
5. Observe distinguishable frame changes, delay ratios, loop, and static replacement
   separately in Studio and D200. Record failure as failure, regardless of reply.
   If native fails only on physical display, select PNG frames deliberately; do not
   switch backends based on acknowledgement or assume absolute paths are supported.

| Case | Studio preview | Physical D200 | Timing/notes |
|---|---|---|---|
| Normal control key native GIF | Pending | Pending | 200/400/600 ms |
| Actual `3_2` native GIF | Animates (user report) | Frozen frame (user report) | User media; synthetic fixture/timing not confirmed |
| Ten-second direct PNG replacement | Pending | Pending | Stale GIF must cease |
| Page away / return | Pending | Pending | New activation begins playback |
| Socket loss / reconnect | Pending | Pending | No local pump while disconnected |
| Finite GIF loop | Pending | Pending | Holds final frame until dwell |
| Selected PNG-frame backend | Not separately reported | Animates (user report) | Basic playback only; measure drops/cadence |

## Sustained regression and measurements

* Play mixed PNG/JPEG/SVG/GIF for at least 30 minutes. Include portrait/wide media,
  transparent partial frames/disposal, finite and infinite loops, short/zero delays.
* Compare source and displayed temporal sequence, not only frame count. Palette
  optimisation can change representation. Confirm per-frame 458×196 centre cover.
* Switch to static, clock, weather and system panels; enable all three with short
  frequencies/durations. Verify no stale frame overwrites them, gallery counters
  remain correct, and weather traffic stays at its existing refresh policy.
* Close the Inspector, select another key, deactivate/remove the action, change
  page/profile, disable images with information enabled, change folder and backend.
  Confirm no redundant native replay on a clock/gallery tick or unchanged rescan.
* Restart Studio manually; disconnect/reconnect D200 and WebSocket. Test multiple
  large-display contexts. Record whether Studio replays add/active events and native
  animations are replaced/ceased on every transition.
* Test malformed, truncated and oversized GIFs; keep a valid PNG present. Test an
  atomic same-size/same-mtime replacement followed by Refresh. Source files must
  remain untouched, errors must be actionable, and no secrets may appear in logs.
* Measure plugin/Studio CPU, RSS peak and steady memory, actual display frame
  cadence/drops, bytes per second and Studio click/page responsiveness. Record
  instruments, observation duration and raw measurements; local fake-socket
  benchmarks are not substitutes.
* Test rollback: switch to the untouched original profile. Fork Setup restore must
  use its own verified lineage/backup; upstream restore must remain available
  through upstream. Restore a replaced fork plugin backup with Studio closed.
  Never terminate Studio or alter any audio/plugin unrelated to this fork.

Do not submit to the store or describe GIF animation as physically verified until
the relevant platform/backend rows have observations and sustained results.

## 0.10.1 profile switching regression

After its approved installation, configure Profile A and Profile B with clearly distinguishable folders. Stay on A for several dwell intervals: only A's media should appear and its Inspector folder must stay fixed. Switch to B, wait, then return to A; confirm each folder, backend, dwell and enabled information panels remain independent. Repeat with the Inspector closed and with different pages in one profile (pages share that profile's preferences). Switch to a page using another plugin, then return, restart Studio, and reconnect the D200. Check that no old folder frame/poster overwrites the current output. Separately test two D200 devices if available; no multi-device hardware result is claimed.

## 0.11.0 cache/optimization checks

After its separately approved installation, verify the Inspector offers only GIF participation (no native/poster selector). Compare a short high-rate clip with its source: cycle duration and finite final frame should be retained while brief frames may be sampled out. Test a high-detail clip, mixed static/GIF ordering and existing clock/weather/system interruptions. On cold first use a poster can remain briefly while preparation completes. Revisit the clip and restart Studio: a valid cached clip should not be re-decoded. Switch profiles/pages and close the Inspector during preparation; no old result may overwrite the new screen or cancel the next profile's gallery.

Watch sustained CPU, memory, private disk growth, frame cadence and Studio responsiveness, keeping them separate from the isolated synthetic measurements. Replace a file without changing size/mtime and use Refresh; source identity must change. Test malformed media, a >20-second cycle and files beyond the source-work bound: static media should remain usable with actionable rejection. Cache corruption should be rejected/rebuilt on refresh. Rollback uses the 0.10.1 fork-folder backup; do not restore Studio's entire global settings file.

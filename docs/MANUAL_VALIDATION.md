# Studio and physical D200 validation

Status: hardware available for user observation; no installed change or device
packet delivery has been approved or performed. Simulator/browser, Studio preview,
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
   context. The runtime rejects normal keys; the standalone approved probe can
   target either one. Set `GIF_PROBE_CONTEXT` to the exact action UUID/key/ActionID.
4. With explicit approval for these deliveries, invoke the probe with address/port
   as the first two argv arguments, then `--send-approved`. It sends type 3 GIF
   data URI and replaces it with direct type 1 PNG after 10 seconds, then closes.
5. Observe distinguishable frame changes, delay ratios, loop, and static replacement
   separately in Studio and D200. Record failure as failure, regardless of reply.
   If native fails only on physical display, select PNG frames deliberately; do not
   switch backends based on acknowledgement or assume absolute paths are supported.

| Case | Studio preview | Physical D200 | Timing/notes |
|---|---|---|---|
| Normal control key native GIF | Pending | Pending | 200/400/600 ms |
| Actual `3_2` native GIF | Pending | Pending | Same fixture |
| Ten-second direct PNG replacement | Pending | Pending | Stale GIF must cease |
| Page away / return | Pending | Pending | New activation begins playback |
| Socket loss / reconnect | Pending | Pending | No local pump while disconnected |
| Finite GIF loop | Pending | Pending | Holds final frame until dwell |
| Selected PNG-frame backend | Pending | Pending | Record drops/cadence |

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

# 0.11.0 validation ? 2026-10-13

New tests cover lazy posters/current-next preparation, binary packs, process
ownership, disk leases/eviction, bounded shared LRUs, corruption/readback/rebuild,
large detailed posters, exact partial/transparency/disposal pixels, high-rate
sampling with duration/finite-loop terminal behavior, shared duplicate pixels,
late async frame reads/backpressure, source replacement, temporary cleanup,
shutdown during atomic commit, reconnect and pending-profile cancellation.
All previous static/information, profile/Inspector and exact Setup checks remain.
107/107 Node tests pass on 20.12.2 and 24.21.0, with no skips. The staged Windows x64 smoke passes real bundled Sharp preparation, PNG-only packets (zero native GIF packets), static replacement and two synthetic profiles sharing one D200 slot through fake SDK settings readback. Universal native integrity/architecture checks pass. 36/36 Python release/restore checks pass, with no skips. Store metadata retains the existing macOS manual-reopen and clock-overlay caveats. Same-context late activation and profile rebinding have additional regression coverage.

One synthetic 640?360, 80-frame, 30 ms clip measured about 177 MiB peak process RSS
on the old pipeline and 72 MiB on the new pipeline; process CPU was 2.37 versus
0.75 seconds. A 1024?768/80-frame clip (62,914,560 decoded pixels) was actually
rejected by the old policy and accepted by the new pipeline at about 76 MiB
sampled peak RSS. Hot prepared lookup caused no additional decode or frame read.
These are isolated Node 20 Windows results, not Studio/device measurements, and
sampled RSS is not a universal/hard memory ceiling. TIFF preparation trades
bounded local disk I/O for lower raw-buffer retention. See the two CACHE_*.json
measurement reports and MEDIA_CACHE_RESEARCH.md. npm audit: zero vulnerabilities.

## Historical validation

# Validation results — 2026-10-12

## 0.10.1 display ownership correction

The user reported that the physical display cycled through multiple profiles' folders after installing 0.10.0. Its preference registry and private backup hashes were verified locally, but separate settings did not ensure separate playback: its tests allowed several profile contexts to pump the same physical slot. This was a release defect.

The correction grants one owner per saved D200 device UUID/slot, stops the previous gallery and GIF pump before rendering the next profile, rejects late activation results, and refuses playback for explicitly inactive adds. Read-only `setting_source.json` and saved `Pages.Current` identify unselected saved profiles for add events; this is the existing private profile metadata technique, not a documented SDK capability getter. Explicit active events remain the lifecycle authority. Unresolved device identity conservatively allows one display owner.

Both active-event spellings now parse false strings/numbers explicitly. The Inspector binds its context once and rejects foreign action packets, preventing another profile's state from retargeting saves. New synthetic regression cases cover switch/return with missing deactivation, inactive adds, out-of-order resolution, and foreign Inspector messages. Actual D200 switching after this correction remains unverified. Both Node versions (20.12.2 and 24.21.0) pass 94/94 tests. The staged Windows x64 package smoke passes with real bundled Sharp and fake SDK sockets, including two profiles sharing one display and switching back to the first. All 36 Python checks pass, including exact old-fork restore boundaries and release inventories.

## 0.10.0 profile update

90/90 Node tests pass on 20.12.2 and 24.21.0. Added checks cover complete profile
isolation, same-profile pages, concurrent serialized saves/SDK readback, stale
echoes and unsupported-schema refusal, backup integrity, scoped animations,
information switching and gallery release, shared resources, reconnect, read-only
profile resolution, and 0.9.0 fork restore compatibility. The packaged Node 20.12.2
smoke test covers bundled worker decode and two independent synthetic profiles
through fake SDK sockets. No installed update or real preference migration was run.
36/36 Python checks pass, including fresh package inventories/checksums and
Windows prior-fork-version fingerprint/restore boundaries. Exact native dependency
pins, architecture inventories and executable hashes remain unchanged.
The earlier 0.9.0 runs below remain historical evidence.

## Baseline before implementation

Upstream `cd8c36c`, Node 22.14.0: 59 tests, 58 passed, one failed while Windows
removed a temporary macOS-helper fixture (`ENOTEMPTY`). Python: 34 tests, 32 passed,
two optional profile tests skipped. npm ci/audit reported zero vulnerabilities.
These are actual runs, not the upstream TEST-REPORT.txt. Bounded cleanup retries
were added to temporary fixture removal; no production safety check was relaxed.

## Implemented automated validation

77 Node tests pass, zero skipped/failing, on exact **20.12.2** and current LTS
**24.21.0** Windows x64. Official runtime archives were SHA-256 checked before use.
See TEST_RUNTIMES.json. Coverage includes static/information regressions, synthetic
GIF header/content/limits/truncation, uppercase/mixed folders, full-content hashes,
same-stat Refresh, frame dimensions/delays/loops/duplicate preservation, known
RGBA disposal/partial/transparency composition, re-encoded native temporal pixels,
worker timeout/queue/cancellation, official packet fields, frame cadence/lag/drop,
multiple contexts sharing media, settings whitelist persistence, Inspector absence,
deactivation/late scan/probe results, information replacement, bounded reconnect
and isolated capability probe behavior for normal and large-display contexts.

Python final suite including artifacts: **35/35 passed, zero skipped**. Before
artifact construction, only the artifact test was temporarily skipped. Optional
external profile fixtures were replaced by original
synthetic fixtures so clone identity and production-shaped atomic backup/restore
actually run. Slot overwrite refusal includes --force. Exact executable pins and
Setup request/binding/hash/restore integrity tests remain. Installed Setup is never
run as a test. Final artifact validation is recorded in TEST-REPORT.txt.

## Simulator evidence (separate)

The unmodified official simulator router and setStateIcon function at SDK revision
`550ab80c69285ecf259bd494a7fff767c14f0c0f` were invoked with fake sockets/DOM.
Type 3 GIF then type 1 replacement were forwarded for normal control key 0_0 and
large key 3_2; four code-0 replies were observed. The renderer receives a GIF data
URI as img.src. This verifies packet/convention handling only. No browser rendering,
real Studio preview or physical animation was observed. SIMULATOR_EVIDENCE.json
records this boundary explicitly.

## Packaged runtime

The integrity-checked release stage was smoke-tested on Node 20.12.2 Windows x64:
its bundled Sharp worker decoded the synthetic GIF, its bundled adapter delivered
one native packet despite an unchanged render, and a direct static replacement
followed. No Studio connection was opened. PACKAGE_VERIFICATION.json records the
run. macOS dylib/architecture inventories are statically verified, not runtime or
hardware tested. The fork/runtime source revisions are in BUILD_PROVENANCE.json.

## Local measurements (separate)

PERFORMANCE_MEASUREMENTS.json records the final Node 24 run: original synthetic
916×392, 20-frame source, about 2.46 MB compressed, about 4.06 MB prepared. Single
worker preparation took approximately 2.78 seconds; peak process RSS was about
154 MiB; main event-loop p99 was about 16 ms. Five-second two-context frame playback
used an accepting fake socket, approximately 102 ms average cadence, zero backlog
drops in that run. CPU included preparation/playback. This is neither sustained
device evidence nor a Studio responsiveness measurement. 10 FPS remains an initial
cap awaiting physical observations.

## Hardware and installed setup evidence

Update after installation and user testing: the approved plugin-only installation
was completed; all 197 installed files matched the approved ZIP, Studio reopened
and the fork runtime was running. The agent did not import profiles, invoke Setup
or alter audio. The user then confirmed Native GIF animates in Studio but leaves
a frozen frame on the physical D200, and that selecting PNG frames makes the
physical animation work. Recommend PNG frames on this tested setup. This is basic
user-confirmed playback, not a measured sustained/lifecycle validation. See
[hardware observations](HARDWARE_OBSERVATIONS.md).

The following paragraph records the initial build's pre-installation state:

D200 is available for user observation. Studio 3.3.9.0 executable hash matches an
exact helper pin. No plugin install/import/profile mutation, Studio/device GIF
delivery, audio change or process termination has occurred. Clone preparation from
a read-only saved-file snapshot refused an unresolved external profile reference;
the original snapshot is local/private and no clone was imported. A complete official
original export is needed. No hardware-verified or macOS-animation claim is made.
Complete MANUAL_VALIDATION.md after approving concrete installation/profile/test
operations; native cessation/replacement, sustained cadence and physical backend
selection remain pending.

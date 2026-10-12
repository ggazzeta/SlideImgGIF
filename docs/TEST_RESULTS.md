# Validation results — 2026-10-12

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

D200 is available for user observation. Studio 3.3.9.0 executable hash matches an
exact helper pin. No plugin install/import/profile mutation, Studio/device GIF
delivery, audio change or process termination has occurred. Clone preparation from
a read-only saved-file snapshot refused an unresolved external profile reference;
the original snapshot is local/private and no clone was imported. A complete official
original export is needed. No hardware-verified or macOS-animation claim is made.
Complete MANUAL_VALIDATION.md after approving concrete installation/profile/test
operations; native cessation/replacement, sustained cadence and physical backend
selection remain pending.

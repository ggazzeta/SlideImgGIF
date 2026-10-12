# GIF backend research (before implementation)

## Verified documentation and source

[Official legacy method source](https://github.com/UlanziTechnology/plugin-common-node/blob/9e478b2586a4ebdadbd590fc8f80519df18a8d32/libs/ulanziApi.js), lines 499–590, emits `state` with statelist type 1/data, 3/gifdata or 4/gifpath. All items contain uuid/key/actionid, textData and showtext. Context is the `uuid___key___actionid` string. The data argument is passed through without prefix conversion. README specifies Base64 GIF data, and paths relative to the plugin root. Use bare Base64 for the GIF candidate; preserve upstream static data URIs and outer context identifiers. No speed, pause, completion or capability contract exists here. V3.1 setImage is separate.

Sharp remains pinned to 0.35.5; ws remains 8.21.3. Installed exact Sharp type declarations describe `animated:true` as `pages:-1`, raw `pageHeight`, metadata pages/delay/loop, and GIF encoder loop/delay. Read current [constructor](https://sharp.pixelplumbing.com/api-constructor/), [metadata](https://sharp.pixelplumbing.com/api-input/), and [GIF output](https://sharp.pixelplumbing.com/api-output/#gif) documentation alongside the installed version. Default input is one page; default GIF output loop is infinite. Explicitly preserve metadata loop (absent = one play), frame timing and composed frame pixels. Resize each composed frame, then construct an output strip with raw pageHeight; never resize the strip as a static image.

## Proposed selection

First create a synthetic red/green/blue GIF with 200/400/600 ms delays, an exact type-3 packet fixture and a manually invoked device probe. Compare a normal key and the actual `3_2` context, then replace with direct PNG. Native is the documented candidate, not a device-verified backend. A safe poster setting remains available. An explicit bounded PNG-frame backend can be selected for device experiments; acknowledgements do not trigger automatic selection. Existing dwell time bounds the animation and may cut a cycle short. Gallery loops and embedded loops are independent.

## Final payload decision after simulator source inspection

The initial bare-Base64 proposal above is superseded. The pinned official simulator
`static/assets/index.js` setStateIcon assigns `gifdata` directly to `img.src`, just
as it does static `data`. The legacy SDK passes through without conversion. Use
`data:image/gif;base64,...` consistently for the native candidate and probe; test
both packet forwarding and the official rendering function with fake DOM. Bare
Base64 would be a relative URL in that renderer. This verifies the simulator
convention, not Studio or firmware acceptance. Physical acceptance remains pending.

## Evidence boundary

Automated packets, decoded pixels and fake sockets establish processing/transport behavior only. Browser/simulator/Studio preview cannot establish D200 animation. Native cessation on deactivation is not documented: send a static poster on a live deactivation; socket loss prevents delivery. Verify the resulting physical behavior before recommending native playback.

Project limits are performance policies, not Ulanzi specifications. Begin at 8 MiB input, 2048 per dimension, 200 frames, 20 million decoded RGBA pixels, 20 million normalized pixels, 16 MiB prepared output, 64 MiB prepared cache, one worker job, eight queued jobs and 15 seconds per job. Frame candidate: 10 FPS and 1 MiB socket backlog, with outdated frames skipped. These defaults need device measurements.

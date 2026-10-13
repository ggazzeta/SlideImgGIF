# Choosing and checking GIF downloads ? 0.11.0

Prefer short clips, not large/high-resolution animations. The plugin automatically
normalizes GIFs to 458?196 PNG frames and samples high-rate sources for its existing
10 FPS cap. It preserves one-cycle duration and finite loop behavior, but sampling
can skip brief source frames. Originals are never modified.

Policies: GIF input ?16 MiB, each side ?2048 pixels, ?600 source frames,
`width ? height ? source frames ?64,000,000`, and a **20-second maximum cycle**.
Zero delays count as 100 ms. Looping forever is allowed for a short cycle; gallery
dwell still controls how long an item is visible. Source dimensions/content,
processing time, temporary storage and prepared output are also bounded.

A prepared clip can use up to 64 MiB of unique binary PNGs. The private disk cache
is 256 MiB with eviction; the entire folder no longer needs its GIF frames in RAM.
Current/next media is prepared on demand. Invalid content is rejected, not repaired
by relaxing decoder validation. Read a rejection message and choose a shorter or
lower-resolution variant when it exceeds the source work budget.

From the source plugin directory:

```powershell
node tools/check-gifs.js "C:\path\to\download.gif"
node tools/check-gifs.js "C:\path\to\holding-folder" --json
```

The checker validates/prepares through the same pipeline, reports source versus
playback frames, duration and unique binary bytes, and leaves source files intact.
It never connects to Studio or follows subfolders/links. It uses a separate private
bounded checker cache, so it can run while Studio uses its runtime cache. A PASS
establishes processing compatibility, not physical firmware playback guarantees.
Profile folders and information preferences remain independent; pages within one
profile share that profile's preferences.

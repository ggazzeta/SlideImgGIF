# Choosing and checking GIF downloads

Supported cannot be guaranteed from the extension or compressed download size.
The source must be a real GIF and fit both decoded and prepared-media budgets.
Choose small dimensions, shorter animations and fewer frames when the provider
offers variants. 458×196 is the target; a few dozen frames gives a better chance
than a long/high-resolution animation. These are practical choices, not guarantees.

Current policies: non-empty input ≤8 MiB, each canvas side ≤2048, ≤200 frames,
`width × height × frames ≤20,000,000`, prepared PNG frames plus GIF data ≤16 MiB,
and ≤32 MiB prepared content for the whole gallery (static media also counts).
Some extreme frame delays/loop counts exceed the pinned encoder's range. Actual
validation also rejects corrupt GIFs, unsafe links and preparation timeouts.

Examples: 458×196 with 200 frames is 17,953,600 decoded pixels; 640×360 permits at
most 86 frames under the pixel budget; 640×378 permits at most 82. Prepared bytes
depend on image detail/transparency and are only known after preparation. A small
compressed download can expand past the prepared limit.

Download to a holding folder, run the source-workspace checker, then put passing
files in the slideshow folder and Refresh. From the source plugin directory:

```powershell
node tools/check-gifs.js "C:\path\to\download.gif"
node tools/check-gifs.js "C:\path\to\holding-folder"
```

The checker uses the same bounded pipeline, prints PASS/REJECT with real reasons,
reports prepared bytes and the combined unique-GIF budget, and never connects to
Studio, changes source files or follows subfolders. It is a development utility
in the source workspace, not an installed-plugin update. Prefer PNG-frame playback
for the user-tested D200; a checker PASS establishes preparation support, not new
device/firmware guarantees.

Validation: the development branch's 79/79 Node tests pass on 20.12.2 and
24.21.0. Synthetic checker tests cover actual preparation, content mismatch,
excluded filenames, source integrity and omission of private paths in read errors.

Version 0.9.0 shares global configuration by design, which explains why changing
a folder changed other profiles. The user requested fully independent settings;
0.10.0 implements [profile-scoped preferences](PROFILE_SETTINGS_MIGRATION.md) with
preserved legacy settings and Setup/restore lineage. It does not put preferences
into per-action parameters or overwrite SmallViewMode:2. The installed 0.9.0 stays
unchanged until the prepared update is explicitly approved.

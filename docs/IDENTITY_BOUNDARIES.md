# Identity boundaries

Main UUID: com.ggazzeta.ulanzi.imageslidegif; folder: com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin. Actions: .slideshow and .setup. Four main segments are retained.

Changed files (reviewed scope):

* `com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin/plugin/setup.js`
* `com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin/plugin/slideshow.js`
* `com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin/helper/compatibility.json`
* `com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin/helper/Invoke-ImageSlideSetup.mjs`
* `com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin/helper/Invoke-ImageSlideSetup.ps1`
* `com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin/helper/receipt-template.json`
* `com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin/property-inspector/inspector.js`
* `com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin/property-inspector/setup-inspector.js`
* `com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin/test/macos-setup.test.js`
* `com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin/test/protocol-client.test.js`
* `com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin/test/setup.test.js`
* `com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin/manifest.json`
* `com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin/package.json`
* `com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin/package-lock.json`
* `tools/profile_tool.py`
* `tools/build_release.py`
* `Install-ImageSlidePlugin.ps1`
* `tests/test_delivery.py`

No migration of upstream setup lineage is supported. Use upstream restore with its original plugin and state before attempting fork setup. Fork schemas and state roots reject upstream requests/receipts. Exact executable pins, device/profile/page/Setup binding, request hashes, backups, atomic replacement and restore guards are retained. Helpers and profile tooling refuse an upstream slideshow or unrelated slot, including --force. Original distribution artifacts remain historical only; fork packaging excludes them.

Final delivery boundaries: new plugin ZIP, ImageSlideGIF-source.zip and
ImageSlideGIF-SetupHelper.zip; fresh SHA256SUMS.txt. Installer profile input is
optional and explicit; no original profile or receipt is shipped. Setup remains
explicit, with the original close-wait/relaunch contract and exact build pins.
Manifest marks PrivateAPI true because Setup uses private storage. Store metadata
labels physical support unverified and is not submitted. Localisation files do
not contain UUIDs; their upstream strings are preserved alongside the distinctive
manifest category/name. Tests use synthetic profiles and fork schemas; historical
restore artifacts are archived locally and retained unchanged in Git history.

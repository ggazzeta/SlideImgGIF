# Fork and restore boundaries

0.10.0 adds the user-requested fully independent profile model. All preferences
move into profile leaves while the original flat 0.9.0 snapshot remains at the top
level for rollback. Private before/latest backups are verified and SDK readback
confirms saves. See docs/PROFILE_SETTINGS_MIGRATION.md. No saved action parameters,
SmallViewMode, IDs, pages, other buttons or audio settings change. Prior fork 0.9.0
center metadata remains restorable; unknown versions and upstream UUIDs refuse.
Exact Windows executable pins are unchanged.

This is a new independent plugin, not an in-place upstream upgrade.

* Main UUID: `com.ggazzeta.ulanzi.imageslidegif` (four segments).
* Actions: `.slideshow`, `.setup`; matching `.ulanziPlugin` folder; version 0.10.0.
* Setup state: `%LOCALAPPDATA%\ggazzeta\ImageSlideGIF` on Windows;
  `~/Library/Application Support/ggazzeta/ImageSlideGIF` on macOS.
* Installer backups: `_ggazzeta_imageslidegif_backups`; new checksums only.
* Fork request/receipt/diagnostic/compatibility schemas use the fork UUID namespace.
  No upstream receipt migration is supported. Restore upstream using its original
  plugin, state and backups, never the fork helper.

Profiles are independently cloned from untouched exports. Package/page/action IDs
regenerate; Device binding, unrelated semantics and SmallViewMode:2 remain. Slot
3_2 must be the built-in small-window action. Fork tools refuse upstream/unrelated
slots even with --force. Original export remains rollback authority; personal
exports/receipts remain local and never ship.

Exact Windows build/hash checks, Setup instance/page/device/profile binding,
expiration/request hashes, backup integrity, atomic writes and readback remain.
No installed-profile tests or automatic Setup occur. Windows helper waits for
manual Studio closure and relaunches only its verified executable after approved
setup. It never terminates Studio. macOS requires manual reopen. Manifest minimum
version is not evidence of helper compatibility with later builds.

The [identity inventory](docs/IDENTITY_BOUNDARIES.md) records reviewed boundary
changes. Root upstream source/release/profile/checksum artifacts are excluded from
the new release; existing Git history retains them. Store metadata labels physical
animation unverified and is not submitted. MIT copyright Santiago Pérez remains.

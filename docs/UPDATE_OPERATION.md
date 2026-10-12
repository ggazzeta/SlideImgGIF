# Prepared 0.10.1 correction ? not installed

Package: `com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin.zip`, version 0.10.1,
27,683,473 bytes, SHA-256 `f5f1be835263ce91dbdae30bcda010b962532a7a0ca8095aa915a44f4b3b0c1f`.
Runtime source: `8b5b399f7eb52422a99b1c1e41b32afe7a01d0ef`, branch `fix/profile-display-ownership`.

The user reported that 0.10.0 played folders from multiple profiles on the same
physical D200. A read-only inspection confirmed two distinct folders remain saved
in two profile leaves. This correction gives the physical large-display slot one
owner per D200 device, stops old profile/page frame work before replacement,
rejects late activations, parses false active strings correctly, and prevents
foreign Inspector packets from retargeting settings. It preserves the current
profile preferences and their private backups. See TEST_RESULTS.md and
PROFILE_SETTINGS_MIGRATION.md for evidence and the private metadata boundary.

After explicit approval and manual Studio closure, replace **only** the installed
0.10.0 fork folder under
`%APPDATA%\Ulanzi\UlanziDeck\Plugins\com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin`.
Verify the installed 0.10.0 inventory against its approved ZIP first; preserve
unexpected changes rather than overwriting them. The installer stages, validates
and reads back the new files, preserves a timestamped fork-folder backup, rolls
back deployment failure, and starts Studio normally. It never terminates Studio.

No profile import, saved layout/action parameter write, Setup invocation, GIF probe,
Studio binary change, other plugin replacement or audio adjustment is included.
Kenku, Voicemeeter, Focusrite and Windows audio routing remain outside this operation.
Existing SmallViewMode:2 assignments and exact Setup executable pins remain intact.
The only helper lineage change explicitly accepts known prior fork 0.10.0 metadata
alongside 0.9.0, with the same exact identity/parameter/integrity checks.

Rollback: close Studio manually and restore the new timestamped **fork** folder
backup. The preference registry uses the same schema and is readable by 0.10.0;
that build retains the reported playback defect. Preserve the separate original
0.9.0 backup and private preference snapshots. A 0.9.0 rollback reads the original
shared configuration. Do not overwrite the whole Studio global settings file.

Physical switching on 0.10.1 remains a manual validation step. Check distinct
folders in A/B, stay on each for several dwell intervals, return to A, close the
Inspector, change pages, restart Studio and reconnect the D200.

Approval is required by the user's section 3: ?Installing/replacing plugins ?
requires my explicit approval of the concrete prepared operation.? The prior
approval covered the specific 0.10.0 artifact; this new ZIP needs approval.

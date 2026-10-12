# Prepared 0.10.0 replacement — not installed

Package: `com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin.zip`, version 0.10.0,
27,682,588 bytes, SHA-256 `9d92d98bc94451a87d51fcbd657191800c32bf487a8f0cd01f83db2ab0a77315`.

The user requested fully independent profile settings. This operation replaces
only the installed 0.9.0 fork folder under
`%APPDATA%\Ulanzi\UlanziDeck\Plugins\com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin`
with the reviewed package after the user closes Studio manually. Reverify the
installed fork/version/inventory before replacement and preserve any unexpected
new work. The installer stages/readbacks the package, preserves a timestamped
fork-folder backup, rolls back on failure, and opens Studio normally. It never
terminates Studio or modifies its executable.

On activation, this fork's new runtime backs up its own existing preferences
privately, retains the flat shared snapshot for rollback, and stores independent
profile leaves through the SDK global-settings contract with readback. Every
profile starts from a copy of the last shared preferences; selecting another
folder/timing/backend/information configuration then changes only that profile.
See PROFILE_SETTINGS_MIGRATION.md for private backup locations and exact behavior.

This does not import a profile, regenerate IDs, change saved page/action parameters,
alter SmallViewMode:2, invoke Setup, run the isolated GIF probe or touch other
buttons/plugins. Kenku, its release, Voicemeeter, Focusrite and Windows audio
routing are untouched. Existing large-display assignments stay in place. Basic
PNG-frame animation was user-confirmed on 0.9.0; the new installed migration and
actual profile switching remain manual-validation steps after replacement.

Rollback: manually close Studio and restore the timestamped **fork** folder backup.
0.9.0 reads the retained flat shared configuration. Preserve the new private
preferences backups; 0.9.0 can drop the newer registry if its settings are edited.
Restore only this fork's backed-up preferences via its SDK route if needed, never
overwrite Studio's entire global settings file. That recovery is a separate
concrete approved operation. Setup backup/receipt routes and exact build pins
remain unchanged, with only known prior fork 0.9.0 metadata explicitly supported.

Replacement requires approval under the user's section 3: “Installing/replacing
plugins … requires my explicit approval of the concrete prepared operation.” The
earlier approval covered the specific 0.9.0 installation, not this new artifact.

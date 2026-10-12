# Prepared operation — installation has not been approved or performed

Reviewable package: `com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin.zip`, version
0.9.0, 27,671,577 bytes, SHA-256
`5a91219ce1621defe4c0ac817868905b6f019551b9db38520329c4275cc8f507`.

Proposed scope: create only
`%APPDATA%\Ulanzi\UlanziDeck\Plugins\com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin`
from the validated ZIP. Read-only inventory showed that fork destination absent.
Recheck before installing; if it changed, preserve it and review that change.
Use the prepared installer after the user closes Studio manually. It verifies
the package checksum, paths, staged and installed inventories, then starts Studio
normally. No process is terminated. The running 3.3.9.0 executable's exact SHA-256
matches the original helper pin.

This operation does **not** import any profile, change a saved profile/button,
invoke Setup, enable capability-probe mode, send a GIF, touch Kenku or its release,
or change Voicemeeter, Focusrite or Windows audio routing. No original plugin is
replaced. Profile import and hardware tests require their own concrete approval.

Rollback after this plugin-only installation: close Studio manually and remove
only this independent fork folder. Original installed profiles/buttons/plugins
remain the rollback authority. If the user later approves a fork replacement,
the installer preserves its own timestamped backup and validates rollback.

Approval is required by the user's section 3: “Installing/replacing plugins,
importing profiles or writing Studio's saved profiles requires my explicit
approval of the concrete prepared operation.” No approval is inferred from having
a D200 available for observation.

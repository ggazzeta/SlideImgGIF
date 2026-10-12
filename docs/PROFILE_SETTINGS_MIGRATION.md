# Independent profile preferences — 0.10.0

The user explicitly requested fully independent settings after observing the
upstream/global model change the folder in every profile. Version 0.10.0 changes
all slideshow, GIF, clock, WeatherAPI and system preferences to profile scope.
0.10.0 was approved and installed; its own preference migration and backup hashes were verified. The user then reported conflicting playback from other profiles. 0.10.1 corrects display ownership and requires approval of its new package before installation.

## Scope and storage

The legacy SDK supplies action UUID, key and ActionID, not a documented profile
getter. The runtime resolves the exact fork slideshow ActionID at `3_2` against
read-only saved D200 profile/page metadata, preferring ProfilesV2 over stale V1
copies. Pages in one profile share that profile's settings; different profiles
use distinct opaque keys derived from their stable group IDs. Profile names can
change without changing the key. No saved page, action ID, SmallViewMode:2, other
button or Setup parameter is written by this preference feature.

If metadata is unavailable, the display instance gets its own isolated key and
an Inspector warning. It is rechecked on activation; a later exact profile binding
can inherit that same display's earlier settings without overwriting an existing
profile's preferences. Ambiguous profile identity refuses saves. Metadata lookup
is bounded at 256 groups/512 pages per group, 1 MiB per JSON, 8 MiB/2048 JSON files
per lookup, with a five-second traversal deadline. Links are not followed.

Settings remain transported through the official global-settings contract, but
they are stored in separate profile leaves, not one shared flat configuration.
`profileSettingsSchema` is `com.ggazzeta.ulanzi.imageslidegif.profile-preferences/v1`;
`profileSettingsRevision` orders writes; `profileSettings` holds the leaves. The
store permits 256 profiles and a 1 MiB serialized preferences budget. These are
project policies, not documented Studio limits. The Inspector gets only its
profile's preferences and label, and ignores raw global broadcasts.

## Migration and safety

Each profile starts with an independent copy of the last effective 0.9.0 shared
preferences, including PNG-frame selection, folder, timings, API key, units and
legacy information-only modes. Earlier folders overwritten by the old shared
model cannot be reconstructed. Select each profile's desired folder after upgrading.

The original flat settings remain at the top level for old-version rollback.
Updates change only the selected profile leaf; they do not alter that legacy
snapshot or another profile. Writes are serialized, private backups are verified
first, and the runtime requests SDK getGlobalSettings readback to confirm the
entire new registry before applying the change. Older echoes cannot erase newer
updates. Unknown or malformed schemas block saves instead of replacing preferences.

Private backups live in `%LOCALAPPDATA%\ggazzeta\ImageSlideGIF\preferences` on
Windows, or `~/Library/Application Support/ggazzeta/ImageSlideGIF/preferences` on
macOS. `before-profile-preferences.json` is never overwritten;
`latest-profile-preferences.json` is atomically written/read back with SHA-256.
The files contain only this fork's preferences, including private paths/API keys;
they are never logged, committed or included in release archives. The latest
backup is a validated requested settings snapshot; SDK readback separately proves
the save. A failed/uncertain save is reported rather than claimed successful.

Rolling back the plugin to 0.9.0 uses the retained flat shared snapshot. If you
edit preferences with 0.9.0 after rollback, its whitelist can remove the newer
registry; preserve the private latest backup and restore that registry through
the fork's global-settings route before upgrading again. Such restoration is a
separate approved operation. Never replace the whole Studio global_settings.json
file, which also contains other plugins' preferences.

## Shared work and lifecycle

Each profile has its own gallery index, dwell, panel counters/durations and settings.
One shared monotonic GIF scheduler and one 1 Hz gallery clock serve all profiles.
Content-addressed preparation is shared; combined active gallery content remains
bounded at 32 MiB, with the existing 32 MiB worker cache. Inactive profiles release
their gallery data and watchers. Matching folders share one watcher. Identical
weather requests coalesce/cache at the existing 30-minute policy; system probes
share samples at their existing cadence. Changing or disabling one profile stops
only its own frames and leaves other active profiles playing.

## Setup/identity boundaries

Plugin/action UUIDs, folder and helper state namespaces are unchanged. Only the
package/manifest/installer/profile-generator/Setup version constants become 0.10.0.
Windows 3.2.11.0 and 3.3.9.0 executable hashes remain exactly pinned. Restore
normalization explicitly permits prior **fork** 0.9.0 center Plugin metadata and
current 0.10.0 metadata, while still checking the UUID, name, action ID, all action
parameters, page/device/Setup bindings and hashes. Unknown versions, upstream UUIDs
and additional action parameters refuse. Fresh Setup requests require the current
version. No upstream receipt is migrated or interpreted as a fork receipt.

## Validation scope

90/90 Node tests pass on 20.12.2 and 24.21.0, including independent concurrent
saves, page sharing, scoped animation/media cleanup, reconnect, identity fallback,
backup tampering, unknown schemas, resource sharing and 0.9.0 restore lineage.
Read-only checks resolve the saved D200 fork displays to profiles on this host.
The installed update, actual SDK preferences migration and physical profile
switching still require the approved replacement and manual validation. The user's
basic physical PNG-frame confirmation applies to 0.9.0, not an untested 0.10.0.

## 0.10.1 display ownership

Separate preferences do not grant separate physical screens. Each saved D200 UUID has one owner for slot 3_2; activating another profile/page stops the previous gallery and shared-pump context before sending the replacement. Older async activation results cannot reclaim it. Device identity is hashed and never logged. Missing device metadata uses a conservative single-owner fallback, so simultaneous multi-device playback requires resolved device identities. A read-only snapshot of the existing Config/setting_source.json and Pages.Current prevents add events for unselected saved profiles from starting playback. This is private metadata observation, not an official assignment/getter API. No saved profiles are written. Explicit lifecycle events still govern activation/deactivation; false strings are parsed as false.

The Inspector rejects packets for other action contexts and never changes its save target after binding. Existing profile leaves and their folder choices remain intact during this correction. Physically verify switch/return, Inspector closure, another plugin's page, and reconnect after installation.

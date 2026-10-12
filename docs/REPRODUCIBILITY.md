# Release reproducibility

Two consecutive builds of the final runtime/source inventory produced byte-for-byte
identical plugin, source and helper ZIPs. The builder sorts entries, fixes ZIP
timestamps to 1980-01-01, normalizes permissions, retrieves exact pinned package
archives and verifies lockfile integrity before PE/Mach-O inventory validation.
No host npm optional-dependency tree is used as the release dependency inventory.

Metadata/document changes intentionally change the source ZIP. Rebuild twice with
the same source inventory and compare SHA-256 for all three artifacts to reproduce
the check. SHA256SUMS.txt is freshly generated and verified after every build;
upstream checksums/receipts are never reused.

# Preserve original media rejection diagnostics

Development patch; not installed or included in the existing 0.9.0 ZIP.

The original enumerator cached rejected entries as null. A later stat-cache hit
then produced “Cached image rejection” and discarded the original validation
reason. This patch stores the reason in a bounded cache record and displays the
filename plus that reason in Inspector status. Explicit Refresh still discards
the cache and retries; successful static/animated items remain in the gallery.

No media limits, decoder behavior, settings, helper/profile lineage, dependencies
or installed files change. User media was diagnosed read-only; no personal paths,
media payloads or third-party GIFs are included here.

Validation: 78/78 Node tests passed on Node 20.12.2 and 24.21.0. The new synthetic
test checks two distinct failure reasons across repeated scans, retained valid
static media, no repeated decode of cached failures, and retry after Refresh.

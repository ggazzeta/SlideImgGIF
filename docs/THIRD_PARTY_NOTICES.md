# Notices

This independent fork retains the MIT license and copyright Santiago Pérez in `LICENSE`.
Upstream: https://github.com/arkamax404-max/SlideImgPlugin.
Fork changes: animated media validation, worker preparation, native GIF adapter,
shared PNG-frame scheduler, separate identity/state, Inspector settings and validation.
This is not an official Ulanzi plugin.

Packaged runtime dependency licenses remain in each node_modules package: Sharp
0.35.5 (Apache-2.0), ws 8.21.3 (MIT), @img/colour 1.1.0 (MIT), detect-libc
2.1.2 (Apache-2.0), semver 7.8.5 (ISC), Sharp native wrapper and libvips packages.
Native packages retain their third-party license inventories and notices. Libvips
and GIF codecs carry additional licenses listed by the native package; do not
remove those notices when repackaging. Existing Lucide and Meteocons notices remain
under resources. Fixtures are locally generated originals.

Official SDK repositories were inspected for protocol reference, not substituted
as runtime dependencies. Private-profile technique attribution remains with
https://github.com/chilleno/claude-deck as acknowledged by upstream.

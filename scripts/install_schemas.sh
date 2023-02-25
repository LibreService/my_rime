set -e

rime_dir=build/librime_native/bin plum/rime-install prelude essay emoji
node scripts/install_schemas.mjs
cp build/librime_native/bin/opencc/* build/sysroot/usr/local/share/opencc

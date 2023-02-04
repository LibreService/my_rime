set -e

rime_dir=build/librime_native/bin plum/rime-install prelude essay
node scripts/install_schemas.mjs
rm -rf public/ime
cp -r build/librime_native/bin/build public/ime
rm public/ime/default.yaml
cp build/librime_native/bin/opencc/* build/sysroot/usr/local/share/opencc

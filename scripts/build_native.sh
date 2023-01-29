set -e

root=$PWD
n=`nproc --all`

cmake librime/deps/opencc -B build/opencc_native \
  -DCMAKE_INSTALL_PREFIX:PATH=$root/build/sysroot/usr/local
make -C build/opencc_native/data install -j $n

pushd librime
if [[ -z `git status --porcelain --ignore-submodules` ]]; then
  git apply $root/librime_patch
fi
popd

cmake librime -B build/librime_native \
  -DBUILD_TEST:BOOL=OFF \
  -DENABLE_LOGGING:BOOL=OFF \
  -DCMAKE_BUILD_TYPE:STRING="Release"
make -C build/librime_native -j $n

rime_dir=build/librime_native/bin plum/rime-install prelude essay
node scripts/install_schemas.mjs
cp -r build/librime_native/bin/build public/ime
rm public/ime/default.yaml

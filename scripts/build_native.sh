set -e

root=$PWD
n=`nproc --all`

cmake librime/deps/opencc -B build/opencc_native \
  -DCMAKE_INSTALL_PREFIX:PATH=$root/build/sysroot/usr/local
make -C build/opencc_native/data install -j $n

pushd librime
if [[ -z `git status --porcelain -uno --ignore-submodules` ]]; then
  git apply $root/librime_patch
fi
popd

rm -rf librime/plugins/lua

cmake librime -B build/librime_native \
  -DBUILD_TEST:BOOL=OFF \
  -DENABLE_LOGGING:BOOL=OFF \
  -DCMAKE_BUILD_TYPE:STRING="Release"
make -C build/librime_native -j $n

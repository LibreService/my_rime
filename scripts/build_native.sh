set -e

root=$PWD

opencc_blddir=build/opencc_native
cmake librime/deps/opencc -B $opencc_blddir -G Ninja \
  -DCMAKE_INSTALL_PREFIX:PATH=/usr/local \
  -DCMAKE_VERBOSE_MAKEFILE:BOOL=ON
cmake --build $opencc_blddir
DESTDIR=$root/build/sysroot cmake --install $opencc_blddir

pushd librime
if [[ -z `git status --porcelain -uno --ignore-submodules` ]]; then
  git apply $root/librime_patch
fi
popd

rm -rf librime/plugins/lua

librime_blddir=build/librime_native
cmake librime -B $librime_blddir -G Ninja \
  -DBUILD_TEST:BOOL=OFF \
  -DENABLE_LOGGING:BOOL=OFF \
  -DCMAKE_BUILD_TYPE:STRING="Release" \
  -DCMAKE_VERBOSE_MAKEFILE:BOOL=ON
cmake --build $librime_blddir

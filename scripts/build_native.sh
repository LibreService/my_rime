set -e

root=$PWD

pushd librime
if [[ -z `git status --porcelain -uno --ignore-submodules` ]]; then
  git apply $root/librime_patch
fi
popd

rm -rf librime/plugins/lua

librime_blddir=build/librime_native
rm -rf $librime_blddir
cmake librime -B $librime_blddir -G Ninja \
  -DBUILD_TEST:BOOL=OFF \
  -DENABLE_LOGGING:BOOL=OFF \
  -DCMAKE_BUILD_TYPE:STRING="Release" \
  -DCMAKE_VERBOSE_MAKEFILE:BOOL=ON
cmake --build $librime_blddir

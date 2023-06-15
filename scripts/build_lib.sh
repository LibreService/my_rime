set -e

: "${ENABLE_LOGGING:=OFF}"

export CXXFLAGS=-fexceptions

root=$PWD
n=`nproc --all`

pushd boost
pushd libs/interprocess
if [[ -z `git status --porcelain` ]]; then
  git apply $root/interprocess_patch
fi
popd
./bootstrap.sh
./b2 toolset=emscripten link=static --with-filesystem --with-system --with-regex --disable-icu --prefix=$root/build/sysroot/usr/local install -j $n
popd

[[ -L librime/plugins/lua ]] || ln -s ../../librime-lua librime/plugins/lua
mkdir -p librime-lua/thirdparty
[[ -L librime-lua/thirdparty/lua5.4 ]] || ln -s ../../lua librime-lua/thirdparty/lua5.4
rm -f lua/onelua.c

emcmake cmake librime/deps/yaml-cpp -B build/yaml-cpp \
	-DBUILD_SHARED_LIBS:BOOL=OFF \
	-DYAML_CPP_BUILD_CONTRIB:BOOL=OFF \
	-DYAML_CPP_BUILD_TESTS:BOOL=OFF \
	-DYAML_CPP_BUILD_TOOLS:BOOL=OFF \
  -DCMAKE_BUILD_TYPE:STRING="Release" \
  -DCMAKE_INSTALL_PREFIX:PATH=/usr/local
make DESTDIR=$root/build/sysroot -C build/yaml-cpp install -j $n

emcmake cmake librime/deps/leveldb -B build/leveldb \
  -DBUILD_SHARED_LIBS:BOOL=OFF \
  -DLEVELDB_BUILD_BENCHMARKS:BOOL=OFF \
  -DLEVELDB_BUILD_TESTS:BOOL=OFF \
  -DCMAKE_BUILD_TYPE:STRING="Release" \
  -DCMAKE_INSTALL_PREFIX:PATH=/usr/local
make DESTDIR=$root/build/sysroot -C build/leveldb install -j $n

emcmake cmake librime/deps -B build/marisa-trie \
  -DCMAKE_BUILD_TYPE:STRING="Release" \
	-DCMAKE_INSTALL_PREFIX:PATH=/usr/local
make DESTDIR=$root/build/sysroot -C build/marisa-trie install -j $n

pushd librime/deps/opencc
if [[ -z `git status --porcelain` ]]; then
  git apply $root/opencc_patch
fi
popd
emcmake cmake librime/deps/opencc -B build/opencc_wasm \
  -DBUILD_SHARED_LIBS:BOOL=OFF \
  -DCMAKE_BUILD_TYPE:STRING="Release" \
  -DCMAKE_INSTALL_PREFIX:PATH=/usr/local
make DESTDIR=$root/build/sysroot -C build/opencc_wasm install -j $n

if [[ $ENABLE_LOGGING == 'ON' ]]; then
  pushd librime/deps/glog
  git pull https://github.com/google/glog master
  popd
  emcmake cmake librime/deps/glog -B build/glog \
    -DBUILD_SHARED_LIBS:BOOL=OFF \
    -DBUILD_TESTING:BOOL=OFF \
    -DWITH_GFLAGS:BOOL=OFF \
    -DWITH_UNWIND:BOOL=OFF \
    -DCMAKE_BUILD_TYPE:STRING="Release" \
    -DCMAKE_INSTALL_PREFIX:PATH=/usr/local
  make DESTDIR=$root/build/sysroot -C build/glog install -j $n
fi

emcmake cmake librime -B build/librime_wasm \
  -DCMAKE_FIND_ROOT_PATH:PATH=$root/build/sysroot/usr/local \
  -DBUILD_SHARED_LIBS:BOOL=OFF \
  -DBUILD_STATIC:BOOL=ON \
  -DBUILD_TEST:BOOL=OFF \
  -DENABLE_LOGGING:BOOL=$ENABLE_LOGGING \
  -DCMAKE_BUILD_TYPE:STRING="Release" \
  -DCMAKE_INSTALL_PREFIX:PATH=/usr/local
make DESTDIR=$root/build/sysroot -C build/librime_wasm install -j $n

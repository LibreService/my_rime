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

PREFIX=/usr/local
CMAKE_DEF="""
  -DCMAKE_INSTALL_PREFIX:PATH=$PREFIX
  -DCMAKE_BUILD_TYPE:STRING=Release
  -DBUILD_TESTING:BOOL=OFF
  -DBUILD_SHARED_LIBS:BOOL=OFF
  -DCMAKE_VERBOSE_MAKEFILE:BOOL=ON
"""

yaml_cpp_blddir=build/yaml-cpp
emcmake cmake librime/deps/yaml-cpp -B $yaml_cpp_blddir -G Ninja \
  $CMAKE_DEF \
  -DYAML_CPP_BUILD_CONTRIB:BOOL=OFF \
  -DYAML_CPP_BUILD_TESTS:BOOL=OFF \
  -DYAML_CPP_BUILD_TOOLS:BOOL=OFF
cmake --build $yaml_cpp_blddir
DESTDIR=$root/build/sysroot cmake --install $yaml_cpp_blddir

leveldb_blddir=build/leveldb
emcmake cmake librime/deps/leveldb -B build/leveldb -G Ninja \
  $CMAKE_DEF \
  -DLEVELDB_BUILD_BENCHMARKS:BOOL=OFF \
  -DLEVELDB_BUILD_TESTS:BOOL=OFF
cmake --build $leveldb_blddir
DESTDIR=$root/build/sysroot cmake --install $leveldb_blddir

marisa_trie_blddir=build/marisa-trie
emcmake cmake librime/deps -B $marisa_trie_blddir -G Ninja \
  $CMAKE_DEF
cmake --build $marisa_trie_blddir 
DESTDIR=$root/build/sysroot cmake --install $marisa_trie_blddir

pushd librime/deps/opencc
if [[ -z `git status --porcelain` ]]; then
  git apply $root/opencc_patch
fi
popd
opencc_blddir=build/opencc_wasm
emcmake cmake librime/deps/opencc -B $opencc_blddir -G Ninja \
  $CMAKE_DEF
cmake --build $opencc_blddir 
DESTDIR=$root/build/sysroot cmake --install $opencc_blddir

if [[ $ENABLE_LOGGING == 'ON' ]]; then
  pushd librime/deps/glog
  git pull https://github.com/google/glog master
  popd
  glog_blddir=build/glog
  emcmake cmake librime/deps/glog -B $glog_blddir -G Ninja \
    $CMAKE_DEF \
    -DWITH_GFLAGS:BOOL=OFF \
    -DWITH_UNWIND:BOOL=OFF
  cmake --build $glog_blddir 
  DESTDIR=$root/build/sysroot cmake --install $glog_blddir
fi

librime_blddir=build/librime_wasm
emcmake cmake librime -B $librime_blddir -G Ninja \
  $CMAKE_DEF \
  -DCMAKE_FIND_ROOT_PATH:PATH=$root/build/sysroot/usr/local \
  -DBUILD_TEST:BOOL=OFF \
  -DBUILD_STATIC:BOOL=ON \
  -DENABLE_LOGGING:BOOL=$ENABLE_LOGGING
cmake --build $librime_blddir 
DESTDIR=$root/build/sysroot cmake --install $librime_blddir

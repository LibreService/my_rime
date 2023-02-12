if [[ $ENABLE_LOGGING == 'ON' ]]; then
  glog_option="-l glog"
fi

OPENCC_HOST=build/sysroot/usr/local/share/opencc
OPENCC_TARGET=/usr/local/share/opencc

preload() {
  echo --preload-file $OPENCC_HOST/$1@$OPENCC_TARGET/$1
}

em++ \
  -std=c++14 \
  -O2 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORTED_FUNCTIONS=_init,_set_option,_set_ime,_process \
  -s EXPORTED_RUNTIME_METHODS='["ccall","FS"]' \
  `preload t2s.json` \
  `preload TSPhrases.ocd2` \
  `preload TSCharacters.ocd2` \
  `preload t2hkf.json` \
  `preload HKVariantsFull.txt` \
  `preload t2tw.json` \
  `preload TWVariants.ocd2` \
  `preload s2t.json` \
  `preload STPhrases.ocd2` \
  `preload STCharacters.ocd2` \
  `preload emoji.json` \
  `preload emoji_word.txt` \
  `preload emoji_category.txt` \
  -I build/sysroot/usr/local/include \
  -o public/rime.js \
  wasm/api.cpp \
  -L build/sysroot/usr/local/lib \
  -l rime \
  -l:libboost_filesystem.bc \
  -l yaml-cpp -l leveldb -l marisa -l opencc $glog_option

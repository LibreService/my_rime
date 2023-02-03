if [[ $ENABLE_LOGGING == 'ON' ]]; then
  glog_option="-l glog"
fi

em++ \
  -std=c++14 \
  -O2 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORTED_FUNCTIONS=_init,_set_option,_set_ime,_process \
  -s EXPORTED_RUNTIME_METHODS='["ccall","FS"]' \
  --preload-file build/sysroot/usr/local/share/opencc/t2s.json@/usr/local/share/opencc/t2s.json \
  --preload-file build/sysroot/usr/local/share/opencc/TSPhrases.ocd2@/usr/local/share/opencc/TSPhrases.ocd2 \
  --preload-file build/sysroot/usr/local/share/opencc/TSCharacters.ocd2@/usr/local/share/opencc/TSCharacters.ocd2 \
  --preload-file build/sysroot/usr/local/share/opencc/t2hkf.json@/usr/local/share/opencc/t2hkf.json \
  --preload-file build/sysroot/usr/local/share/opencc/HKVariantsFull.txt@/usr/local/share/opencc/HKVariantsFull.txt \
  --preload-file build/sysroot/usr/local/share/opencc/t2tw.json@/usr/local/share/opencc/t2tw.json \
  --preload-file build/sysroot/usr/local/share/opencc/TWVariants.ocd2@/usr/local/share/opencc/TWVariants.ocd2 \
  -I build/sysroot/usr/local/include \
  -o public/rime.js \
  wasm/api.cpp \
  -L build/sysroot/usr/local/lib \
  -l rime \
  -l:libboost_filesystem.bc \
  -l yaml-cpp -l leveldb -l marisa -l opencc $glog_option

set -e

git submodule update --init --recursive librime
git submodule update --init plum
git submodule update --init lua
git submodule update --init librime-lua
git submodule update --init boost
cd boost
git submodule update --init tools

declare -a modules=(
  algorithm
  align
  any
  array
  assert
  atomic
  bind
  concept_check
  config
  container
  container_hash
  core
  crc
  date_time
  describe
  detail
  filesystem
  format
  function
  function_types
  functional
  headers
  integer
  interprocess
  intrusive
  io
  iostreams
  iterator
  json
  lexical_cast
  move
  mp11
  mpl
  numeric
  optional
  predef
  preprocessor
  random
  range
  regex
  scope_exit
  signals2
  smart_ptr
  static_assert
  system
  throw_exception
  tti
  type_index
  type_traits
  typeof
  utility
  uuid
  variant
  variant2
)

for module in "${modules[@]}"; do
  git submodule update --init libs/$module
done;

# Deploy

> **_NOTE:_** WASM has a hard limit of 2GB memory. Building large dictionary may fail.

## Use query string
This is the easiest way for you to show your schema to users without [building from scratch](./customize.md).

Try https://my-rime.vercel.app/?plum=rime/rime-double-pinyin@master:double_pinyin_flypy,double_pinyin_mspy;rime/rime-luna-pinyin:luna_pinyin
which downloads 3 schemas and deploys them automatically,
with **ZERO** user interaction.

Feel free to generate your query parameters!

## Use [Micro Plum](https://github.com/LibreService/micro_plum)
Click `Micro Plum`.

Either provide
* a single schema URL
(e.g. https://github.com/rime/rime-luna-pinyin/blob/master/luna_pinyin.schema.yaml),

or
* a plum target
(e.g. `rime/rime-luna-pinyin`)
and a list of schema Ids
(e.g. `luna_pinyin`, `luna_pinyin_fluency`).

Click `Install`.

Select the schemas and click `Deploy`.

## Manual upload
Turn on `Advanced` switch or append `debug=on` URL parameter,
so that you can interact with emscripten's file system.

The VSCode-like editor is powered by [Wasm Code](https://github.com/LibreService/wasm_code).

You are able to download/upload/edit/delete files.
After making changes, click `Deploy`.

> **_NOTE:_** This functionality is disabled on mobile browsers.

Some conventions:
* The user data directory is `/rime`.
* The shared data directory is `/usr/share/rime-data`.
* OpenCC files are at `/usr/share/opencc`.

# Deploy
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

> **_NOTE:_** Because MEMFS is used, all changes will be lost after refresh.

Some conventions:
* The user data directory is `/rime`.
* The shared data directory is `/usr/share/rime-data`.
* OpenCC files are at `/usr/share/opencc`.

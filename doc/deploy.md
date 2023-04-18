# Deploy
Turn on `Advanced` switch or append `debug=on` URL parameter,
so that you can interact with emscripten's file system.

The VSCode-like editor is powered by [Wasm Code](https://github.com/LibreService/wasm_code).

You are able to download/upload/edit/delete files.
After making changes, click `Deploy`.

> **_NOTE:_** This functionality is disabled on mobile browsers.

> **_NOTE:_** Because MEMFS is used, all changes will be lost after refresh.

Some conventions:
* The rime directory is `/rime`.
* OpenCC files are at `/usr/local/share/opencc`.
* All files in [rime-config](../rime-config/) will be available at `/rime` after you execute `pnpm run wasm`.

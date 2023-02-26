# Customize
Currently My RIME only distributes IMEs maintained by [RIME organization](https://github.com/rime).
For ease of maintenance, 3rd party IME integration request is usually not accepted.

However, you are more than welcomed to host a customized version of My RIME to distribute 3rd party IME.

## Prerequisite
* Your IME must work on Linux/Windows/macOS.
  * If your IME works on desktop but doesn't work as expected when you port it to web, it may be the result of My RIME not fully utilizing librime functionalities, so I'm glad to help you resolve.
* Your IME should be [plum](https://github.com/rime/plum) compatible, otherwise you have to customize build script yourself.

## Step
* Clone the repo. Do not use `--recurse-submodules`.
* Replicate build steps locally. You may reference [README](../README.md) or `build` job of [CI script](../.github/workflows/build.yml). Those steps work on Ubuntu latest stable and LTS release.
* Customize [schemas.json](../schemas.json).
* Run `pnpm run schema` and test by `pnpm run dev`.
* Once everything works fine, run `pnpm run build`.
* The artifact is in `dist`, and you may deploy it to a static web server.

## Specification
`schemas.json` is a list of objects. 
* IMEs in different plum-compatible repositories should be placed in different objects, e.g. `luna_pinyin` (in [luna-pinyin](https://github.com/rime/rime-luna-pinyin)) and `jyut6ping3` (in [cantonese](https://github.com/rime/rime-cantonese)), although there's a reverse-lookup dependency between them.
* IMEs in one repository should be placed in one object if they share some files, e.g. `luna_pinyin` and `luna_pinyin_fluency` both use `luna_pinyin.table.bin`.
* IMEs in one repository should be placed in different objects if they doesn't share files, e.g. the 5 IMEs in [double-pinyin](https://github.com/rime/rime-double-pinyin) have their own `.prism.bin` file.

For each object, here are key and value definitions:
* `id: string`, the schema id that you place in `default.yaml` for desktop RIME.
* `name: string`, the label you want to show as IME name for user to select.
* `emoji?: boolean`, whether integrate [emoji](https://github.com/rime/rime-emoji). Default `false`.
* `target: string`, the repository name that you use in `rime-install`.
* `dependencies?: string[]`, schema ids that are either a hard dependency (e.g. `luna_pinyin` for `double_pinyin`) or a soft (required by reverse-lookup) dependency (e.g. `stroke` for `luna_pinyin`). Make sure you have them defined in other objects. Default `[]`.
* `variants?: object[]`, simplified/traditional/... variants. Default `undefined` means the table is traditional, and simplified variant is available by OpenCC, e.g. `luna_pinyin`. An empty `[]` means there are no variants and the variant switch button is disabled, e.g. `stroke`.
  * `id: string`, the corresponding `option` in `.schema.yaml`.
  * `name: string`, the label you want to show on the switch button.
* `extended?: boolean`, whether the `.schema.yaml` supports common/extended charset switch. Default `false`.
* `family?: object[]`, the other IMEs that share some files. Each shares the same `variants` with the major IME. Default `[]`.
  * `id: string`, the schema id.
  * `name: string`, the label.
  * `disabled?: boolean`, whether the IME is only used for reverse-lookup by other IMEs. Default `false`.
* `license: string`, a SPDX license identifier used in `package.json`.

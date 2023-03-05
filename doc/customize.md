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
* Run `pnpm run schema`. If the end of the output asks to run `pnpm run wasm`, please do.
* Test by `pnpm run dev`.
* Once everything works fine, run `pnpm run build`.
* The artifact is in `dist`, and you may deploy it to a static web server.

## Specification
`schemas.json` is a list of objects.
An IME corresponds to a schema id.

* IMEs in different plum-compatible repositories should be placed in different objects, e.g. `luna_pinyin` (in [luna-pinyin](https://github.com/rime/rime-luna-pinyin)) and `jyut6ping3` (in [cantonese](https://github.com/rime/rime-cantonese)), although there's a reverse-lookup dependency between them.
* IMEs in one repository should be placed in one object if they share dictionary, e.g. `luna_pinyin` and `luna_pinyin_fluency` both use `luna_pinyin.dict.yaml`.
* IMEs in one repository should be placed in different objects if they don't share dictionary, e.g. you define your own dictionary `fancy.dict.yaml`, but also copy `luna_pinyin.dict.yaml` into your repository for reverse-lookup.

For each object, here are key and value definitions:
* `id: string`, the schema id that you place in `default.yaml` for desktop RIME.
* `name: string`, the label you want to show as IME name for user to select.
* `disabled?: boolean`, whether the IME is only used for reverse-lookup by other IMEs so you don't want to show it in select. Default `false`.
* `emoji?: boolean`, whether integrate [emoji](https://github.com/rime/rime-emoji). Default `false`.
* `target: string`, the same argument you use when installing by plum: `bash rime-install <target>`.
* `dependencies?: string[]`, schema ids that are either a hard dependency (e.g. `luna_pinyin` for `double_pinyin`) or a soft (required by reverse-lookup) dependency (e.g. `stroke` for `luna_pinyin`). Make sure you have them defined in other objects. Default `[]`.
* `variants?: object[]`, simplified/traditional/... variants. Default `undefined` means the table is traditional, and simplified variant is available by OpenCC using `simplification` option, and you want simplified variant be the default variant, e.g. `luna_pinyin`. An empty `[]` means there are no variants and the variant switch button is disabled, e.g. `stroke`.
  * `id: string`, the corresponding `option` in `.schema.yaml`.
  * `name: string`, the label you want to show on the switch button.

  The first variant will be the default variant, regardless what default value is in `.schema.yaml`.
Switching to a variant will first set other `option`s to `0`, and then set this variant's `option` to `1`.
So if there is only one `option` that controls 2 variants, you may use `[{"id": "option"}, {"id": "random stuff"}]` if the default variant should have `option` on, and `[{"id": "random stuff"}, {"id": "option"}]` if the default variant should have `option` off.
If you can understand this, you should agree that `undefined` is equivalent to `[{"id": "simplification", "name": "简"}, {"id": "233", "name": "繁"}]`.
* `extended?: boolean`, whether the `.schema.yaml` supports common/extended charset switch. Default `false`.
* `family?: object[]`, the other IMEs that share some files. Each shares the same `variants` with the major IME. Default `[]`.
  * `id: string`, the schema id.
  * `name: string`, the label.
  * `disabled?: boolean`, same with the `disabled` in parent level.
* `license: string`, a SPDX license identifier used in `package.json`.

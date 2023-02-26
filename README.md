# My RIME
![](https://img.shields.io/github/license/LibreService/my_rime)

Chinese IME powered by [RIME](https://github.com/rime/librime).

https://my-rime.vercel.app/

If you want to distribute your own IME, see [customize](doc/customize.md).
## Self host
Download latest [artifact](https://github.com/LibreService/my_rime/releases/download/latest/my-rime-dist.zip) built by GitHub Actions.

## Development workflow
My RIME can be built on Linux.

### Install node
You may use [nvm](https://github.com/nvm-sh/nvm) to install node.
### Install pnpm and dev dependencies
```sh
npm i -g pnpm
pnpm i
```
### Install RIME dependencies
```sh
apt install libboost-dev \
  libboost-filesystem-dev \
  libboost-regex-dev \
  libboost-system-dev \
  libyaml-cpp-dev \
  libleveldb-dev \
  libmarisa-dev \
  libopencc-dev
```
### Install emsdk
https://emscripten.org/docs/getting_started/downloads.html
### Get submodule
It's not recommended to clone recursively, as many boost libs are not needed.
```sh
pnpm run submodule
```
### Get font
Uncommon characters are rendered using [花园明朝](https://github.com/max32002/max-hana).
```sh
pnpm run font
```
### Build wasm
```sh
pnpm run native
pnpm run schema
export ENABLE_LOGGING=ON # optional
pnpm run lib
pnpm run wasm
```
### Run develop server
```sh
pnpm run dev
```
### Lint
```sh
pnpm run lint:fix
```
### Check type
```sh
pnpm run check
```
### Build
```sh
pnpm run build
```
### Test
```sh
pnpm run test
```
### Preview
```sh
pnpm run preview
```
### Deploy (maintainer only)
```sh
# publish IMEs
declare -a packages=(
  ... # targets output by pnpm run schema
)
for package in "${packages[@]}"; do
  pushd public/ime/$package
  npm publish
  popd
done

# set VERSION to avoid CDN and browser caching old version
export LIBRESERVICE_CDN=https://cdn.jsdelivr.net/npm/@libreservice/my-rime@VERSION/dist/
export RIME_CDN=https://cdn.jsdelivr.net/npm/@rime-contrib/

vercel build --prod
npm publish
vercel deploy --prebuilt --prod
```

## License
AGPLv3+

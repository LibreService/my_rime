# My RIME
![](https://img.shields.io/github/license/LibreService/my_rime)

Chinese IME powered by RIME.

https://my-rime.vercel.app/

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
### Build wasm
```sh
pnpm run native
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
### Deploy
```sh
export LIBRESERVICE_CDN=https://cdn.jsdelivr.net/npm/@libreservice/my-rime@VERSION/dist/ # optional
vercel build --prod
vercel deploy --prebuilt --prod
```

## License
AGPLv3+

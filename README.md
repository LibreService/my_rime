# My RIME 梧桐输入法
![](https://img.shields.io/github/license/LibreService/my_rime)

Online Chinese IME powered by [RIME](https://github.com/rime/librime).

https://my-rime.vercel.app/


This is a **STATIC** website so you **DON'T** need to own a server to host it.

All computation is performed in browser, thanks to Web Assembly.

It's also a [PWA](https://web.dev/progressive-web-apps/), so you can install it like a native App and use it **OFFLINE**.

If you want to distribute your own IME, see [customize](doc/customize.md).

If you want to deploy schemas dynamically (online, like how you deploy in Desktop/Mobile platforms), see [deploy](doc/deploy.md).
## Self host
Download latest [artifact](https://github.com/LibreService/my_rime/releases/download/latest/my-rime-dist.zip) built by GitHub Actions.

## Development workflow
My RIME can be built on Linux, macOS and Windows.

### Install node
You may use [nvm](https://github.com/nvm-sh/nvm)
or [winget](https://github.com/microsoft/winget-cli)
to install node.
### Install pnpm and dev dependencies
```sh
npm i -g pnpm
pnpm i
```
### Install build and RIME dependencies
```sh
# Ubuntu
apt install -y \
  cmake \
  ninja-build \
  clang-format \
  libboost-dev \
  libboost-filesystem-dev \
  libboost-regex-dev \
  libboost-system-dev \
  libyaml-cpp-dev \
  libleveldb-dev \
  libmarisa-dev \
  libopencc-dev

# macOS
brew install cmake ninja clang-format

# Windows
winget install cmake Ninja-build.Ninja LLVM
```
### Install emsdk
https://emscripten.org/docs/getting_started/downloads.html
### Get submodule
It's not recommended to clone recursively, as many boost libs are not needed.
```sh
pnpm run submodule
```
### Get font
Uncommon characters are rendered using
[遍黑体](https://github.com/Fitzgerald-Porthmouth-Koenigsegg/Plangothic-Project),
[花园明朝](https://github.com/max32002/max-hana)
and
[一点明朝](https://github.com/ichitenfont/I.Ming).
```sh
pnpm run font
```
### Build wasm
```sh
pnpm run native
pnpm run schema
export ENABLE_LOGGING=OFF # optional, default ON
export BUILD_TYPE=Debug # optional, default Release
pnpm run lib
pnpm run wasm
```
### Run develop server
```sh
pnpm run dev
```
The app is accessible at http://localhost:5173

Optionally, go to http://localhost:5173/?debug=on or turn on `Advanced` switch so that you can send raw key sequences to librime,
e.g. `{Shift+Delete}`, `{Release+a}`.
This feature is better used with log enabled.
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

## Docker
```sh
docker build \
  --build-arg ENABLE_LOGGING=OFF \
  -t my-rime .
docker run --name my-rime -d my-rime
```
Let's say the IP address of the container is 172.17.0.2 (got by `docker inspect my-rime | grep IPAddress`), then My RIME is accessible at http://172.17.0.2/.

## License
AGPLv3+

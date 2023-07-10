FROM node:20.3.1-bookworm as builder

ARG ENABLE_LOGGING=ON

ENV ENABLE_LOGGING ${ENABLE_LOGGING}

# Install tools and dependencies
RUN apt update && apt install -y \
    cmake \
    ninja-build \
    libboost-dev \
    libboost-filesystem-dev \
    libboost-regex-dev \
    libboost-system-dev \
    libyaml-cpp-dev \
    libleveldb-dev \
    libmarisa-dev \
    libopencc-dev

# Set up Emscripten
RUN git clone https://github.com/emscripten-core/emsdk.git && \
    cd emsdk && \
    ./emsdk install latest && \
    ./emsdk activate latest

COPY / /my_rime
WORKDIR /my_rime

# Install pnpm and dev dependencies
RUN npm i -g pnpm && \
    pnpm i

# Get submodules and font
RUN pnpm run submodule && \
    pnpm run font

# Build WASM
RUN export PATH="$PATH:/emsdk/upstream/emscripten" && \
    pnpm run native && \
    pnpm run schema && \
    pnpm run lib && \
    pnpm run wasm

# Build webapp
RUN pnpm run build


FROM nginx:1.25.1-alpine-slim

COPY --from=builder /my_rime/dist /usr/share/nginx/html

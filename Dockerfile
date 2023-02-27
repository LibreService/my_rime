FROM node:18.14.2-bullseye

COPY / /my_rime/
WORKDIR /

# Install tools and dependencies
RUN apt update && apt -y install \
    nginx cmake \
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

WORKDIR /my_rime

# Install pnpm and dev dependencies
RUN npm i -g pnpm && \
    pnpm i

# Get submodules and font
RUN pnpm run submodule && \
    pnpm run font

# Build WASM
RUN export PATH="$PATH:/emsdk" && \
    export PATH="$PATH:/emsdk/upstream/emscripten" && \
    pnpm run native && \
    pnpm run schema && \
    export ENABLE_LOGGING=ON && \
    pnpm run lib && \
    pnpm run wasm

# Build webapp
RUN pnpm run build

# Set up Nginx static server
RUN printf 'server {\n\
    root /my_rime/dist;\n\
\n\
    listen 8080;\n\
\n\
    location / {\n\
        index index.html index.htm;\n\
    }\n\
\n}' > /etc/nginx/conf.d/static.conf

# Start Nginx
CMD nginx -g 'daemon off;'

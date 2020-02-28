# Build EwasmGeth in a stock Go builder container
FROM golang:1.13-alpine as builder

RUN apk update && apk add --no-cache \ 
    autoconf build-base binutils cmake make curl file gcc g++ git libgcc libtool linux-headers make musl-dev

# Build the ewasm fork of Geth
RUN git clone https://github.com/ewasm/go-ethereum -b ewasm-testnet-milestone1
RUN cd ./go-ethereum && make geth

# Build Hera as shared lib
RUN git clone https://github.com/ewasm/hera
RUN cd hera && git submodule update --init
RUN cd hera && mkdir build
WORKDIR /go/hera/build
RUN cmake .. -DBUILD_SHARED_LIBS=ON
RUN cmake --build .

# Pull Geth into a second stage deploy alpine container
FROM alpine:latest

RUN apk add --no-cache ca-certificates
COPY --from=builder /go/go-ethereum/build/bin/geth /usr/local/bin/
COPY --from=builder /go/hera/build/src/libhera.so /usr/local/bin/
WORKDIR /usr/local/bin
RUN wget https://raw.githubusercontent.com/ewasm/testnet/ewasm-testnet-milestone1/ewasm-testnet-geth-config.json
RUN geth --datadir /tmp/ewasm-node/4201/ init ewasm-testnet-geth-config.json

# This is / should be configured later
EXPOSE 8545 8546 8547 30303 30303/udp
# ENTRYPOINT ["geth"]
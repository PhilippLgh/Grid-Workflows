# Ewasm

## Example Output:
```
Grid Version 2.0.0
Grid uses configuration: /Users/philipplgh/Projects/workflows/.grid.config.js 

Starting workflow:
=============================================================
Name: ewasm
Version: 1.0.0
Description: This workflow demonstrates how to use Dockerfiles to build binaries such as Ewasm and connect to a container.
=============================================================
Output:
              
INFO : >> hello ewasm
INFO : >> run with config {}
✖ No existing container found for "grid_ewasm"
✔ Created Docker image "grid_ewasm" from Dockerfile
  DOCKER:Step 1/18 : FROM golang:1.13-alpine as builder
  DOCKER:---> 3024b4e742b0
  DOCKER:Step 2/18 : RUN apk update && apk add --no-cache     autoconf build-base binutils cmake make curl file gcc g++ git libgcc libtool linux-headers make musl-dev
  DOCKER:---> Using cache
  DOCKER:---> 84ca854b817d
  DOCKER:Step 3/18 : RUN git clone https://github.com/ewasm/go-ethereum -b ewasm-testnet-milestone1
  DOCKER:---> Using cache
  DOCKER:---> a4178391e40a
  DOCKER:Step 4/18 : RUN cd ./go-ethereum && make geth
  DOCKER:---> Using cache
  DOCKER:---> 81e97751fd10
  DOCKER:Step 5/18 : RUN git clone https://github.com/ewasm/hera
  DOCKER:---> Using cache
  DOCKER:---> 80fe9df70a44
  DOCKER:Step 6/18 : RUN cd hera && git submodule update --init
  DOCKER:---> Using cache
  DOCKER:---> fd4ad6632be1
  DOCKER:Step 7/18 : RUN cd hera && mkdir build
  DOCKER:---> Using cache
  DOCKER:---> 03df92ca9639
  DOCKER:Step 8/18 : WORKDIR /go/hera/build
  DOCKER:---> Using cache
  DOCKER:---> b8375edf4636
  DOCKER:Step 9/18 : RUN cmake .. -DBUILD_SHARED_LIBS=ON
  DOCKER:---> Using cache
  DOCKER:---> 0d0b4333e1ea
  DOCKER:Step 10/18 : RUN cmake --build .
  DOCKER:---> Using cache
  DOCKER:---> 3e9daafe5fdf
  DOCKER:Step 11/18 : FROM alpine:latest
  DOCKER:---> 965ea09ff2eb
  DOCKER:Step 12/18 : RUN apk add --no-cache ca-certificates
  DOCKER:---> Using cache
  DOCKER:---> 188a80acf5d6
  DOCKER:Step 13/18 : COPY --from=builder /go/go-ethereum/build/bin/geth /usr/local/bin/
  DOCKER:---> Using cache
  DOCKER:---> 829626f816df
  DOCKER:Step 14/18 : COPY --from=builder /go/hera/build/src/libhera.so /usr/local/bin/
  DOCKER:---> Using cache
  DOCKER:---> d68908996c8e
  DOCKER:Step 15/18 : WORKDIR /usr/local/bin
  DOCKER:---> Using cache
  DOCKER:---> 6651100b225c
  DOCKER:Step 16/18 : RUN wget https://raw.githubusercontent.com/ewasm/testnet/ewasm-testnet-milestone1/ewasm-testnet-geth-config.json
  DOCKER:---> Using cache
  DOCKER:---> e6eb97e3fc98
  DOCKER:Step 17/18 : RUN geth --datadir /tmp/ewasm-node/4201/ init ewasm-testnet-geth-config.json
  DOCKER:---> Using cache
  DOCKER:---> 40764add28c7
  DOCKER:Step 18/18 : EXPOSE 8545 8546 8547 30303 30303/udp
  DOCKER:---> Using cache
  DOCKER:---> d46779dfd92e
  DOCKER:Successfully built d46779dfd92e
  DOCKER:Successfully tagged grid_ewasm:latest
✔ Created Docker container "grid_ewasm" from Dockerfile
INFO : >> client: Geth/v1.8.17-evmc.6.0.0-1-stable/linux-amd64/go1.13.4
INFO : >> network: { chainId: 66, name: 'unknown' }
=============================================================
✨  Done in 15.40s.
```
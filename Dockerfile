FROM  golang:alpine AS builder

ARG TARGETOS
ARG TARGETARCH

ENV GO111MODULE=on \
    GOPROXY=https://goproxy.cn,direct

RUN mkdir /src
WORKDIR /src
ADD . /src
RUN GOOS=$TARGETOS GOARCH=$TARGETARCH go build -o ./bin/frps-panel ./cmd/frps-panel

FROM  alpine:3
RUN mkdir /app
WORKDIR /app

COPY --from=builder /src/bin/frps-panel /app/frps-panel
COPY --from=builder /src/assets  /app/assets
COPY --from=builder /src/config/* /app/

VOLUME ["/app","conf"]
EXPOSE 7200

ENTRYPOINT ["/app/frps-panel", "-c", "/conf/frps-panel.toml"]




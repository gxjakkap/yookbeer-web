# yookbeer-web

A webapp version of [yookbeer](https://github.com/gxjakkap/yookbeer)

## Prerequisite

### Developing locally

- Bun
- Docker (or you can run postgres locally)

### Running on prod

- Docker (recommended)

## Running

### Developing locally

```sh
bun install
docker compose -f docker-compose-devdb.yml -d
bun drizzle-kit push
bun dev
```

### Running on prod

```sh
docker compose up -d
```

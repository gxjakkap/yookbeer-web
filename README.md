# yookbeer-web

A webapp version of [yookbeer](https://github.com/gxjakkap/yookbeer)

## Prerequisite

### Developing locally

- Node v20 or later (or as referenced in .nvmrc)
- Docker (or you can run postgres locally)

### Running on prod

- Docker (recommended)

## Running

### Developing locally

```sh
pnpm i
docker compose -f docker-compose-devdb.yml -d
pnpm drizzle-kit push
pnpm dev
```

### Running on prod

```sh
docker compose up -d
```

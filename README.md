# myf

[myf] is a personal home finance planning and tracking tool.

## Deployment

```bash
./bin/build-config.sh # will generate .env.local with the required environment variables.
```

## Configuration

1. Categories are defined in [`config/categories.json`](./config/categories.json)
2. Firestore configuration is obtained via `terraform output` by running [`bin/build-config.sh`](./bin/build-config.sh)

\- [Oto Brglez](https://github.com/otobrglez)

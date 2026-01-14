# myf

[myf] is a personal home finance planning and tracking tool.

## Tools

- [devenv](https://devenv.sh/) for reproducible and declerative development environment
- [Hashicorp Terraform](https://developer.hashicorp.com/terraform) for IaC
- [Google Cloud Firebase](https://firebase.google.com/) for hosting, database and storage
- [Vue.js](https://vuejs.org/) with [Pinia](https://pinia.vuejs.org/)

## Deployment

```bash
cd tf; # terraform folder
terraform plan
terraform apply

./bin/build-config.sh # will generate .env.local with the required environment variables.
```

## Configuration and customisation

1. Categories are defined in [`config/categories.yaml`](./config/categories.yaml)
2. Settings and user mappings in [`config/settings.yaml`](./config/settings.yaml)
3. Firestore configuration is obtained via `terraform output` by running [`bin/build-config.sh`](./bin/build-config.sh)

\- [Oto Brglez](https://github.com/otobrglez)

[myf]: https://github.com/otobrglez/myf

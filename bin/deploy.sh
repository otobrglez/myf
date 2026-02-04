#!/usr/bin/env bash
set -ex

yarn run build && \
  firebase deploy --only hosting:live
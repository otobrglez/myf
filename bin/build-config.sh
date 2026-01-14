#!/usr/bin/env bash
set -ex

cd tf && \
  terraform output -json firebase_web_config | \
  jq -r '.authDomain="myf.pinkstack.com" | to_entries | .[] | "VITE_FIREBASE_\(.key | ascii_upcase)=\(.value)"' > ../.env.local
#!/bin/bash

set -euo pipefail

SKIP_INSTALL=${SKIP_INSTALL:-0}
INSTALL_PREFIX=${INSTALL_PREFIX:-/usr/local/share/web-greeter/themes/osrs}

sed_inplace() {
  # macOS BSD sed needs a zero-length suffix; GNU sed accepts -i alone
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' "$@"
  else
    sed -i "$@"
  fi
}

update_paths() {
  local prefix_with_slash="${INSTALL_PREFIX%/}/"
  local escaped_prefix
  escaped_prefix=$(printf '%s' "$prefix_with_slash" | sed 's/[\\/\&]/\\&/g')

  local replacement="s/=\"\/osrs-web-greeter-theme/=\"${escaped_prefix}/g"
  sed_inplace "$replacement" build/index.html

  for entry in ./build/static/js/*.js; do
    sed_inplace "$replacement" "$entry"
    echo "$entry"
  done
}

install_theme() {
  if ! mkdir -p "$INSTALL_PREFIX"; then
    echo "Install path '$INSTALL_PREFIX' is not writable; rerun with sudo or set SKIP_INSTALL=1 to skip." >&2
    exit 1
  fi

  find build/ -type d -exec chmod 755 '{}' \;
  find build/ -type f -exec chmod 644 '{}' \;
  cp -a build/. "$INSTALL_PREFIX"/
  echo "Installed to $INSTALL_PREFIX"
}

update_paths

if [[ "$SKIP_INSTALL" == "1" ]]; then
  echo "SKIP_INSTALL=1; leaving artifacts in ./build"
  exit 0
fi

install_theme

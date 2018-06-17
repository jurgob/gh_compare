#!/usr/bin/env bash
echo "TEST"
set -eo pipefail

case $1 in
  start)
    # The '| cat' is to trick Node that this is an non-TTY terminal
    # then react-scripts won't clear the console.
    yarn start | cat
    ;;
  build)
    yarn build
    ;;
  test)
    CI=true yarn test -- --coverage
    ;;
  *)
    exec "$@"
    ;;
esac

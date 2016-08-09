# Derproxy

This is a deliberately broken TCP proxy that can be used to simulate unusually
harsh networking conditions.

## Usage

The required option is `-p` to specify which port to forward to, but other
options are also possible. `--help` will explain.

For example, to proxy a local Redis server:

    bin/derproxy -p 6379

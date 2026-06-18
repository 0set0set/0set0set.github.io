set dotenv-load := true

default:
    @just --list

setup:
    npm ci

dev:
    npm run dev

check:
    npm run check

build:
    npm run build

preview:
    npm run preview

clean:
    rm -rf dist node_modules .astro

all: setup check build

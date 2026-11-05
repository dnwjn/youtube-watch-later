#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

ZIP_NAME="source.zip"
OUTPUT_DIR="./build"

# Files and directories to include (whitelist)
INCLUDE_ITEMS=(
    "assets/"
    "src/"
    ".nvmrc"
    "CHANGELOG.md"
    "package.json"
    "pnpm-lock.yaml"
    "pnpm-workspace.yaml"
    "README.md"
    "tsconfig.json"
    "wxt.config.ts"
)

mkdir -p "$OUTPUT_DIR"

zip -r "$OUTPUT_DIR/$ZIP_NAME" "${INCLUDE_ITEMS[@]}"

echo "Source code has been zipped into $OUTPUT_DIR/$ZIP_NAME"

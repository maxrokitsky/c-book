# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue 3 SPA ("c-book") using the Composition API with `<script setup>`, TypeScript, Pinia for state management, and Vue Router. Uses **beta versions** of Vue 3.6 and Vite 8 (pinned via pnpm-workspace.yaml overrides).

## Commands

- **Dev server:** `pnpm dev`
- **Build (type-check + vite build in parallel):** `pnpm build`
- **Type-check only:** `pnpm type-check` (runs `vue-tsc --build`)
- **Lint (oxlint then eslint, sequential):** `pnpm lint`
- **Format:** `pnpm format` (runs `oxfmt src/`)

## Architecture

- `src/main.ts` — app entry: creates Vue app, installs Pinia and Vue Router
- `src/router/index.ts` — Vue Router with HTML5 history mode (routes currently empty)
- `src/stores/` — Pinia stores using Composition API style (`defineStore` with setup function)
- `@` path alias maps to `./src` (configured in both vite.config.ts and tsconfig.app.json)

## Code Style

- **Formatter:** oxfmt — no semicolons, single quotes (`.oxfmtrc.json`)
- **Linters:** oxlint (runs first with `--fix`) then eslint (runs second with `--fix --cache`). eslint-plugin-oxlint disables rules already covered by oxlint.
- **EditorConfig:** 2-space indent, LF line endings, max line length 100, UTF-8
- Vue SFC files use `<script setup lang="ts">`

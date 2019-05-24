#!/usr/bin/env bash
npm install
npm run lint
npm run bundlesize || true

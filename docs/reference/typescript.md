---
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/typescript.html
applies_to:
  stack:
  serverless: unavailable
  product:
    apm_agent_rum: ga
products:
  - id: cloud-serverless
  - id: observability
  - id: apm
---

# Using with TypeScript [typescript]

RUM agent publishes the type definitions for the `@elastic/apm-rum` package via `types` property in `package.json`. If you are importing the package on a TypeScript codebase, you will get automatic code completion, hover info and method signature information on supported platforms (Visual Studio Code, etc)


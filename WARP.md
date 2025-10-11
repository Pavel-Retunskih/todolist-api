# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview

- Tech stack: NestJS (TypeScript) + MongoDB via Mongoose, Jest for testing, ESLint + Prettier for lint/format.
- Entry point: src/main.ts bootstraps the Nest app and listens on process.env.PORT or 3000.
- Persistence: MongoDB connection is established in src/app.module.ts using MongooseModule.forRoot(...). Ensure this URI points to a reachable MongoDB instance in your environment.

Common commands
- Install dependencies: pnpm install
- Build: pnpm build
- Start (development, with watch): pnpm start:dev
- Start (production): pnpm build && pnpm start:prod
- Lint: pnpm lint
- Format: pnpm format

Testing

Unit tests (Jest, ts-jest)
- Run all unit tests: pnpm test
- Watch mode: pnpm test:watch
- Run a single test file: pnpm test src/app.controller.spec.ts
- Run tests matching a name/pattern: pnpm test -t "<pattern>"
- Coverage: pnpm test:cov
- Debug Jest: pnpm test:debug

End-to-end tests
- Run E2E tests: pnpm test:e2e

Code architecture and structure

NestJS layering
- Module: src/app.module.ts wires providers/controllers and initializes the database connection via @nestjs/mongoose. This is the composition root of the application.
- Controller: src/app.controller.ts exposes HTTP routes (currently GET /) and delegates to services.
- Service: src/app.service.ts contains application logic used by controllers (currently returns a static string for demonstration).

Data modeling (Mongoose)
- Schema files live in src/schemas/:
  - cat.schema.ts: Cat entity with fields name, age, breed, and an optional list of owner references.
  - owner.schema.ts: Owner entity with firstName and lastName.
- Note: These schemas are defined but not yet bound into a feature module via MongooseModule.forFeature([...]). To expose CRUD APIs around them, create a feature module (e.g., CatsModule/OwnersModule), register the schemas there, then add corresponding services/controllers.

HTTP surface
- The root route (GET /) is defined in AppController and returns the value from AppService.getHello().

Build and configuration
- nest-cli.json: Sets sourceRoot to src and enables deleteOutDir, so dist/ is cleaned during builds.
- tsconfig.json: TypeScript targets ES2023, uses module/moduleResolution "nodenext", emits decorators/metadata, and outputs to dist/.
- tsconfig.build.json: Excludes node_modules, test, dist, and *.spec.ts from the production build.

Linting and formatting
- eslint.config.mjs: typescript-eslint with type-aware rules enabled, Prettier integration (eslint-plugin-prettier/recommended), Node and Jest globals. Some rules are relaxed (e.g., no-explicit-any off) with a few warnings for unsafe arguments/floating promises.
- .prettierrc: singleQuote true, trailingComma all.

Testing layout
- Unit tests: Jest config in package.json sets rootDir to src and picks up files matching *.spec.ts. Uses ts-jest for TypeScript transformation.
- E2E tests: test/jest-e2e.json config; specs match *.e2e-spec.ts and run with ts-jest. The provided test spins up a Nest application (AppModule) and hits the GET / endpoint via supertest.

CLI scaffolding (helpful during development)
- Use the local Nest CLI to generate modules/services/controllers:
  - Example (generate a resource): pnpm exec nest g resource todo
  - Example (generate a module): pnpm exec nest g module cats
  - Example (generate a service): pnpm exec nest g service cats
  - Example (generate a controller): pnpm exec nest g controller cats

Important repository notes for agents
- MongoDB connection string is currently defined in src/app.module.ts. Adjust it to a reachable instance for your environment (do not commit secrets). For portability, consider an environment-based approach if you refactor this area.
- The server listens on process.env.PORT if set, else 3000 (src/main.ts). Ensure any E2E tests or tooling that depend on a port align with this default.
- The presence of pnpm-lock.yaml indicates pnpm is the expected package manager.

Cross-references
- README.md highlights the tech stack (NestJS/TypeScript/MongoDB/Mongoose, Jest, ESLint + Prettier) and recommends pnpm and Node.js 16+.
- No CLAUDE.md, Cursor rules, or Copilot instruction files were found in this repository at the time of writing.

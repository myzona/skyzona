# Skyvern Agent Guide

## Build/Lint/Test
- Backend lint: `uv run pre-commit run --all-files`
- All Python tests: `uv run pytest`
- Single Python test: `uv run pytest tests/unit_tests/test_file.py::TestClass::test_method`
- Frontend lint/test/build: `cd skyvern-frontend && npm run lint|test|build`

## Code Style
- Python: Ruff formatting (120 cols), isort ordering, mypy enforcement, absolute imports
- TypeScript: ESLint + Prettier with strict TS; format before commits
- Naming: snake_case funcs/vars, PascalCase classes, kebab-case files, env vars SCREAMING_SNAKE
- Imports: group stdlib/third-party/first-party with blank lines; avoid relative hops
- Types: annotate everything; prefer `Union` to `Optional` unless None conveys meaning
- Errors: raise specific exceptions, provide actionable messages, log via existing logger
- Async: favor async/await context managers for resources and network calls

## Repo Notes
- Key dirs: `/skyvern` backend, `/skyvern-frontend` React UI, `/integrations` third-party, `/alembic` migrations, `/tests` unit tests
- Runtime management: use PM2 for any Node/JS processes; never `npm start`

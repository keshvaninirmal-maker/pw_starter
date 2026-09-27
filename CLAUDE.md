# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Playwright + TypeScript test framework (starter repo for a Claude Code workshop) running E2E tests against the public demo shop https://practicesoftwaretesting.com. There is no application code here, only tests and test infrastructure.

## Commands

```bash
npm install && npx playwright install chromium   # setup
npx tsc --noEmit                                 # type-check (no lint or build step exists)
npx playwright test                              # run everything
npx playwright test tests/cart/cart.spec.ts      # one file
npx playwright test --grep "CH01"                # one test by ID prefix
npx playwright test --grep "@regression"         # by tag
npm run test:ui | test:headed | test:report      # UI mode / headed / open last HTML report
```

`npm test` is NOT the full suite: it runs only `--grep "C01" --headed`. Note that `--grep "C01"` also matches any test title containing that substring.

## Architecture

Tests are layered; new tests should use the layers rather than raw selectors:

- `pages/*.page.ts`: page objects, all extending `BasePage` (`navigate(path)` goes to the path and waits for `networkidle`).
- `common_actions/shop.facade.ts`: `ShopFacade` composes page objects into multi-step flows (`addToCart`, `addToCartAndGoToCheckout`, `fullGuestCheckout`). It is exported from `common_actions/index.ts`.
- `fixtures/index.ts`: extends Playwright `test` so each page object and `shopFacade` is injected as a fixture. **Tests must import `test`/`expect` from `../../fixtures`, not `@playwright/test`.** Add a new page object by registering it in the `TestFixtures` type and `base.extend`.
- `data/`: test data constants (`USERS`, `PRODUCTS`). Specs reference these instead of hard-coding values.
- `utils/helpers.ts`: standalone helpers (`loginViaUI`, `parseCurrency`, and `addProductToCart`, which duplicates logic in `ShopFacade.addToCart`).
- `tests/auth.setup.ts`: logs in and writes `auth.json` via `npm run setup`. It is NOT wired into `playwright.config.ts` (no `setup` project, no `storageState`), so specs do not currently run authenticated.

## Conventions

- Test titles start with an ID and end with a tag: `test('C03 increase item quantity @regression', ...)`. ID prefixes: `C` cart, `CH` checkout, `P` product. Keep IDs unique because `--grep` targets them.
- Specs live in `tests/<area>/`. Cart specs build state in `beforeEach` via `shopFacade`.
- Selectors mix `data-test` attributes and role-based locators. Prefer roles/`data-test` over CSS classes.
- Wait for the shop's loading skeleton (`.card.skeleton` hidden) plus `networkidle` before interacting with product lists; the facade already does this.

## Coding Guidelines

All new tests, page objects, and data files must follow [`references/coding-guidelines.md`](references/coding-guidelines.md).

Key rules at a glance:
- Import `test`/`expect` from `../../fixtures`, never from `@playwright/test`
- All locators defined as `readonly` properties in the page object constructor — never inline
- No `waitForTimeout` — use web-first assertions and `waitFor({ state })`
- No assertions inside page objects
- All test data in `data/` — no hard-coded strings in specs
- Run `npx tsc --noEmit` before considering any implementation complete

## References

- [`references/coding-guidelines.md`](references/coding-guidelines.md): comprehensive best-practice rules for selectors, waits, page objects, fixtures, TypeScript, assertions, and test structure. **Read before generating any test code.**
- [`references/parameterized-tests.md`](references/parameterized-tests.md): patterns for writing data-driven tests using `for...of` loops, shared `beforeEach`, and data files in `data/`. Covers naming rules, type-safety tips, and what to avoid.
- [`.claude/skills/pw-code-review/SKILL.md`](.claude/skills/pw-code-review/SKILL.md): step-by-step code review checklist (phases A–K) derived from coding-guidelines.md. Invoke with `/pw-code-review [file-or-dir]` — no need to re-read the guidelines on each review.

## Config notes

`playwright.config.ts`: `fullyParallel`, no retries, 15s per-test timeout, Chromium only, `BASE_URL` env var (loaded from `.env` via dotenv) overrides the default demo-shop URL. Screenshots on failure, trace retained on failure. `playwright-report/` is untracked and not in `.gitignore`.

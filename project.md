# Project: pw_starter

## Purpose
Starter repo for the Claude Code Workshop. It is a Playwright + TypeScript end-to-end test framework that runs against the demo shop https://practicesoftwaretesting.com.

## Tech stack
- Node.js 18+ (LTS)
- Playwright Test (`@playwright/test` ^1.44), Chromium only
- TypeScript 5, dotenv for environment config

## Structure
| Path | Role |
|---|---|
| `tests/` | Specs grouped by area: `cart/`, `checkout/`, `product/`, plus `auth.setup.ts` |
| `pages/` | Page objects extending `BasePage` (home, product, cart, checkout) |
| `common_actions/` | `ShopFacade`: multi-step flows composed from page objects |
| `fixtures/` | Custom `test` that injects page objects and the facade |
| `data/` | Test data (`USERS`, `PRODUCTS`) |
| `utils/` | Standalone helpers (login, currency parsing) |
| `playwright.config.ts` | Runner config (parallel, 15s timeout, `BASE_URL` override) |

## Test coverage
| Area | IDs | Examples |
|---|---|---|
| Cart | C01–C07, C99 | add/remove items, change quantity, totals, empty state |
| Checkout | CH01–CH06 | guest happy path, address and card validation, order confirmation |
| Product | P01+ | search with and without results |

All tests are tagged `@regression`.

## Getting started
```bash
npm install
npx playwright install chromium
npx tsc --noEmit        # verify setup
npx playwright test     # run the suite
```

Optional: create a `.env` file with `BASE_URL=<url>` to point at a different environment.

## Working agreements
- Import `test` and `expect` from `fixtures`, not from `@playwright/test`.
- Name tests `<ID> <description> @<tag>` with a unique ID.
- Put shared values in `data/`, reusable flows in `ShopFacade`, and selectors in page objects.

## Known gaps
- `auth.setup.ts` writes `auth.json` but is not wired into the Playwright config, so specs run unauthenticated.
- `utils/helpers.ts` `addProductToCart` duplicates `ShopFacade.addToCart`.
- `playwright-report/` is not in `.gitignore`.
- No CI pipeline is set up yet (GitHub Actions is listed as a workshop pre-read).

## Related docs
- [README.md](README.md): workshop setup instructions
- [CLAUDE.md](CLAUDE.md): guidance for Claude Code

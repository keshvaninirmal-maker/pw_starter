---
name: playwright-test-automation
description: Create automated Playwright tests for a page or feature of the web app under test in this repo. Use when asked to "automate", "write tests for", or "add test cases for" a URL, page, or flow. Explores the live page, then generates the page object, test data, fixture registration and spec following this repo's conventions.
argument-hint: <page URL or feature> [area folder name]
---

# Playwright test automation

Create tests for `$ARGUMENTS` in this repo's layered framework (page object, data, fixture, spec). Follow the steps in order. Do not guess selectors or messages; take them from the live page.

## 0. Load coding guidelines (always first)

Read `references/coding-guidelines.md` in full before generating any code. Every selector, locator definition, wait pattern, TypeScript type, and assertion must comply with these guidelines. Keep the checklist below in mind throughout all later steps:

- [ ] Locators defined as `readonly` properties in the page object constructor (not inline)
- [ ] Selector priority: `data-test` → role → label/text → CSS (with comment)
- [ ] No `waitForTimeout` anywhere
- [ ] `BasePage` extended; `navigate(path)` used for all page navigations
- [ ] No assertions inside page objects
- [ ] `test`/`expect` imported from `../../fixtures`, never `@playwright/test`
- [ ] All test data in `data/` — no literals in specs
- [ ] Explicit TypeScript types on all parameters and return values; no `any`
- [ ] Web-first assertions only (`toBeVisible`, `toHaveText`, `toHaveURL`, etc.)
- [ ] Each test is independent and parallel-safe

## 1. Read the conventions first
Read `CLAUDE.md`, `fixtures/index.ts`, `pages/base.page.ts`, one existing page object and one existing spec. Match their style, naming and comment density. Note the current ID prefixes so the new ones don't collide (`grep -rhn "test('" tests`).

## 2. Explore the live page (never invent selectors)
Use the Playwright MCP tools (load them with ToolSearch if deferred):
1. `browser_navigate`, then `browser_snapshot`. SPAs render late, so if the snapshot looks empty, snapshot again.
2. List every field, button, dropdown, link and its options.
3. Get stable locators. Prefer `data-test` attributes: use `browser_run_code_unsafe` to dump them with `page.locator('[data-test]').evaluateAll(...)`.
4. Exercise the behavior to learn the real outputs: submit empty, submit invalid, submit valid. Record exact validation and success messages, and whether the UI changes (form disappears, redirect, toast).
5. Save nothing secret. Use only public demo data.

## 3. Design the test cases before coding
Cover, at a minimum, for the feature:
- **Presence**: key elements are visible and enabled.
- **Happy path**: valid input gives the expected success state.
- **Negative**: empty required fields, invalid format, boundary lengths (just under the limit), one test per rule.
- **Options/data-driven**: dropdown or list contents.
- **Navigation**: the feature is reachable the way a user reaches it.

Rules for each test:
- One behavior per test, independent of the others, no order dependency.
- Assert user-visible outcomes, not implementation details.
- Tests that need setup use `beforeEach`, or a facade in `common_actions/` if the setup spans pages.

## 4. Implement, one file per layer
- `pages/<name>.page.ts`: class extending `BasePage`. Locators as `readonly` properties created in the constructor, intent-named actions (`fillForm`, `submit`), and small helpers for parameterized locators (e.g. `getError(text)`). No assertions inside page objects.
- `data/<name>.ts`: exported constant with valid data, boundary and invalid values, and expected message texts. No literals in specs.
- `fixtures/index.ts`: register the page object in the `TestFixtures` type and in `base.extend`.
- `tests/<Area>/<name>.spec.ts`: import `test`/`expect` from `../../fixtures`, never from `@playwright/test`. Title format: `<ID> <behavior> @regression`, with a unique ID prefix for the area (for example `CT01`). Use `test.describe` per feature.
- Use the spread pattern to vary one field from valid data: `fillForm({ ...DATA.valid, email: DATA.invalidEmail })`.

## 5. Best practices (enforce these)
- **Locators**: `data-test` or role-based first; CSS classes only as a last resort; never XPath by position.
- **Waiting**: rely on Playwright auto-waiting and web-first assertions (`toBeVisible`, `toHaveText`, `toHaveURL`). No `waitForTimeout`, no `sleep`. Avoid `networkidle` except where the framework's `navigate()` already does it.
- **Assertions**: assert the specific message or state, plus a negative assertion where relevant (for example success alert hidden after invalid input).
- **Independence**: no shared mutable state; tests must pass in parallel (`fullyParallel` is on) and in any order.
- **Data**: no hard-coded credentials or emails in specs. Use `data/`. Do not depend on data another test creates.
- **No duplication**: reuse existing page objects, facades and helpers before adding new ones.
- **Readability**: test names describe behavior; no comments that restate code.
- **Stability**: do not assert on things that change on their own (dates, counts from shared demo data, ordering).

## 6. Verify
1. `npx tsc --noEmit` must be clean.
2. Run the guidelines compliance checklist from Step 0 against the generated code. Fix any violations before proceeding.
3. Run only the new tests: `npx playwright test tests/<Area> --reporter=list`.
4. If every test fails with `ERR_NAME_NOT_RESOLVED`, the shell sandbox has no network. That is not a test bug. Tell the user to run the command in their own terminal (or ask permission to run it with network access). Do not report the tests as passing.
5. On real failures, read the error and fix the selector or expectation from what the live page shows; do not loosen assertions just to pass.
6. Delete scratch files created by exploration (`.playwright-mcp/`) or tell the user if they are locked.

## 7. Report
State what was created (files and test IDs with one-line meanings), what was run and its actual result, and anything unverified. Update `CLAUDE.md` only if a new convention was introduced (for example a new ID prefix).

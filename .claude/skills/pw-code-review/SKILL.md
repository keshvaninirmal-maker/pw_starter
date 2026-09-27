# Skill: Playwright Code Review

When this skill is loaded, perform a systematic code review of the target file(s) against this repo's conventions. Work through every phase below in order. For each finding, cite the file path and line number, state the violated rule, and show the fix.

---

## How to invoke

```
/pw-code-review                  # review all changed files on current branch
/pw-code-review tests/cart/      # review a specific directory
/pw-code-review tests/cart/cart.spec.ts   # review one file
```

---

## Review Phases

### Phase A — Imports & Fixtures
> Rule source: §5 of coding-guidelines.md

1. Every spec imports `test` and `expect` from `../../fixtures`, **not** from `@playwright/test`.
2. Every new page object introduced is registered in `fixtures/index.ts` (both the `TestFixtures` type and the `base.extend` call).
3. Specs never instantiate page objects directly (`new SomePage(page)`) — they use fixture injection via the test function parameters.

---

### Phase B — Selectors
> Rule source: §1 and §2 of coding-guidelines.md

4. Locators follow the priority order: `data-test` attribute → ARIA role + accessible name → `getByLabel`/`getByPlaceholder`/`getByText` → CSS class (last resort, with comment explaining why).
5. No XPath-by-position (e.g. `//div[2]/span`). No `$` or `querySelector` inside page actions.
6. All locators are `readonly` class properties defined inside the **constructor** — never created inline inside an action method or inside a spec.
7. `locator.filter()` or `.nth()` is used to narrow a locator — not a fresh full-page query.

---

### Phase C — Async & Waits
> Rule source: §3 of coding-guidelines.md

8. No `waitForTimeout()` anywhere — replace with `waitFor({ state: 'hidden' | 'visible' })` or a web-first assertion.
9. `BasePage.navigate(path)` is used for every page navigation — not raw `page.goto()`.
10. Before interacting with a product list, the skeleton wait is present:
    ```ts
    await this.page.locator('[class="card skeleton"]').first().waitFor({ state: 'hidden' });
    ```
11. If `page.goto()` is used directly (e.g. in `auth.setup.ts`), `waitForLoadState('networkidle')` follows it.

---

### Phase D — Page Object Rules
> Rule source: §4 of coding-guidelines.md

12. Every page object class extends `BasePage`.
13. No assertions (`expect(...)`) inside page objects — assertions belong only in spec files.
14. Cross-page setup flows (e.g. login → add to cart → checkout) live in `ShopFacade`, not inside individual page objects.
15. Action methods return `void` unless the caller genuinely needs a return value (document why if non-void).

---

### Phase E — Test Structure & Naming
> Rule source: §6 and §7 of coding-guidelines.md

16. Each spec file has exactly one top-level `test.describe`, named after the feature area.
17. Test IDs are **unique** across the entire suite. Grep the suite for any duplicated ID to confirm.
18. Test title pattern: `'<PREFIX><NN> <description> @<tag>'`
    - Example: `'C03 increase item quantity @regression'`
19. ID prefix matches the area:

    | Prefix | Area     |
    |--------|----------|
    | `C`    | Cart     |
    | `CH`   | Checkout |
    | `P`    | Product  |
    | `CT`   | Contact  |

20. No `test.only` or `test.skip` committed — use `--grep` to isolate tests during development.

---

### Phase F — Test Data
> Rule source: §8 of coding-guidelines.md

21. No hard-coded strings, emails, passwords, or product names inside specs — all values come from `data/` imports.
22. Exported data objects use `as const` for type-narrowing.
23. No data is duplicated across `data/` files — check for the same value defined in multiple places.

---

### Phase G — TypeScript
> Rule source: §9 of coding-guidelines.md

24. All function parameters and return types are explicitly typed (no implicit `any` from missing annotations).
25. No `any` type — use `unknown` + a type guard if the type is genuinely unknown at compile time.
26. Remind: run `npx tsc --noEmit` before marking the implementation complete.

---

### Phase H — Assertions
> Rule source: §10 of coding-guidelines.md

27. Web-first assertions are used throughout (`toBeVisible`, `toHaveText`, `toHaveValue`, etc.) — they auto-retry.
28. Assertions target user-visible outcomes (text, visibility, URL) — not internal variables or network calls.
29. Where a happy-path assertion exists, check whether a negative assertion (e.g. element not visible after removal) is also needed.
30. No assertions on unstable values: shared-demo counters, current dates, or elements with non-deterministic ordering.

---

### Phase I — Edge & Negative Cases
> Rule source: §11 of coding-guidelines.md

31. For every happy-path flow, verify there are corresponding tests covering:
    - Empty required fields
    - Invalid format (email, phone, etc.)
    - Boundary lengths (just under / just over any stated limit)
32. Each validation rule has its **own** test — never collapse multiple validation checks into a single test.

---

### Phase J — Parameterized Tests
> Rule source: §12 and §13 of coding-guidelines.md

33. Each loop iteration produces a **unique** test ID with the varying value embedded in the title.
34. No mutable state (variables, arrays) is shared between loop iterations.
35. Datasets with more than ~4 cases are extracted to a `data/` file, not defined inline in the spec.

---

### Phase K — No-Duplication Check
> Rule source: §14 of coding-guidelines.md

36. Before accepting a new helper function or flow, confirm nothing equivalent already exists in:
    - `common_actions/shop.facade.ts`
    - `utils/helpers.ts` (if still present)
37. Before accepting a new page object, confirm no existing page object in `pages/` can be extended instead.

---

## Output Format

After completing all phases, report findings grouped by phase:

```
## Review: <filename>

### Phase A — Imports & Fixtures
- [PASS] All imports from fixtures ✓
- [FAIL] Line 12: `new CartPage(page)` — must use fixture injection

### Phase B — Selectors
...

### Summary
X issue(s) found. Run `npx tsc --noEmit` to check TypeScript after fixes.
```

If a phase has no issues, write `[PASS] All checks passed` for that phase and move on. Do not add praise or padding — be terse and precise.

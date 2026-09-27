# Playwright + TypeScript Coding Guidelines

These guidelines apply to every test, page object, fixture, and data file in this repo. Read this file before generating or reviewing any test code.

---

## 1. Selector Strategy (priority order)

Follow this order. Stop at the first that works. Add a comment if you use #3 or #4 explaining why a higher-priority option was not available.

1. **`data-test` attribute** — `page.locator('[data-test="submit-btn"]')`
2. **ARIA role + accessible name** — `page.getByRole('button', { name: 'Add to cart' })`
3. **`getByLabel` / `getByPlaceholder` / `getByText`** — for form fields or content elements where `data-test` is absent
4. **CSS class or structural selector** — last resort only; add a comment explaining why

Never use XPath by position (e.g. `//div[2]/span`). Never use `$` or `querySelector` inside page actions.

---

## 2. Locator Definitions

- Define all locators as `readonly` class properties in the **constructor** of the page object.
- Never create a locator inline inside an action method or inside a spec.
- Use `locator.filter()` or `locator.nth()` to scope or narrow a locator — do not re-query the whole page.

```typescript
// Good
class CartPage extends BasePage {
  readonly cartRows = this.page.locator('[data-test="cart-item"]');
  readonly proceedButton = this.page.getByRole('button', { name: 'Proceed to checkout' });
}

// Bad — locator created inside a method
async clickProceed() {
  await this.page.locator('[data-test="proceed"]').click(); // move to constructor
}
```

---

## 3. Async / Wait Patterns

| Do | Do not |
|----|--------|
| `waitFor({ state: 'hidden' \| 'visible' })` | `waitForTimeout()` |
| `waitForLoadState('networkidle')` after `goto()` | `page.waitForTimeout(2000)` |
| `waitForURL(pattern)` after navigation | arbitrary `sleep` / `setTimeout` |
| Web-first assertions (`toBeVisible`, `toHaveText`) — they auto-retry | Manual polling loops |

**Skeleton wait pattern** (required before interacting with product lists):
```typescript
await this.page.locator('[class="card skeleton"]').first().waitFor({ state: 'hidden' });
```

`BasePage.navigate(path)` already calls `waitForLoadState('networkidle')`. Call it for every page navigation instead of raw `page.goto()`.

---

## 4. Page Object Rules

- All page objects **extend `BasePage`** (`pages/base.page.ts`). This gives a consistent `navigate(path)` with `networkidle` wait.
- **No assertions inside page objects.** Assertions belong in specs only.
- Export a typed interface alongside the class whenever a method accepts structured data:
  ```typescript
  export interface ContactData { firstName: string; email: string; subject: string; message: string; }
  export class ContactPage extends BasePage { ... }
  ```
- A page object interacts only with its own page. Cross-page setup flows go in `ShopFacade`.
- Action methods return `void` unless the caller genuinely needs the return value (e.g. a product name for later assertion).

---

## 5. Fixture & Import Rules

```typescript
// Always — import from fixtures, not from @playwright/test
import { test, expect } from '../../fixtures';
```

- Register every new page object in `fixtures/index.ts`: add it to the `TestFixtures` interface and to `base.extend`.
- Inject page objects and `shopFacade` as fixture parameters — never `new PageObject(page)` inside a spec.
- Use `shopFacade` for multi-step `beforeEach` setup flows (add to cart, navigate to checkout, etc.). Do not duplicate these flows inline.

---

## 6. Test Structure

```typescript
test.describe('Feature area', () => {
  let itemName: string;

  test.beforeEach(async ({ shopFacade }) => {
    itemName = await shopFacade.addToCartAndGoToCart(PRODUCTS.search.validKeyword);
  });

  test('C01 item appears in cart @regression', async ({ cartPage }) => {
    await expect(cartPage.cartRows.filter({ hasText: itemName })).toBeVisible();
  });
});
```

Rules:
- One `test.describe` per spec file, named after the feature area.
- `beforeEach` for shared setup. `afterEach` only when explicit teardown is needed.
- Tests must be **independent** — no mutable state shared between tests. `fullyParallel: true` is on.
- One logical behavior per test; split independent behaviors into separate tests.

---

## 7. Test Naming

Pattern: `test('<PREFIX><NN> <description> @<tag>', ...)`

| Prefix | Area |
|--------|------|
| `C` | Cart |
| `CH` | Checkout |
| `P` | Product |
| `CT` | Contact |

- IDs must be **unique** across the entire suite — `--grep "C03"` must match exactly one test.
- Add a new single-letter prefix for a new area; document it in `CLAUDE.md` Conventions.
- End every title with `@regression` (or a more specific tag if introduced).
- Embed the varying value in parameterized test titles: `CT04 empty ${field} shows error @regression`.

---

## 8. Test Data & Constants

- All test data lives in `data/` files. **No hard-coded strings, emails, or values in specs.**
- Import named exports: `USERS`, `PRODUCTS`, `CONTACT`, etc.
- Use `as const` on object literals for type-narrowing:
  ```typescript
  export const CONTACT = { valid: { firstName: 'Jane', ... } } as const;
  ```
- Never duplicate data across files. If two specs need the same value, it belongs in `data/`.
- To vary one field from valid data, use the spread pattern:
  ```typescript
  await contactPage.fillForm({ ...CONTACT.valid, email: CONTACT.invalidEmail });
  ```

---

## 9. TypeScript Rules

- Explicitly type all function parameters and return types.
- Prefer `interface` over inline object types for structured data.
- No `any`. Use `unknown` + a type-guard if the type is genuinely unknown at compile time.
- Enable strict mode in `tsconfig.json` (`"strict": true`) — it is already on; keep it on.
- Run `npx tsc --noEmit` before marking an implementation complete. It must be clean.

---

## 10. Assertions

- Use **web-first assertions** — they auto-retry until the condition is met or timeout is reached:
  ```typescript
  await expect(locator).toBeVisible();
  await expect(locator).toHaveText('Success');
  await expect(locator).toHaveValue('42');
  await expect(page).toHaveURL(/cart/);
  ```
- Assert on **user-visible outcomes**, not internal state or network calls.
- Add a **negative assertion** where relevant: e.g., confirm the success banner is hidden when the form is invalid.
- Do not assert on values that change on their own (dates, shared-demo counts, unstable ordering).

---

## 11. Negative & Edge Case Tests

Every happy-path flow must have corresponding error/validation tests:
- Empty required fields
- Invalid format (email, phone, etc.)
- Boundary lengths (just under or over the limit)
- One test per validation rule — do not collapse multiple rules into one test

Assert validation messages via `data-test` error locators. Use exact text from the live page (verified during exploration — see SKILL.md Step 2).

---

## 12. Parameterized Tests

Use `for...of` to register individual `test()` calls (see [`references/parameterized-tests.md`](parameterized-tests.md) for full patterns):

```typescript
const fields = ['first-name', 'last-name', 'email'] as const;
for (const field of fields) {
  test(`CT04 empty ${field} shows error @regression`, async ({ contactPage }) => {
    await contactPage.submit();
    await expect(contactPage.getError(field)).toBeVisible();
  });
}
```

Rules:
- Each iteration must produce a **unique test ID** (embed the varying value in the title).
- Do not share mutable state between loop iterations.

---

## 13. Stability & Parallelism

- No `test.only` or `test.skip` committed — use `--grep` instead.
- No file-level or suite-level mutable variables mutated by one test and read by another.
- Tests that need the cart pre-filled must set it up in their own `beforeEach` via `shopFacade`.
- Do not depend on data created by another test (shared demo data can be reset between runs).

---

## 14. No-Duplication Rule

Before adding a new helper, page object, or flow:
1. Check `utils/helpers.ts` and `common_actions/shop.facade.ts` for existing implementations.
2. Check `pages/` for an existing page object to extend.
3. Reuse what exists. Only create a new abstraction when nothing suitable exists.

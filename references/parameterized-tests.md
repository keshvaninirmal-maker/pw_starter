# Parameterized Test Cases in Playwright + TypeScript

This guide covers how to write data-driven, parameterized tests in this repo — running the same test logic with multiple input sets without duplicating spec code.

---

## Why parameterize?

When the same flow must be validated across several inputs (different payment methods, invalid field values, product categories), parameterization keeps tests DRY while preserving individual traceability in the HTML report.

---

## Pattern 1 — `for...of` loop over a dataset

The simplest approach: define an array of cases and loop with `test()` inside it. Each iteration registers a separate test.

```typescript
import { expect, test } from '../../fixtures';
import { PRODUCTS } from '../../data/products';

const SEARCH_CASES = [
  { id: 'P10', keyword: PRODUCTS.search.validKeyword,   expectResults: true  },
  { id: 'P11', keyword: PRODUCTS.search.invalidKeyword, expectResults: false },
  { id: 'P12', keyword: 'Hammer',                       expectResults: true  },
];

for (const { id, keyword, expectResults } of SEARCH_CASES) {
  test(`${id} search "${keyword}" shows results: ${expectResults} @regression`, async ({ homePage, page }) => {
    await homePage.navigate();
    await homePage.search(keyword);
    if (expectResults) {
      await expect(page.locator('.card:not(.skeleton)')).not.toHaveCount(0);
    } else {
      await expect(page.getByText(/no results/i)).toBeVisible();
    }
  });
}
```

**Naming rule:** keep the ID (`P10`, `P11` …) inside the title so `--grep "P10"` still targets one case.

---

## Pattern 2 — `test.describe` wrapping the loop

Use this when you need shared `beforeEach` / `afterEach` logic across all cases.

```typescript
import { expect, test } from '../../fixtures';
import { PRODUCTS } from '../../data/products';

const PAYMENT_CASES = [
  { id: 'CH10', method: 'Bank Transfer',  expectSuccess: true  },
  { id: 'CH11', method: 'Credit Card',    expectSuccess: false }, // invalid card tested separately
  { id: 'CH12', method: 'Cash on Delivery', expectSuccess: true },
];

test.describe('Checkout payment methods', () => {
  test.beforeEach(async ({ shopFacade }) => {
    await shopFacade.addToCartAndGoToCheckout(PRODUCTS.search.validKeyword);
  });

  for (const { id, method, expectSuccess } of PAYMENT_CASES) {
    test(`${id} checkout with payment method "${method}" @regression`, async ({ checkoutPage, page }) => {
      // ... fill address, then:
      await checkoutPage.fillPayment({ method });
      if (expectSuccess) {
        await expect(page.getByText(/payment was successful/i)).toBeVisible();
      } else {
        await expect(page.getByText(/invalid|declined/i).first()).toBeVisible();
      }
    });
  }
});
```

---

## Pattern 3 — parameterized data in `data/`

For larger or reusable datasets, export the array from `data/` and import it into the spec. This keeps test logic separate from test data.

```typescript
// data/payment-methods.ts
export const PAYMENT_METHODS = [
  { id: 'CH10', method: 'Bank Transfer',    expectSuccess: true  },
  { id: 'CH11', method: 'Cash on Delivery', expectSuccess: true  },
] as const;
```

```typescript
// tests/checkout/checkout_payments.spec.ts
import { PAYMENT_METHODS } from '../../data/payment-methods';

for (const c of PAYMENT_METHODS) {
  test(`${c.id} pay via "${c.method}" completes @regression`, async ({ ... }) => { ... });
}
```

---

## Naming conventions

| Element | Rule |
|---|---|
| Test ID | Unique per case within the area prefix (`C`, `CH`, `P`) — `C10`, `C11`, not `C10a` |
| Test title | Embed the varying value so the HTML report row is self-describing |
| Tag | Always end with `@regression` (or a more specific tag) |
| Data file | `data/<domain>.ts` — named after the domain, not the spec |

---

## What NOT to do

- **Don't reuse the same ID** across loop iterations — `--grep "C10"` must match exactly one test.
- **Don't inline large objects** in the spec — move them to `data/` once there are more than ~4 cases.
- **Don't loop inside a single `test()`** — each iteration must be its own `test()` call so Playwright reports them individually and can retry or filter them independently.
- **Don't mix parameterization with `test.only`** during development without a plan to remove it before committing.

---

## Running a single parameterized case

Because each case has a unique ID in its title:

```bash
npx playwright test --grep "P10"          # one case by ID
npx playwright test --grep "payment"      # all cases whose title contains "payment"
npx playwright test --grep "@regression"  # all tagged regression cases
```

---

## Type-safety tip

Use `as const` on the dataset so TypeScript narrows string literals:

```typescript
const CASES = [
  { method: 'Bank Transfer' as const },
  { method: 'Credit Card'   as const },
];
```

Or define a union type in `data/` and assert each row against it to catch typos at compile time:

```typescript
type PaymentMethod = 'Bank Transfer' | 'Credit Card' | 'Cash on Delivery';

const CASES: Array<{ id: string; method: PaymentMethod }> = [
  { id: 'CH10', method: 'Bank Transfer' },
];
```

Run `npx tsc --noEmit` to verify — this repo has no lint step but TypeScript checking catches data mismatches early.

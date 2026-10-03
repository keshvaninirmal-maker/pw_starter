import { expect, test } from '../../fixtures';
import { PRODUCTS } from '../../data/products';
import { USERS } from '../../data/users';
import { ADDRESS, PAYMENT, INVALID_CREDIT_CARD } from '../../data/checkout';

test.describe('Checkout', () => {
  test.beforeEach(async ({ shopFacade }) => {
    await shopFacade.addToCartAndGoToCheckout(PRODUCTS.search.validKeyword);
  });

  test('CH01 happy path checkout as guest @regression', async ({ page, checkoutPage }) => {
    await checkoutPage.continueAsGuest(
      USERS.guest.email,
      USERS.guest.firstName,
      USERS.guest.lastName,
    );
    await checkoutPage.fillAddress(ADDRESS);
    await checkoutPage.fillPayment(PAYMENT);
    await expect(page.getByText(/payment was successful|order confirmed|thank you/i)).toBeVisible();
  });

  test('CH02 address validation rejects empty fields @regression', async ({
    page,
    checkoutPage,
  }) => {
    await checkoutPage.continueAsGuest(
      USERS.guest.email,
      USERS.guest.firstName,
      USERS.guest.lastName,
    );
    await checkoutPage.proceedToBillingButton.click();
    await expect(page.getByText(/required|invalid/i).first()).toBeVisible();
  });

  test('CH03 invalid credit card shows payment error @regression', async ({
    page,
    checkoutPage,
  }) => {
    await checkoutPage.continueAsGuest(
      USERS.guest.email,
      USERS.guest.firstName,
      USERS.guest.lastName,
    );
    await checkoutPage.fillAddress(ADDRESS);
    await checkoutPage.fillPayment(INVALID_CREDIT_CARD);
    await expect(page.getByText(/invalid|declined|error/i).first()).toBeVisible();
  });

  test('CH04 order confirmation shows order number @regression', async ({ page, checkoutPage }) => {
    await checkoutPage.continueAsGuest(
      USERS.guest.email,
      USERS.guest.firstName,
      USERS.guest.lastName,
    );
    await checkoutPage.fillAddress(ADDRESS);
    await checkoutPage.fillPayment(PAYMENT);
    await expect(page.getByText(/payment was successful|order confirmed/i)).toBeVisible();
    await expect(page.locator('[data-test="order-confirmation"]')).toBeVisible();
  });

  test('CH05 back navigation returns to previous step @regression', async ({
    page,
    checkoutPage,
  }) => {
    await checkoutPage.continueAsGuest(
      USERS.guest.email,
      USERS.guest.firstName,
      USERS.guest.lastName,
    );
    await expect(page.locator('app-address')).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/checkout/);
  });

  test('CH06 checkout with multiple items completes successfully @regression', async ({
    page,
    shopFacade,
    checkoutPage,
  }) => {
    await shopFacade.addToCart(PRODUCTS.categories.powerTools);
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    await checkoutPage.continueAsGuest(
      USERS.guest.email,
      USERS.guest.firstName,
      USERS.guest.lastName,
    );
    await checkoutPage.fillAddress(ADDRESS);
    await checkoutPage.fillPayment(PAYMENT);
    await expect(page.getByText(/payment was successful|order confirmed|thank you/i)).toBeVisible();
  });
});

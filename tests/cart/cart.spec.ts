import { expect, test } from '../../fixtures';
import { PRODUCTS } from '../../data/products';

test.describe('Cart', () => {
  let itemName = '';

  test.beforeEach(async ({ shopFacade }) => {
    itemName = await shopFacade.addToCartAndGoToCart(PRODUCTS.search.validKeyword);
  });

  test('C01 add single product appears in cart @regression', async ({ cartPage }) => {
    await expect(cartPage.cartRows).toHaveCount(1);
  });

  test('C02 add multiple products shows multiple rows @regression', async ({ homePage, productPage, cartPage }) => {
    await homePage.navigate();
    await homePage.filterByCategory(PRODUCTS.categories.powerTools);
    await homePage.getProductCardNames().first().click();
    await productPage.addToCartButton.click();
    await cartPage.navigate();
    await expect(cartPage.cartRows).toHaveCount(2);
  });

  test('C03 increase item quantity @regression', async ({ cartPage }) => {
    const input = cartPage.getItemQuantityInput(itemName);
    await input.fill('3');
    await input.press('Tab');
    await expect(input).toHaveValue('3');
  });

  test('C04 decrease item quantity @regression', async ({ cartPage }) => {
    const input = cartPage.getItemQuantityInput(itemName);
    await input.fill('5');
    await input.press('Tab');
    await input.fill('2');
    await input.press('Tab');
    await expect(input).toHaveValue('2');
  });

  test('C05 remove item reduces cart count @regression', async ({ cartPage }) => {
    await cartPage.getItemRemoveButton(itemName).click();
    await expect(cartPage.cartRows).toHaveCount(0);
  });

  test('C06 remove all items shows empty cart state @regression', async ({ cartPage, page }) => {
    await cartPage.getItemRemoveButton(itemName).click();
    await expect(page.getByText(/cart is empty/i)).toBeVisible();
  });

  test('C07 cart total updates after quantity change @regression', async ({ cartPage }) => {
    const before = await cartPage.cartTotal.textContent();
    const input = cartPage.getItemQuantityInput(itemName);
    await input.fill('5');
    await input.press('Tab');
    await expect(cartPage.cartTotal, 'cart total should update after quantity change').not.toHaveText(before || '', { timeout: 5000 });
  });
});

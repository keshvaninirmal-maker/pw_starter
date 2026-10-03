import { expect, test } from '../../fixtures';
import { PRODUCTS } from '../../data/products';

test.describe('Product', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('P01 search existing product returns results @regression', async ({ homePage }) => {
    await homePage.searchFor(PRODUCTS.search.validKeyword);
    const names = homePage.getProductCardNames();
    await expect(names.first()).toBeVisible();
  });

  test('P02 search non-existing product shows empty state @regression', async ({
    homePage,
    page,
  }) => {
    await homePage.searchFor(PRODUCTS.search.invalidKeyword);
    await expect(page.getByText(/no products found/i)).toBeVisible();
  });

  test('P03 filter by Hand Tools shows results @regression', async ({ homePage }) => {
    await homePage.filterByCategory(PRODUCTS.categories.handTools);
    await expect(homePage.productCards.first()).toBeVisible();
  });

  test('P04 filter by Power Tools shows results @regression', async ({ homePage }) => {
    await homePage.filterByCategory(PRODUCTS.categories.powerTools);
    await expect(homePage.productCards.first()).toBeVisible();
  });

  test('P05 sort by price low to high @regression', async ({ homePage }) => {
    await homePage.sortBy(PRODUCTS.sort.priceAsc);
    await expect(homePage.productCards.first()).toBeVisible();
  });

  test('P06 sort by name A to Z @regression', async ({ homePage }) => {
    await homePage.sortBy(PRODUCTS.sort.nameAsc);
    await expect(homePage.productCards.first()).toBeVisible();
  });

  test('P07 click product navigates to detail page @regression', async ({ homePage, page }) => {
    await homePage.getProductCardNames().first().click();
    await expect(page).toHaveURL(/\/product\//);
  });

  test('P08 search results only contain products matching the keyword @regression', async ({
    homePage,
  }) => {
    const keyword = PRODUCTS.search.validKeyword;
    await homePage.searchFor(keyword);
    await expect(homePage.searchCaption).toHaveText(`${PRODUCTS.search.captionPrefix}${keyword}`);
    await expect(homePage.productNames.first()).toContainText(keyword);
    await expect(
      homePage.productNames.filter({ hasNotText: new RegExp(keyword, 'i') }),
    ).toHaveCount(0);
  });

  test('P09 clearing search resets input and caption @regression', async ({ homePage }) => {
    await homePage.searchFor(PRODUCTS.search.validKeyword);
    await expect(homePage.searchCaption).toBeVisible();
    await homePage.searchClearButton.click();
    await expect(homePage.searchInput).toHaveValue('');
    await expect(homePage.searchCaption).toBeHidden();
  });
});

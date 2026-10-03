import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchClearButton: Locator;
  readonly sortDropdown: Locator;
  // no data-test on card elements; CSS substring match is the most stable fallback
  readonly productCards: Locator;
  readonly navContact: Locator;
  readonly searchCaption: Locator;
  readonly productNames: Locator;

  constructor(page: import('@playwright/test').Page) {
    super(page);
    this.searchInput = page.getByRole('textbox', { name: 'Search' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.searchClearButton = page.locator('[data-test="search-reset"]');
    this.sortDropdown = page.getByRole('combobox', { name: 'sort' });
    // no data-test on card wrapper; CSS class substring is the most reliable selector available
    this.productCards = page
      .locator('[class*="card"]')
      .filter({ has: page.getByRole('heading', { level: 5 }) });
    this.navContact = page.locator('[data-test="nav-contact"]');
    this.searchCaption = page.locator('[data-test="search-caption"]');
    this.productNames = page.locator('[data-test="product-name"]');
  }

  async navigate(): Promise<void> {
    await super.navigate('/');
  }

  async searchFor(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
  }

  async filterByCategory(category: string): Promise<void> {
    await this.getCategoryCheckbox(category).check();
  }

  async sortBy(option: string): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async clickProduct(name: string): Promise<void> {
    await this.getProductHeading(name).click();
  }

  getCategoryCheckbox(category: string): Locator {
    return this.page.getByRole('checkbox', { name: category });
  }

  getProductHeading(name: string): Locator {
    return this.page.getByRole('heading', { name, level: 5 });
  }

  getProductCardNames(): Locator {
    return this.page.getByRole('heading', { level: 5 });
  }

  getCartBadge(): Locator {
    // no data-test on cart badge counter; structural selector targets the last generic inside the cart link
    return this.page
      .locator('app-header')
      .getByRole('link', { name: 'cart' })
      .locator('generic')
      .last();
  }

  getPaginationButton(label: string): Locator {
    return this.page.getByRole('button', { name: label });
  }
}

import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export class ContactPage extends BasePage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly subject: Locator;
  readonly message: Locator;
  readonly attachment: Locator;
  readonly submitButton: Locator;
  readonly successAlert: Locator;
  // used to assert absence of a dedicated payment section heading
  readonly paymentSectionHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.locator('[data-test="first-name"]');
    this.lastName = page.locator('[data-test="last-name"]');
    this.email = page.locator('[data-test="email"]');
    this.subject = page.locator('[data-test="subject"]');
    this.message = page.locator('[data-test="message"]');
    this.attachment = page.locator('[data-test="attachment"]');
    this.submitButton = page.locator('[data-test="contact-submit"]');
    // no data-test on success alert; CSS class fallback
    this.successAlert = page.locator('.alert-success');
    // role-based: heading text contains "payment" (case-insensitive)
    this.paymentSectionHeading = page.getByRole('heading', { name: /payment/i });
  }

  async open(): Promise<void> {
    await this.navigate('/contact');
  }

  async fillForm(data: ContactData): Promise<void> {
    await this.firstName.fill(data.firstName);
    await this.lastName.fill(data.lastName);
    await this.email.fill(data.email);
    await this.subject.selectOption({ label: data.subject });
    await this.message.fill(data.message);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  getError(text: string): Locator {
    return this.page.getByRole('alert').filter({ hasText: text });
  }
}

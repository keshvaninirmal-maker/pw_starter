import { expect, test } from '../../fixtures';
import { CONTACT } from '../../data/contact';

test.describe('Contact', () => {
  test.beforeEach(async ({ contactPage }) => {
    await contactPage.open();
  });

  test('CT01 contact form displays all fields @regression', async ({ contactPage, page }) => {
    await expect(page.getByRole('heading', { name: 'Contact', level: 3 })).toBeVisible();
    await expect(contactPage.firstName).toBeVisible();
    await expect(contactPage.lastName).toBeVisible();
    await expect(contactPage.email).toBeVisible();
    await expect(contactPage.subject).toBeVisible();
    await expect(contactPage.message).toBeVisible();
    await expect(contactPage.attachment).toBeVisible();
    await expect(contactPage.submitButton).toBeEnabled();
  });

  test('CT02 subject dropdown lists all options @regression', async ({ contactPage }) => {
    const options = await contactPage.subject.locator('option').allInnerTexts();
    expect(options.slice(1)).toEqual(CONTACT.subjects);
  });

  test('CT03 submitting empty form shows required errors @regression', async ({ contactPage }) => {
    await contactPage.submit();
    await expect(contactPage.getError('First name is required')).toBeVisible();
    await expect(contactPage.getError('Last name is required')).toBeVisible();
    await expect(contactPage.getError('Email is required')).toBeVisible();
    await expect(contactPage.getError('Subject is required')).toBeVisible();
    await expect(contactPage.getError('Message is required')).toBeVisible();
    await expect(contactPage.successAlert).toBeHidden();
  });

  test('CT04 invalid email format is rejected @regression', async ({ contactPage }) => {
    await contactPage.fillForm({ ...CONTACT.valid, email: CONTACT.invalidEmail });
    await contactPage.submit();
    await expect(contactPage.getError('Email format is invalid')).toBeVisible();
    await expect(contactPage.successAlert).toBeHidden();
  });

  test('CT05 message shorter than 50 characters is rejected @regression', async ({ contactPage }) => {
    await contactPage.fillForm({ ...CONTACT.valid, message: CONTACT.shortMessage });
    await contactPage.submit();
    await expect(contactPage.getError('Message must be minimal 50 characters')).toBeVisible();
    await expect(contactPage.successAlert).toBeHidden();
  });

  test('CT06 valid submission shows success message @regression', async ({ contactPage }) => {
    await contactPage.fillForm(CONTACT.valid);
    await contactPage.submit();
    await expect(contactPage.successAlert).toContainText(CONTACT.successText);
    await expect(contactPage.firstName).toBeHidden();
  });

  test('CT07 contact page reachable from navigation menu @regression', async ({ homePage, page }) => {
    await homePage.navigate();
    await homePage.navContact.click();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test('CT08 subject dropdown includes Payments option @regression', async ({ contactPage }) => {
    await expect(
      contactPage.subject.locator('option').filter({ hasText: CONTACT.paymentsSubject })
    ).toBeAttached();
  });

  test('CT09 contact page has no standalone payment section @regression', async ({ contactPage }) => {
    await expect(contactPage.paymentSectionHeading).toBeHidden();
  });
});

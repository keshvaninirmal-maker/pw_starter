import { AddressData, PaymentData } from '../pages/checkout.page';

export const ADDRESS: AddressData = {
  country: 'United States',
  postalCode: '12345',
  houseNumber: '123',
  street: 'Main St',
  city: 'Anytown',
  state: 'NY',
};

export const PAYMENT: PaymentData = {
  method: 'Bank Transfer',
};

export const INVALID_CREDIT_CARD: PaymentData = {
  method: 'Credit Card',
  cardNumber: '0000000000000000',
  expirationDate: '01/23',
  cvv: '000',
  cardHolderName: 'Test User',
};

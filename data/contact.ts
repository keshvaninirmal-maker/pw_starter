export const CONTACT = {
  valid: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    subject: 'Customer service',
    message: 'This is a valid contact message that is comfortably longer than fifty characters.',
  },
  subjects: ['Customer service', 'Webmaster', 'Return', 'Payments', 'Warranty', 'Status of my order'],
  shortMessage: 'Too short',
  invalidEmail: 'not-an-email',
  successText: 'Thanks for your message! We will contact you shortly.',
} as const;

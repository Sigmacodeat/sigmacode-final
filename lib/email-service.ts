// Email service for sending notifications
export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; messageId?: string }> => {
  // Mock implementation for testing
  console.log('Email sent:', options);
  return { success: true, messageId: 'mock-email-id' };
};

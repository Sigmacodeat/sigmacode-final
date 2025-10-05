// Slack service for sending notifications
export const sendSlackMessage = async (options: {
  channel: string;
  text: string;
  blocks?: any[];
}): Promise<{ ok: boolean; ts?: string }> => {
  // Mock implementation for testing
  console.log('Slack message sent:', options);
  return { ok: true, ts: 'mock-slack-timestamp' };
};

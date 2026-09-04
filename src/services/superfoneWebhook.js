/**
 * Utility to forward form submissions to Superfone Webhook Integration
 */
async function sendToSuperfone(payload) {
  try {
    const webhookUrl = 'https://prod-api.superfone.co.in/superfone/webhook/integration/3EBBWb4Ffq9ZqkZNJ8cOjFdrlkfKCT';

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'GCLB="9bc7e71d5c944a3e"'
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.text();
    console.log('Superfone Webhook Response status:', response.status, responseData);
    return responseData;
  } catch (err) {
    console.error('Error forwarding data to Superfone webhook:', err.message || err);
  }
}

module.exports = {
  sendToSuperfone
};

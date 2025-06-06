import axios from 'axios';
import * as fs from 'fs';

export class SlackNotifier {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async sendTestResults(testResults: any) {
    const message = this.formatTestResults(testResults);
    await this.sendMessage(message);
  }

  private formatTestResults(results: any): any {
    const totalTests = results.totalTests;
    const passedTests = results.passedTests;
    const failedTests = results.failedTests;
    const duration = results.duration;

    return {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🚀 Cypress Test Results",
            emoji: true
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Total Tests:*\n${totalTests}`
            },
            {
              type: "mrkdwn",
              text: `*Duration:*\n${duration}ms`
            },
            {
              type: "mrkdwn",
              text: `*Passed:*\n${passedTests} ✅`
            },
            {
              type: "mrkdwn",
              text: `*Failed:*\n${failedTests} ❌`
            }
          ]
        }
      ]
    };
  }

  private async sendMessage(message: any) {
    try {
      console.log('Attempting to send Slack message to URL:', this.webhookUrl);
      const response = await axios.post(this.webhookUrl, message);
      console.log('Slack API response status:', response.status);
      console.log('Slack API response data:', response.data);
      // You might want to check response.data or response.status here for non-2xx responses
    } catch (error: any) {
      console.error('Error sending message to Slack with URL:', this.webhookUrl);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Slack API response error status:', error.response.status);
        console.error('Slack API response error data:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Slack API no response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up Slack message request:', error.message);
      }
    }
  }

  async sendScreenshot(screenshotPath: string) {
    try {
      console.log('Attempting to send screenshot:', screenshotPath);
      const imageBuffer = fs.readFileSync(screenshotPath);
      const base64Image = imageBuffer.toString('base64');

      const message = {
        blocks: [
          {
            type: "image",
            title: {
              type: "plain_text",
              text: "Test Failure Screenshot"
            },
            image_url: `data:image/png;base64,${base64Image}`,
            alt_text: "Test Failure Screenshot"
          }
        ]
      };

      await this.sendMessage(message);
    } catch (error) {
      console.error('Error sending screenshot to Slack:', error);
    }
  }
} 
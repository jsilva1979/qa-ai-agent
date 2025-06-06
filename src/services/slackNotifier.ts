import axios from 'axios';
import { GoogleDriveService } from './googleDriveService';

export class SlackNotifier {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
    if (!this.webhookUrl) {
      throw new Error('SLACK_WEBHOOK_URL environment variable is not set');
    }
  }

  async sendTestResults(results: any) {
    const message = {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Test Results*\nPassed: ${results.passedTests}\nFailed: ${results.failedTests}\nDuration: ${results.duration}ms`
          }
        }
      ]
    };

    try {
      const response = await axios.post(this.webhookUrl, message);
      console.log('Slack API response status:', response.status);
      console.log('Slack API response data:', response.data);
    } catch (error: any) {
      console.error('Error sending test results to Slack:', error.message);
      if (error.response) {
        console.error('Slack API response error status:', error.response.status);
        console.error('Slack API response error data:', error.response.data);
      }
    }
  }

  async sendScreenshot(screenshotPath: string) {
    try {
      // Upload screenshot to Google Drive
      const driveService = await GoogleDriveService.getInstance();
      const publicUrl = await driveService.uploadFile(screenshotPath);

      // Send message with screenshot URL to Slack using attachments
      const message = {
        attachments: [
          {
            color: "#ff0000",
            title: "Failed Test Screenshot",
            image_url: publicUrl,
            fallback: "Failed test screenshot"
          }
        ]
      };

      const response = await axios.post(this.webhookUrl, message);
      console.log('Slack API response status:', response.status);
      console.log('Slack API response data:', response.data);
    } catch (error: any) {
      console.error('Error sending screenshot to Slack:', error.message);
      if (error.response) {
        console.error('Slack API response error status:', error.response.status);
        console.error('Slack API response error data:', error.response.data);
      }
    }
  }
} 
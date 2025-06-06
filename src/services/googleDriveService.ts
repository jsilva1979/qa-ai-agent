import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';

export class GoogleDriveService {
  private static instance: GoogleDriveService;
  private drive: any;

  private constructor() {}

  public static async getInstance(): Promise<GoogleDriveService> {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
      await GoogleDriveService.instance.initialize();
    }
    return GoogleDriveService.instance;
  }

  private async initialize() {
    try {
      const credentials = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'credentials.json'), 'utf-8')
      );

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });

      this.drive = google.drive({ version: 'v3', auth });
    } catch (error) {
      console.error('Error initializing Google Drive service:', error);
      throw error;
    }
  }

  public async uploadFile(filePath: string): Promise<string> {
    try {
      console.log('Attempting to upload file to Google Drive:', filePath);
      const fileMetadata = {
        name: path.basename(filePath),
        mimeType: 'image/png',
      };

      const media = {
        mimeType: 'image/png',
        body: fs.createReadStream(filePath),
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
      });

      console.log('File uploaded to Google Drive. File ID:', response.data.id);

      // Make the file publicly accessible
      console.log('Making file publicly accessible.');
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      console.log('File is now publicly accessible.');

      // Return the direct download link for the image
      const fileId = response.data.id;
      const publicUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      console.log('Generated public download URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      throw error;
    }
  }
} 
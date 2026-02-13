import { google, drive_v3, Auth } from 'googleapis';
import { randomUUID } from 'node:crypto';
import { Readable } from 'stream';

export class DriveService {
  private drive: drive_v3.Drive;
  private oauth2Client: Auth.OAuth2Client;
  private CHUNK_SIZE = 1024 * 1024; // 1MB chunks
  private rootFolderName: string;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';
    this.rootFolderName = process.env.DRIVE_ROOT_FOLDER_NAME || 'spectral ';

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth2 credentials are missing');
    }

    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    if (refreshToken) {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    }

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  private async ensureAuthenticated(): Promise<void> {
    const credentials = this.oauth2Client.credentials;

    if (!credentials.access_token && !credentials.refresh_token) {
      throw new Error('No authentication tokens available.');
    }

    if (credentials.expiry_date && Date.now() >= credentials.expiry_date - 300000) {
      try {
        const { credentials: newCredentials } = await this.oauth2Client.refreshAccessToken();
        this.oauth2Client.setCredentials(newCredentials);
      } catch (error: any) {
        throw new Error('Token refresh failed. Please re-authenticate.');
      }
    }
  }

  async uploadFile({
    file,
    folderName,
    subfolder,
    fileName,
  }: {
    file: Buffer;
    mimeType: string;
    folderName: string;
    subfolder?: string;
    fileName?: string;
    size: number;
  }): Promise<{ url: string; fileId: string }> {
    // Simplified version for Next.js - assuming buffer and metadata are passed
    const finalFileName = fileName || `${randomUUID()}`;
    await this.ensureAuthenticated();
    
    try {
      const folderId = await this.ensureFolderExists(folderName, subfolder);
      
      const res = await this.drive.files.create({
        requestBody: {
          name: finalFileName,
          parents: [folderId],
        },
        media: {
          mimeType: (arguments[0] as any).mimeType,
          body: Readable.from(file),
        },
        fields: 'id, webViewLink',
      });

      return {
        url: res.data.webViewLink || `https://drive.google.com/file/d/${res.data.id}/view`,
        fileId: res.data.id!,
      };
    } catch (error: any) {
      console.error('Drive upload failed:', error);
      throw new Error('File upload failed');
    }
  }

  async createFolder(folderName: string, parentId?: string): Promise<string> {
    await this.ensureAuthenticated();
    if (!parentId) {
      parentId = await this.getFolderId(this.rootFolderName) || undefined;
    }

    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : [],
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
      });

      return response.data.id as string;
    } catch (error: any) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  }

  async updateFolder(folderId: string, folderName: string): Promise<void> {
    await this.ensureAuthenticated();
    try {
      await this.drive.files.update({
        fileId: folderId,
        requestBody: { name: folderName },
      });
    } catch (error: any) {
      console.error('Failed to update folder:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.ensureAuthenticated();
    try {
      await this.drive.files.delete({ fileId });
    } catch (error: any) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  }

  async getFileStream(fileId: string): Promise<Readable> {
    await this.ensureAuthenticated();
    const response = await this.drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );
    return response.data as Readable;
  }

  private async getFolderId(folderName: string, parentId?: string): Promise<string | null> {
    await this.ensureAuthenticated();
    const q = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false` +
      (parentId ? ` and '${parentId}' in parents` : '');
    const res = await this.drive.files.list({ q, fields: 'files(id,name)' });
    const files = res.data.files;
    return files && files.length > 0 ? files[0].id! : null;
  }

  private async ensureFolderExists(folderName: string, subfolder?: string): Promise<string> {
    let parentId = await this.getFolderId(folderName);
    if (!parentId) {
      parentId = await this.createFolder(folderName);
    }

    if (subfolder) {
      const subfolderParts = subfolder.split('/').filter((part) => part.length > 0);
      let currentParentId = parentId;
      for (const part of subfolderParts) {
        let subFolderId = await this.getFolderId(part, currentParentId);
        if (!subFolderId) {
          subFolderId = await this.createFolder(part, currentParentId);
        }
        currentParentId = subFolderId;
      }
      return currentParentId;
    }
    return parentId;
  }
}

export const driveService = new DriveService();

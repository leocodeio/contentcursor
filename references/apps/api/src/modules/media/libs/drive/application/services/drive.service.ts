import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { google, Auth, drive_v3 } from 'googleapis';
import { randomUUID } from 'node:crypto';
import { Readable } from 'stream';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DriveService {
  private drive: drive_v3.Drive;
  private oauth2Client: Auth.OAuth2Client;
  private readonly logger = new Logger(DriveService.name);
  private readonly CHUNK_SIZE = 1024 * 1024; // 1MB chunks for better performance
  private rootFolderName: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri =
      this.configService.get<string>('GOOGLE_REDIRECT_URI') ||
      'http://localhost:3000/oauth2callback';
    this.rootFolderName =
      this.configService.get<string>('DRIVE_ROOT_FOLDER_NAME') || 'spectral ';

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth2 credentials are missing');
    }

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );

    this.initializeWithStoredTokens();
    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  private async initializeWithStoredTokens(): Promise<void> {
    try {
      const refreshToken = this.configService.get<string>(
        'GOOGLE_REFRESH_TOKEN',
      );
      if (refreshToken) {
        await this.setSavedTokens({ refresh_token: refreshToken });
        this.logger.log('Initialized with stored refresh token');
      }
    } catch (error: any) {
      this.logger.warn(
        `Failed to initialize with stored tokens: ${error.message}`,
      );
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    const credentials = this.oauth2Client.credentials;

    if (!credentials.access_token && !credentials.refresh_token) {
      throw new Error(
        'No authentication tokens available. Please authenticate first using getAuthUrl()',
      );
    }

    // Check if token is expired or about to expire
    if (
      credentials.expiry_date &&
      Date.now() >= credentials.expiry_date - 300000
    ) {
      // 5 min buffer
      try {
        this.logger.log('Refreshing access token...');
        const { credentials: newCredentials } =
          await this.oauth2Client.refreshAccessToken();
        this.oauth2Client.setCredentials(newCredentials);
        this.logger.log('Access token refreshed successfully');
      } catch (error: any) {
        this.logger.error(`Failed to refresh access token: ${error.message}`);
        throw new Error('Token refresh failed. Please re-authenticate.');
      }
    }
  }

  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  async setCredentials(code: string): Promise<void> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      console.log('tokens', tokens);
      this.oauth2Client.setCredentials(tokens);

      if (tokens.refresh_token) {
        this.logger.log('Refresh token received and stored');
      }
    } catch (error: any) {
      this.logger.error(`Failed to exchange code for tokens: ${error.message}`);
      throw new Error('OAuth2 token exchange failed');
    }
  }

  async setSavedTokens(tokens: {
    access_token?: string;
    refresh_token?: string;
    expiry_date?: number;
  }): Promise<void> {
    this.oauth2Client.setCredentials(tokens);
  }

  async uploadImage(
    file: Express.Multer.File,
    folderName: string,
    folder?: string,
    fileName?: string,
  ): Promise<{ url: string; fileId: string }> {
    if (!file.mimetype.includes('image')) {
      throw new BadRequestException(
        'Invalid file type. Only images are allowed.',
      );
    }

    return this.uploadFileResumable({
      file,
      folderName,
      folder,
      fileName,
    });
  }

  async uploadVideo(
    file: Express.Multer.File,
    folderName: string,
    folder?: string,
    fileName?: string,
  ): Promise<{ url: string; fileId: string }> {
    if (!file.mimetype.includes('video')) {
      throw new BadRequestException(
        'Invalid file type. Only videos are allowed.',
      );
    }

    return this.uploadFileResumable({
      file,
      folderName,
      folder,
      fileName,
    });
  }

  async uploadFile({
    file,
    folderName,
    folder,
    fileName,
  }: {
    file: Express.Multer.File;
    folderName: string;
    folder?: string;
    fileName?: string;
  }): Promise<{ url: string; fileId: string }> {
    return this.uploadFileResumable({ file, folderName, folder, fileName });
  }

  private async uploadFileResumable({
    file,
    folderName,
    folder,
    fileName,
  }: {
    file: Express.Multer.File;
    folderName: string;
    folder?: string;
    fileName?: string;
  }): Promise<{ url: string; fileId: string }> {
    const finalFileName = fileName || `${randomUUID()}_${file.originalname}`;

    try {
      const folderId = await this.ensureFolderExists(folderName, folder);
      console.log('folderId', folderId);

      const fileMetadata = {
        name: finalFileName,
        parents: [folderId],
      };
      console.log('fileMetadata', fileMetadata);
      // Step 1: Initialize resumable upload session
      console.log('step 1');
      const sessionUri = await this.initiateResumableUpload(
        fileMetadata,
        file.mimetype,
        file.size,
      );
      console.log('step 2');
      // Step 2: Upload file in chunks
      const response = await this.uploadInChunks(sessionUri, file.buffer);
      console.log('step 3');
      // Step 3: Set permissions (optional, non-blocking)
      await this.setFilePermissions(response.id).catch((error: any) => {
        this.logger.warn(`Failed to set file permissions: ${error.message}`);
      });
      console.log('step 4');
      return {
        url:
          response.webViewLink ||
          `https://drive.google.com/file/d/${response.id}/view`,
        fileId: response.id,
      };
    } catch (error: any) {
      this.logger.error(`Drive upload failed: ${error.message}`);
      throw new Error('File upload failed');
    }
  }

  private async initiateResumableUpload(
    fileMetadata: any,
    mimeType: string,
    fileSize: number,
  ): Promise<string> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await firstValueFrom(
        this.httpService.post(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
          JSON.stringify(fileMetadata),
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json; charset=UTF-8',
              'X-Upload-Content-Type': mimeType,
              'X-Upload-Content-Length': fileSize.toString(),
            },
          },
        ),
      );

      const sessionUri = response.headers['location'];
      if (!sessionUri) {
        throw new Error('Failed to get resumable upload session URI');
      }

      this.logger.log(`Resumable upload session initiated: ${sessionUri}`);
      return sessionUri;
    } catch (error: any) {
      this.logger.error(
        `Failed to initiate resumable upload: ${error.message}`,
      );
      throw error;
    }
  }

  private async uploadInChunks(
    sessionUri: string,
    fileBuffer: Buffer,
  ): Promise<any> {
    const totalSize = fileBuffer.length;
    let uploadedBytes = 0;

    try {
      // If file is small (< 5MB), upload in single request
      if (totalSize <= 5 * 1024 * 1024) {
        return await this.uploadSingleChunk(
          sessionUri,
          fileBuffer,
          0,
          totalSize - 1,
          totalSize,
        );
      }

      // Upload in chunks for larger files
      while (uploadedBytes < totalSize) {
        const chunkStart = uploadedBytes;
        const chunkEnd = Math.min(
          uploadedBytes + this.CHUNK_SIZE - 1,
          totalSize - 1,
        );
        const chunk = fileBuffer.subarray(chunkStart, chunkEnd + 1);

        const response = await this.uploadChunk(
          sessionUri,
          chunk,
          chunkStart,
          chunkEnd,
          totalSize,
        );

        uploadedBytes = chunkEnd + 1;

        const progress = Math.round((uploadedBytes / totalSize) * 100);
        this.logger.log(
          `Upload progress: ${progress}% (${uploadedBytes}/${totalSize} bytes)`,
        );

        // If we get a complete response (file upload finished)
        if (response && response.id) {
          return response;
        }
      }

      // Final check - try to complete the upload
      const finalResponse = await this.completeUpload(sessionUri, totalSize);
      if (finalResponse && finalResponse.id) {
        return finalResponse;
      }

      throw new Error('Upload completed but no file response received');
    } catch (error: any) {
      this.logger.error(`Chunk upload failed: ${error.message}`);
      throw error;
    }
  }

  private async uploadChunk(
    sessionUri: string,
    chunk: Buffer,
    start: number,
    end: number,
    totalSize: number,
  ): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await firstValueFrom(
        this.httpService.put(sessionUri, chunk, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Length': chunk.length.toString(),
            'Content-Range': `bytes ${start}-${end}/${totalSize}`,
          },
          validateStatus: (status) =>
            status === 200 || status === 201 || status === 308,
        }),
      );

      // 200/201: Upload complete, 308: Resume incomplete
      if (response.status === 200 || response.status === 201) {
        return response.data;
      } else if (response.status === 308) {
        // Continue with next chunk
        return null;
      }

      throw new Error(`Unexpected response status: ${response.status}`);
    } catch (error: any) {
      if (error.response?.status === 308) {
        return null; // Continue uploading
      }
      this.logger.error(
        `Chunk upload error: ${error.message}`,
        error.response?.data,
      );
      throw error;
    }
  }

  private async completeUpload(
    sessionUri: string,
    totalSize: number,
  ): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      // Send a final request to complete the upload
      const response = await firstValueFrom(
        this.httpService.put(sessionUri, Buffer.alloc(0), {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Range': `bytes */${totalSize}`,
          },
          validateStatus: (status) =>
            status === 200 || status === 201 || status === 400,
        }),
      );

      if (response.status === 200 || response.status === 201) {
        return response.data;
      }

      return null;
    } catch (error: any) {
      this.logger.warn(`Failed to complete upload: ${error.message}`);
      return null;
    }
  }

  private async uploadSingleChunk(
    sessionUri: string,
    fileBuffer: Buffer,
    start: number,
    end: number,
    totalSize: number,
  ): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await firstValueFrom(
        this.httpService.put(sessionUri, fileBuffer, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Length': fileBuffer.length.toString(),
            'Content-Range': `bytes ${start}-${end}/${totalSize}`,
          },
        }),
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(`Single chunk upload failed: ${error.message}`);
      throw error;
    }
  }

  private async getAccessToken(): Promise<string> {
    try {
      await this.ensureAuthenticated();
      const { token } = await this.oauth2Client.getAccessToken();
      if (!token) {
        throw new NotFoundException('No access token found');
      }
      return token;
    } catch (error: any) {
      this.logger.error(`Failed to get access token: ${error.message}`);
      throw new Error('Authentication failed');
    }
  }

  private async setFilePermissions(fileId: string): Promise<boolean> {
    try {
      await this.drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to set file permissions: ${error.message}`);
      return false;
    }
  }

  async folderExists(folderName: string): Promise<boolean> {
    await this.ensureAuthenticated();
    const id = await this.getFolderId(folderName);
    return !!id;
  }

  async createFolder(folderName: string, parentId?: string): Promise<string> {
    if (typeof folderName !== 'string') {
      throw new BadRequestException('Invalid folder name — expected a string.');
    }

    if (!parentId) {
      const rootParentId = await this.getFolderId(this.rootFolderName);
      if (!rootParentId) {
        throw new Error(`Root folder "${this.rootFolderName}" not found.`);
      }
      parentId = rootParentId;
    }
    await this.ensureAuthenticated();

    try {
      const existingFolderId = await this.getFolderId(folderName, parentId);
      if (existingFolderId) {
        throw new BadRequestException(`Folder "${folderName}" already exists.`);
      }

      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
      });

      this.logger.log(`Folder "${folderName}" created.`);
      return response.data.id as string;
    } catch (error: any) {
      this.logger.error(
        `Failed to create folder: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateFolder(folderId: string, folderName: string): Promise<void> {
    try {
      await this.drive.files.update({
        fileId: folderId,
        requestBody: { name: folderName },
      });
    } catch (error: any) {
      this.logger.error(`Failed to update folder: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to update folder: ${error.message}`,
      );
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({ fileId });
    } catch (error: any) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getFileStream(fileId: string): Promise<Readable> {
    try {
      /*
       * IMPORTANT:
       * googleapis drive.files.get must be called with responseType: 'stream' in the
       * request options (2nd parameter) to ensure response.data is a readable stream.
       * Without this, the library returns the full file contents buffered (or metadata),
       * which is not a stream and therefore breaks downstream consumers expecting
       * a .pipe() method (e.g. YouTube videos.insert multipart upload which calls
       * part.body.pipe internally when a stream is provided).
       */
      const response = await this.drive.files.get(
        {
          fileId,
          alt: 'media',
        },
        {
          responseType: 'stream',
        },
      );

      if (!response.data) {
        throw new NotFoundException('File does not exist');
      }

      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to create file stream: ${error.message}`);
      throw error;
    }
  }

  async getFileMetadata(fileId: string): Promise<any> {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime',
      });
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to get file metadata: ${error.message}`);
      throw new NotFoundException('File not found');
    }
  }

  private async getFolderId(
    folderName: string,
    parentId?: string,
  ): Promise<string | null> {
    try {
      await this.ensureAuthenticated();

      const q =
        `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false` +
        (parentId ? ` and '${parentId}' in parents` : '');
      const res = await this.drive.files.list({ q, fields: 'files(id,name)' });
      console.log('res', res);
      const files = res.data.files;
      console.log('files', files);
      return files && files.length > 0 ? files[0].id! : null;
    } catch (error: any) {
      this.logger.error(`Error getting folder ID: ${error.message}`);
      return null;
    }
  }

  private async ensureFolderExists(
    folderName: string,
    subfolder?: string,
  ): Promise<string> {
    await this.ensureAuthenticated();

    try {
      let parentId = await this.getFolderId(folderName);
      console.log('parentId 1 for folder', folderName, parentId);

      if (!parentId) {
        parentId = await this.createFolder(folderName);
      }

      console.log('parentId 2 for folder', folderName, parentId);

      if (subfolder) {
        const subfolderParts = subfolder
          .split('/')
          .filter((part) => part.length > 0);
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
    } catch (error: any) {
      this.logger.error(`Error ensuring folder exists: ${error.message}`);
      throw error;
    }
  }
}

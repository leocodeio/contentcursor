import { prisma } from "@/lib/prisma";
import { google, Auth, youtube_v3 } from 'googleapis';
import { driveService } from "../media/drive.service";

export class YtIntService {
  private oauth2Client: Auth.OAuth2Client;
  private SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret) {
      throw new Error('Google credentials missing for YouTube integration');
    }

    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }

  async getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
      prompt: 'consent',
    });
  }

  async handleCallback(code: string, creatorId: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    const people = google.people({ version: 'v1', auth: this.oauth2Client });
    const me = await people.people.get({
      resourceName: 'people/me',
      personFields: 'emailAddresses',
    });

    const email = me.data.emailAddresses?.[0].value;
    if (!email) throw new Error("Could not retrieve email");

    return prisma.ytCreator.create({
      data: {
        creatorId,
        email,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        status: "ACTIVE",
      },
    });
  }

  async getChannelInfo(id: string) {
    const creator = await prisma.ytCreator.findUnique({ where: { id } });
    if (!creator) throw new Error("Creator not found");

    this.oauth2Client.setCredentials({
      access_token: creator.accessToken,
      refresh_token: creator.refreshToken,
    });

    const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
    const res = await youtube.channels.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      mine: true,
    });

    return res.data;
  }

  async uploadVideo(id: string, file: Buffer, metadata: any) {
    const creator = await prisma.ytCreator.findUnique({ where: { id } });
    if (!creator) throw new Error("Creator not found");

    this.oauth2Client.setCredentials({
      access_token: creator.accessToken,
      refresh_token: creator.refreshToken,
    });

    const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
    const res = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags || [],
          categoryId: '22',
        },
        status: {
          privacyStatus: metadata.privacyStatus || 'private',
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: require('stream').Readable.from(file),
      },
    });

    return res.data;
  }

  async uploadFromDrive(ytCreatorId: string, driveVideoId: string, driveThumbnailId: string, metadata: any) {
    const creator = await prisma.ytCreator.findUnique({ where: { id: ytCreatorId } });
    if (!creator) throw new Error("Creator not found");

    this.oauth2Client.setCredentials({
      access_token: creator.accessToken,
      refresh_token: creator.refreshToken,
    });

    const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
    const videoStream = await driveService.getFileStream(driveVideoId);

    const uploadRes = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags || [],
          categoryId: '22',
        },
        status: {
          privacyStatus: metadata.privacyStatus || 'private',
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: videoStream,
        mimeType: 'video/mp4',
      },
    });

    const videoId = uploadRes.data.id!;
    const thumbnailStream = await driveService.getFileStream(driveThumbnailId);

    await youtube.thumbnails.set({
      videoId,
      media: { body: thumbnailStream },
    });

    return true;
  }

  // Creator management
  async getCreatorEntries(creatorId?: string, status?: string) {
    const where: any = {};
    if (creatorId) where.creatorId = creatorId;
    if (status) where.status = status;

    return prisma.ytCreator.findMany({
      where,
      select: {
        id: true,
        creatorId: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateCreatorEntry(id: string, data: { status?: string; email?: string }) {
    return prisma.ytCreator.update({
      where: { id },
      data,
    });
  }
}

export const ytIntService = new YtIntService();

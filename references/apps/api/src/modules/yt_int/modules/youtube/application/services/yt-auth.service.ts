import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Auth, google, youtube_v3 } from 'googleapis';
import { CreateEntryDto } from '../../../creator/application/dtos/create-entry.dto';
import { Inject } from '@nestjs/common';
import { YtCreatorService } from '../../../creator/application/services/yt-creator.service';
import { Readable } from 'stream';
import { UpdateEntryDto } from '../../../creator/application/dtos/update-entry.dto';
import { slugCallbackDataDto } from '../dtos/callback-slug.dto';
import { YtCreatorStatus } from '../../../creator/domain/enums/yt-creator-status.enum';
import { DriveService } from 'src/modules/media/libs/drive/application/services/drive.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class YtAuthService {
  private readonly logger = new Logger(YtAuthService.name);
  // If you want to use client secrets file, uncomment the following line
  // private readonly CLIENT_SECRETS_FILE =
  //   './src/yt_int/common/secrets/client_secret.json';
  private readonly SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];
  private oauth2Client: Auth.OAuth2Client;

  constructor(
    @Inject(YtCreatorService)
    private readonly ytCreatorService: YtCreatorService,
    private readonly driveService: DriveService,
    private readonly configService: ConfigService,
  ) {
    try {
      // If you want to use client secrets file, uncomment the following line
      // const credentials = JSON.parse(
      //   fs.readFileSync(this.CLIENT_SECRETS_FILE, 'utf8'),
      // );
      const clientId = this.configService.get('CLIENT_ID');
      const clientSecret = this.configService.get('CLIENT_SECRET');
      const redirectUri = this.configService.get('REDIRECT_URI');
      if (!clientId || !clientSecret) {
        this.logger.error(
          'CLIENT_ID or CLIENT_SECRET is not set in environment variables',
        );
        throw new InternalServerErrorException(
          'CLIENT_ID or CLIENT_SECRET is not set in environment variables',
        );
      }
      // Init client to do oauth2 flow
      this.oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri,
      );
    } catch (error) {
      // this.logger.error('Failed to initialize OAuth2 client:', error);
      throw new InternalServerErrorException(
        'Failed to initialize OAuth2 client for YouTube Channel Connecting process',
      );
    }
  }

  // Get authentication url
  async getAuthUrl(): Promise<string> {
    try {
      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: this.SCOPES,
        prompt: 'consent',
      });

      this.logger.log('Generated auth URL:', authUrl);
      return authUrl;
    } catch (error) {
      this.logger.error('Failed to generate auth URL:', error);
      throw new InternalServerErrorException(
        'Failed to generate auth URL for YouTube Channel Connecting process',
      );
    }
  }

  // Get user email
  async getUserEmail(accessToken: string): Promise<string> {
    try {
      // Set up OAuth2 client with the access token
      this.oauth2Client.setCredentials({ access_token: accessToken });

      // Create people API client
      const people = google.people({ version: 'v1', auth: this.oauth2Client });

      // Fetch user's email
      const response = await people.people.get({
        resourceName: 'people/me',
        personFields: 'emailAddresses',
      });

      if (
        !response.data.emailAddresses ||
        response.data.emailAddresses.length === 0
      ) {
        this.logger.error('No email addresses found in the user profile');
        throw new NotFoundException('No email address found for the user');
      }

      const userEmail = response.data.emailAddresses[0].value;
      this.logger.log('Retrieved user email:', userEmail);
      if (!userEmail) {
        this.logger.error('User email is empty');
        throw new NotFoundException('User email is empty');
      }
      return userEmail;
    } catch (error) {
      this.logger.error('Failed to retrieve user email:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve user email for YouTube Channel Connecting process',
      );
    }
  }

  // Handle oauth callback
  async handleOAuthCallback(
    slugCallbackData: slugCallbackDataDto,
  ): Promise<string> {
    try {
      this.logger.log(
        'debug log 15 - at ' +
          __filename.split('/').pop() +
          ' - Received OAuth code:',
        slugCallbackData,
      );
      let tokens: any;
      try {
        tokens = (await this.oauth2Client.getToken(slugCallbackData.code))
          .tokens;
      } catch (error) {
        this.logger.error('Error getting tokens:', error);
        throw new InternalServerErrorException(
          'Error getting tokens through provided code',
        );
      }
      this.logger.log(
        'debug log 16 - at ' +
          __filename.split('/').pop() +
          ' - Received OAuth tokens',
        tokens,
      );

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new UnauthorizedException('Invalid tokens');
      }

      // Get user email using access token
      const userEmail = await this.getUserEmail(tokens.access_token);

      // Save credentials to database
      try {
        const creatorDto: CreateEntryDto = {
          creatorId: slugCallbackData.creatorId,
          email: userEmail,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          status: YtCreatorStatus.ACTIVE,
        };
        this.logger.log(
          'debug log 17 - at ' + __filename.split('/').pop(),
          creatorDto,
        );
        const creator =
          await this.ytCreatorService.createCreatorEntry(creatorDto);
        return creator.id!;
      } catch (error) {
        this.logger.error('Error saving creator:', error);
        // throw new InternalServerErrorException('Error saving creator');
        throw error;
      }
    } catch (error) {
      this.logger.error('OAuth callback failed:', error);
      throw error;
    }
  }

  // Get channel info
  async getChannelInfo(id: string): Promise<any> {
    this.logger.log(
      'debug log 18 - at ' +
        __filename.split('/').pop() +
        ' - Getting channel info for creator:',
      id,
    );
    if (!id) {
      throw new UnauthorizedException('Creator ID is required');
    }
    try {
      // Get latest active creator
      const creator = await this.ytCreatorService.getCreatorEntryById(id);

      this.logger.log('Creator found - yt-auth.service.ts', creator);

      if (!creator) {
        throw new NotFoundException('No authenticated creator found');
      }

      // Set credentials
      this.logger.log(
        'OAuth2 client credentials set - yt-auth.service.ts',
        creator,
      );
      this.oauth2Client.setCredentials({
        access_token: creator.accessToken,
        refresh_token: creator.refreshToken,
      });

      try {
        const youtube = google.youtube({
          version: 'v3',
          auth: this.oauth2Client,
        });

        const response = await youtube.channels.list({
          part: ['snippet', 'contentDetails', 'statistics'],
          mine: true,
        });

        this.logger.log('Channel info:', response.data);

        return response.data;
      } catch (error) {
        this.logger.error('Failed to get channel info:', error);
        throw new InternalServerErrorException(
          'Youtube api Failed to get channel info',
        );
      }
    } catch (error) {
      this.logger.error('Failed to get channel info:', error);
      throw error;
    }
  }

  // Upload video
  async uploadVideo(
    id: string,
    videoFile: Express.Multer.File,
    metadata: {
      title: string;
      description: string;
      tags?: string[];
      privacyStatus?: 'private' | 'unlisted' | 'public';
    },
  ): Promise<any> {
    this.logger.log('Starting video upload for creator:', id);

    try {
      // Get creator credentials
      const creator = await this.ytCreatorService.getCreatorEntryById(id);

      if (!creator) {
        throw new NotFoundException('No authenticated creator found');
      }
      this.logger.log('Creator found - yt-auth.service.ts', creator);
      // Set credentials

      try {
        this.oauth2Client.setCredentials({
          access_token: creator.accessToken,
          refresh_token: creator.refreshToken,
        });
      } catch (error) {
        this.logger.error('Failed to set credentials:', error);
        throw new InternalServerErrorException(
          'Failed to set credentials to YouTube api',
        );
      }

      // Refresh token if it is expired
      if (!(await this.getTokenValidity(creator.accessToken))) {
        creator.accessToken = await this.refreshToken(creator.refreshToken);
      }

      // Update creator entry
      await this.ytCreatorService.updateCreatorEntry(creator.id!, {
        accessToken: creator.accessToken,
        refreshToken: creator.refreshToken,
      } as UpdateEntryDto);

      let youtube: youtube_v3.Youtube;
      try {
        youtube = google.youtube({
          version: 'v3',
          auth: this.oauth2Client,
        });
      } catch (error) {
        this.logger.error('Failed to start instance of youtube api:', error);
        throw new InternalServerErrorException(
          'Failed to start instance of youtube api',
        );
      }

      this.logger.log('Youtube api instance started - yt-auth.service.ts');

      // Prepare upload body
      try {
        const requestBody = {
          snippet: {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags || [],
            categoryId: '22', // Entertainment category
          },
          status: {
            privacyStatus: metadata.privacyStatus || 'private',
            selfDeclaredMadeForKids: false,
          },
        };

        // Create a readable stream from the buffer
        const readableStream = new Readable();
        readableStream.push(videoFile.buffer);
        readableStream.push(null);

        // Upload video with the stream
        const response = await youtube.videos.insert({
          part: ['snippet', 'status'],
          requestBody: requestBody,
          media: {
            body: readableStream,
          },
        });

        this.logger.log('Video uploaded successfully:', response.data);
        return response.data;
      } catch (error) {
        this.logger.error('Failed to upload video:', error);
        throw new InternalServerErrorException(
          'Failed to upload video to YouTube api',
        );
      }
    } catch (error) {
      this.logger.error('Failed to upload video:', error);
      throw error;
    }
  }

  // Get token validity
  async getTokenValidity(token: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`,
        {
          method: 'GET',
        },
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      this.logger.log('Token validity:', data);
      return data.expires_in > 0;
    } catch (error) {
      this.logger.error('Failed to get token validity:', error);
      return false;
    }
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<string> {
    try {
      // Set the refresh token
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      // Get a new access token
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.logger.log('Token refreshed successfully');

      // If access_token is not set, throw an error
      if (!credentials.access_token) {
        throw new InternalServerErrorException(
          'Failed to refresh token for YouTube Channel Connecting process',
        );
      }

      // Return the new access token
      return credentials.access_token;
    } catch (error) {
      this.logger.error('Failed to refresh token:', error);
      throw new InternalServerErrorException('Failed to refresh token');
    }
  }

  // Upload video to youtube through contribution
  async uploadVideoThroughContribution(
    ytCreatorId: string,
    driveVideoId: string,
    driveThumbnailId: string,
    title: string,
    description: string,
    tags: string[],
    privacyStatus: 'private' | 'unlisted' | 'public',
  ): Promise<boolean> {
    try {
      // console.log('2. uploadVideoThroughContribution');
      // console.log('2.1 ytCreatorId', ytCreatorId);
      const creator =
        await this.ytCreatorService.getCreatorEntryById(ytCreatorId);
      if (!creator) {
        console.log('2.2 creator not found');
        throw new NotFoundException('No authenticated creator found');
      }
      console.log('2.3 creator found', creator);
      this.oauth2Client.setCredentials({
        access_token: creator.accessToken,
        refresh_token: creator.refreshToken,
      });
      console.log('2.4 credentials set', this.oauth2Client.getAccessToken());
      if (!(await this.getTokenValidity(creator.accessToken))) {
        creator.accessToken = await this.refreshToken(creator.refreshToken);
      }
      await this.ytCreatorService.updateCreatorEntry(creator.id!, {
        accessToken: creator.accessToken,
        refreshToken: creator.refreshToken,
      } as UpdateEntryDto);
      const youtube = google.youtube({
        version: 'v3',
        auth: this.oauth2Client,
      });
      console.log('2.5 youtube instance started');
      // Video upload
      const videoStream = await this.driveService.getFileStream(driveVideoId);
      console.log('2.6 video stream fetched');
      if (!videoStream || typeof videoStream.pipe !== 'function') {
        throw new InternalServerErrorException(
          'Retrieved video stream is not a readable stream',
        );
      }
      const uploadRes = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: { title, description, tags, categoryId: '22' },
          status: { privacyStatus, selfDeclaredMadeForKids: false },
        },
        media: { body: videoStream, mimeType: 'video/mp4' },
      });
      console.log('2.7 video uploaded');
      const videoId = uploadRes.data.id!;
      if (!videoId) {
        console.log('2.8 video id not found');
        return false;
      }
      console.log('2.9 video id found');
      // Thumbnail upload
      const thumbnailStream =
        await this.driveService.getFileStream(driveThumbnailId);
      console.log('2.10 thumbnail stream fetched');
      await youtube.thumbnails.set({
        videoId,
        media: { body: thumbnailStream },
      });
      console.log('2.11 thumbnail uploaded');
      return true;
    } catch (error) {
      this.logger.error('Failed to upload video through contribution:', error);
      // console.log('2.12 failed to upload video through contribution');
      return false;
    }
  }
}

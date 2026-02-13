# Google Drive Resumable Upload Implementation

## Overview
The Drive library now supports **resumable uploads with chunk-wise processing** for better reliability and large file handling.

## Key Features

### ✅ Resumable Uploads
- Uses Google Drive API v3 resumable upload protocol
- Automatically handles network interruptions and retries
- Progress tracking with detailed logging

### ✅ Chunk-wise Processing  
- **256KB chunks** for optimal performance
- Smart chunking: single request for files < 5MB, chunked for larger files
- Resume capability from last uploaded chunk

### ✅ Enhanced Error Handling
- Automatic retry on network failures
- Upload status checking and resumption
- Graceful permission setting (non-blocking)

## API Endpoints

### File Uploads
- `POST /drive/upload-image` - Upload images with resumable upload
- `POST /drive/upload-video` - Upload videos with resumable upload

### Folder Management  
- `POST /drive/create-folder/:folderName` - Create folders (equivalent to buckets)
- `GET /drive/is-folder-exists/:folderName` - Check folder existence

## Environment Variables Required
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret  
GOOGLE_REDIRECT_URI=your_google_redirect_uri
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
```

## Implementation Details

### Upload Process
1. **Initialize**: Create resumable upload session with metadata
2. **Upload**: Process file in 256KB chunks with progress tracking
3. **Resume**: Automatically handle interruptions and resume from last chunk
4. **Complete**: Set permissions and return file URL/ID

### Technical Specifications
- **Chunk Size**: 256KB (configurable)
- **Max File Size**: No limit (handled by chunks)
- **Upload Type**: `uploadType=resumable` for all files
- **Progress Tracking**: Percentage and bytes uploaded logged
- **Authentication**: OAuth2 with refresh token

### Error Recovery
- Network failures: Automatic resume from last successful chunk
- Status checking: Query upload progress for interrupted uploads  
- Retry logic: Built-in retry mechanism for failed chunks

## Benefits Over Previous Implementation
- ✅ **Large file support**: No 5MB limit restriction
- ✅ **Network resilience**: Handles unstable connections  
- ✅ **Progress visibility**: Real-time upload progress logging
- ✅ **Better performance**: Optimized chunking strategy
- ✅ **Production ready**: Robust error handling and recovery

## Usage Example
```typescript
// Upload with automatic chunking and resumable capability
const result = await driveService.uploadFile({
  file: multerFile,
  folderName: 'my-uploads',
  folder: 'subfolder/path', // optional
  fileName: 'custom-name.jpg' // optional
});
// Returns: { url: 'drive_url', fileId: 'drive_file_id' }
```

The implementation follows the same patterns as S3 and GCP-bucket modules while providing superior upload reliability and performance through Google Drive's resumable upload protocol.
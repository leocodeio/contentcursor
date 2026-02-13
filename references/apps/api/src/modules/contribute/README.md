# Contribute Module - Remix SSR Frontend Integration Guide

## Overview

The Contribute module allows editors to upload video contributions with thumbnails using Remix's server-side architecture. The frontend sends form data to Remix actions, which then make API calls to the backend using `.server` files. This supports resumable uploads with pause/resume functionality through progressive enhancement.

## Architecture Flow

```
Frontend Form → Remix Action → .server File → Backend API → Google Drive
```

## Backend API Endpoints

### 1. Create Contribution
**POST** `/v1.0/contributions`

#### Headers
```http
Authorization: Bearer <token>
x-api-key: <api-key>
Content-Type: multipart/form-data
```

#### Request Body (Form Data)
```typescript
interface CreateContributionRequest {
  video: File;           // Video file (required)
  thumbnail: File;       // Thumbnail image (required)
  accountId: string;     // Account ID (required)
  title: string;         // Video title (required)
  description: string;   // Video description (required)
  tags: string;         // Comma-separated tags (required)
}
```

#### Response
```typescript
interface ContributionResponse {
  id: string;
  accountId: string;
  editorId: string;
  videoId: string;
  thumbnailId: string;
  title: string;
  description: string;
  tags: string[];
  duration: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}
```

### 2. Other Endpoints
- **GET** `/v1.0/contributions/account/:accountId` - Get contributions by account
- **PUT** `/v1.0/contributions/:id/status` - Update contribution status
- **GET** `/v1.0/contributions/:id` - Get contribution by ID

## Remix Implementation

### 1. Server-Side Service (contribute.server.ts)

First, create the server-side service following your existing pattern:

```typescript
// app/server/services/editor/contribute.server.ts
import { ActionResult } from "~/types/action-result";
import { makeApiRequest } from "../common/common.server";
import { getAccessToken } from "../auth/db.server";
import { xDomainContribute } from "@spectral/types";

const contributeEndpoints = {
  createContribution: {
    url: "/contributions",
    method: "POST",
  },
  getContributionsByAccount: {
    url: "/contributions/account/:accountId",
    method: "GET",
  },
  updateContributionStatus: {
    url: "/contributions/:id/status",
    method: "PUT",
  },
  getContributionById: {
    url: "/contributions/:id",
    method: "GET",
  },
};

// Create Contribution
export const createContribution = async (
  request: Request,
  formData: FormData
): Promise<ActionResult<xDomainContribute>> => {
  try {
    const response = await makeApiRequestWithFiles(
      contributeEndpoints.createContribution.url,
      {
        method: contributeEndpoints.createContribution.method,
        access_token: await getAccessToken(request),
        request: request,
        formData: formData,
      }
    );

    if (response?.status === 401 || response?.status === 403) {
      return {
        success: false,
        origin: "contribute",
        message: "Failed to create contribution due to invalid authorization",
        data: null,
      };
    } else if (response?.status === 400) {
      return {
        success: false,
        origin: "contribute",
        message: "Failed to create contribution due to invalid request",
        data: null,
      };
    } else if (response?.status === 500) {
      return {
        success: false,
        origin: "contribute",
        message: "Failed to create contribution due to backend server error",
        data: null,
      };
    }

    const responseData = await response?.json();
    const result: ActionResult<xDomainContribute> = {
      success: true,
      origin: "contribute",
      message: "Contribution created successfully",
      data: responseData,
    };
    return result;
  } catch (error) {
    console.error("Error creating contribution:", error);
    return {
      success: false,
      origin: "contribute",
      message: "Failed to create contribution",
      data: null,
    };
  }
};

// Get Contributions by Account
export const getContributionsByAccount = async (
  request: Request,
  accountId: string
): Promise<ActionResult<xDomainContribute[]>> => {
  const response = await makeApiRequest<any, any>(
    contributeEndpoints.getContributionsByAccount.url,
    {
      method: contributeEndpoints.getContributionsByAccount.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        accountId: accountId,
      },
    }
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "contribute",
      message: "Failed to get contributions due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "contribute",
      message: "Contributions not found",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "contribute",
      message: "Failed to get contributions due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainContribute[]> = {
    success: true,
    origin: "contribute",
    message: "Contributions retrieved successfully",
    data: responseData,
  };
  return result;
};

// Update Contribution Status
export const updateContributionStatus = async (
  request: Request,
  contributionId: string,
  status: string
): Promise<ActionResult<xDomainContribute>> => {
  const response = await makeApiRequest<any, any>(
    contributeEndpoints.updateContributionStatus.url,
    {
      method: contributeEndpoints.updateContributionStatus.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        id: contributionId,
      },
      body: { status },
    }
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "contribute",
      message: "Failed to update contribution status due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "contribute",
      message: "Contribution not found",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "contribute",
      message: "Failed to update contribution status due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainContribute> = {
    success: true,
    origin: "contribute",
    message: "Contribution status updated successfully",
    data: responseData,
  };
  return result;
};

// Helper function for multipart form data requests
async function makeApiRequestWithFiles(
  endpoint: string,
  options: {
    method: string;
    request: Request;
    access_token?: string;
    formData: FormData;
    pathParams?: Record<string, string>;
  }
): Promise<Response | undefined> {
  const { access_token, method, request, formData, pathParams } = options;
  
  // Replace path parameters if any
  let url = endpoint;
  if (pathParams) {
    Object.entries(pathParams).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }

  const fullUrl = `${process.env.BACKEND_API_URL}/${process.env.BACKEND_VERSION}${url}`;
  
  try {
    const response = await fetch(fullUrl, {
      method,
      headers: {
        ...(access_token && { Authorization: `Bearer ${access_token}` }),
        "x-api-key": process.env.BACKEND_API_KEY as string,
        "x-correlation-id": "FRONTEND-CORRELATION-ID",
        // Don't set Content-Type for FormData - let fetch set it automatically
      },
      body: formData,
    });
    
    return response;
  } catch (error) {
    console.error(`Error in API request to ${endpoint}:`, error);
    throw error;
  }
}

export interface CreateContributionDto {
  accountId: string;
  title: string;
  description: string;
  tags: string;
}
```

### 2. Remix Action (create-contribution.action.ts)

```typescript
// app/routes/action+/feature+/editor+/contribute+/create-contribution.action.ts
import { ActionFunctionArgs, json } from "@remix-run/node";
import { createContribution } from "~/server/services/editor/contribute.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  
  // Validate required fields
  const video = formData.get("video") as File;
  const thumbnail = formData.get("thumbnail") as File;
  const accountId = formData.get("accountId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const tags = formData.get("tags") as string;

  if (
    !video ||
    !thumbnail ||
    !accountId ||
    !title ||
    !description ||
    !tags
  ) {
    return json({
      success: false,
      message: "All fields are required",
      data: null,
    });
  }

  // Validate file types
  if (!video.type.startsWith("video/")) {
    return json({
      success: false,
      message: "Invalid video file type",
      data: null,
    });
  }

  if (!thumbnail.type.startsWith("image/")) {
    return json({
      success: false,
      message: "Invalid thumbnail file type",
      data: null,
    });
  }

  // Validate file sizes (example: 500MB for video, 5MB for thumbnail)
  if (video.size > 500 * 1024 * 1024) {
    return json({
      success: false,
      message: "Video file too large (max 500MB)",
      data: null,
    });
  }

  if (thumbnail.size > 5 * 1024 * 1024) {
    return json({
      success: false,
      message: "Thumbnail file too large (max 5MB)",
      data: null,
    });
  }

  try {
    const result = await createContribution(request, formData);
    return json(result);
  } catch (error) {
    console.error("Error in create contribution action:", error);
    return json({
      success: false,
      message: "Failed to create contribution",
      data: null,
    });
  }
};
```

### 3. Frontend Component with Progressive Enhancement

```typescript
// app/routes/feature+/editor+/contributions+/create.tsx
import { 
  Form, 
  useActionData, 
  useNavigation, 
  useFetcher 
} from "@remix-run/react";
import { useState, useRef, useEffect } from "react";
import { ActionResult } from "~/types/action-result";
import { xDomainContribute } from "@spectral/types";

export default function CreateContribution() {
  const actionData = useActionData<ActionResult<xDomainContribute>>();
  const navigation = useNavigation();
  const fetcher = useFetcher<ActionResult<xDomainContribute>>();
  
  const [uploadProgress, setUploadProgress] = useState<{
    loaded: number;
    total: number;
    percentage: number;
  } | null>(null);
  
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'paused' | 'completed' | 'error'
  >('idle');
  
  const formRef = useRef<HTMLFormElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const isSubmitting = navigation.state === "submitting" || 
                     fetcher.state === "submitting";

  // Enhanced upload with progress tracking
  const handleEnhancedSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formRef.current) return;
    
    const formData = new FormData(formRef.current);
    
    // Validate files
    const video = formData.get("video") as File;
    const thumbnail = formData.get("thumbnail") as File;
    
    if (!video || !thumbnail) {
      alert("Please select both video and thumbnail files");
      return;
    }
    
    setUploadStatus('uploading');
    setUploadProgress({ loaded: 0, total: video.size + thumbnail.size, percentage: 0 });
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    
    try {
      // Enhanced fetch with progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          };
          setUploadProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadStatus('completed');
          const response = JSON.parse(xhr.responseText);
          // Handle success response
          console.log('Upload successful:', response);
        } else {
          setUploadStatus('error');
          console.error('Upload failed:', xhr.statusText);
        }
      });
      
      xhr.addEventListener('error', () => {
        setUploadStatus('error');
        console.error('Upload failed');
      });
      
      xhr.addEventListener('abort', () => {
        setUploadStatus('paused');
        console.log('Upload paused');
      });
      
      xhr.open('POST', '/action/feature/editor/contribute/create-contribution');
      xhr.send(formData);
      
    } catch (error) {
      setUploadStatus('error');
      console.error('Upload error:', error);
    }
  };
  
  const handlePause = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setUploadStatus('paused');
    }
  };
  
  const handleResume = () => {
    if (formRef.current) {
      handleEnhancedSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>);
    }
  };
  
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setUploadStatus('idle');
    setUploadProgress(null);
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  return (
    <div className="contribution-upload">
      <h1>Create Contribution</h1>
      
      {/* Progressive Enhancement: Works without JS */}
      <Form 
        ref={formRef}
        method="post" 
        action="/action/feature/editor/contribute/create-contribution"
        encType="multipart/form-data"
        onSubmit={handleEnhancedSubmit}
      >
        <div className="form-group">
          <label htmlFor="video">Video File *</label>
          <input
            type="file"
            id="video"
            name="video"
            accept="video/*"
            required
            disabled={uploadStatus === 'uploading'}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="thumbnail">Thumbnail *</label>
          <input
            type="file"
            id="thumbnail"
            name="thumbnail"
            accept="image/*"
            required
            disabled={uploadStatus === 'uploading'}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="accountId">Account ID *</label>
          <input
            type="text"
            id="accountId"
            name="accountId"
            required
            disabled={uploadStatus === 'uploading'}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            disabled={uploadStatus === 'uploading'}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            required
            disabled={uploadStatus === 'uploading'}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated) *</label>
          <input
            type="text"
            id="tags"
            name="tags"
            placeholder="gaming,montage,entertainment"
            required
            disabled={uploadStatus === 'uploading'}
          />
        </div>
        
        {/* Upload Controls */}
        <div className="upload-controls">
          {uploadStatus === 'idle' && (
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Uploading...' : 'Upload Contribution'}
            </button>
          )}
          
          {uploadStatus === 'uploading' && (
            <>
              <button 
                type="button" 
                onClick={handlePause}
                className="btn-secondary"
              >
                Pause
              </button>
              <button 
                type="button" 
                onClick={handleCancel}
                className="btn-danger"
              >
                Cancel
              </button>
            </>
          )}
          
          {uploadStatus === 'paused' && (
            <>
              <button 
                type="button" 
                onClick={handleResume}
                className="btn-primary"
              >
                Resume
              </button>
              <button 
                type="button" 
                onClick={handleCancel}
                className="btn-danger"
              >
                Cancel
              </button>
            </>
          )}
        </div>
        
        {/* Progress Bar */}
        {uploadProgress && (
          <div className="progress-container">
            <div className="progress-text">
              {uploadProgress.percentage}% 
              ({formatBytes(uploadProgress.loaded)} / {formatBytes(uploadProgress.total)})
            </div>
            <div className="progress-bar">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${uploadProgress.percentage}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Status Messages */}
        {actionData && !actionData.success && (
          <div className="error-message">
            {actionData.message}
          </div>
        )}
        
        {actionData?.success && (
          <div className="success-message">
            Contribution created successfully!
          </div>
        )}
        
        {uploadStatus === 'completed' && (
          <div className="success-message">
            Upload completed successfully!
          </div>
        )}
        
        {uploadStatus === 'error' && (
          <div className="error-message">
            Upload failed. Please try again.
          </div>
        )}
      </Form>
    </div>
  );
}

// Helper function
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
```

### 4. Custom Hook for Upload Management (Optional Enhancement)

```typescript
// app/hooks/useContributionUpload.ts
import { useFetcher } from "@remix-run/react";
import { useState, useRef } from "react";
import { ActionResult } from "~/types/action-result";
import { xDomainContribute } from "@spectral/types";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function useContributionUpload() {
  const fetcher = useFetcher<ActionResult<xDomainContribute>>();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'paused' | 'completed' | 'error'
  >('idle');
  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadContribution = async (formData: FormData) => {
    setUploadStatus('uploading');
    abortControllerRef.current = new AbortController();

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          };
          setUploadProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadStatus('completed');
        } else {
          setUploadStatus('error');
        }
      });
      
      xhr.addEventListener('error', () => {
        setUploadStatus('error');
      });
      
      xhr.addEventListener('abort', () => {
        setUploadStatus('paused');
      });
      
      xhr.open('POST', '/action/feature/editor/contribute/create-contribution');
      xhr.send(formData);
      
    } catch (error) {
      setUploadStatus('error');
      console.error('Upload error:', error);
    }
  };

  const pauseUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setUploadStatus('paused');
    }
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setUploadStatus('idle');
    setUploadProgress(null);
  };

  return {
    uploadProgress,
    uploadStatus,
    uploadContribution,
    pauseUpload,
    cancelUpload,
    isUploading: uploadStatus === 'uploading',
    isCompleted: uploadStatus === 'completed',
    hasError: uploadStatus === 'error',
  };
}
```

### 5. List Contributions Route

```typescript
// app/routes/feature+/editor+/contributions+/account.$accountId.tsx
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getContributionsByAccount } from "~/server/services/editor/contribute.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { accountId } = params;
  
  if (!accountId) {
    throw new Response("Account ID is required", { status: 400 });
  }

  const result = await getContributionsByAccount(request, accountId);
  return json(result);
};

export default function AccountContributions() {
  const data = useLoaderData<typeof loader>();

  if (!data.success) {
    return (
      <div className="error-container">
        <h1>Error</h1>
        <p>{data.message}</p>
      </div>
    );
  }

  return (
    <div className="contributions-list">
      <h1>Contributions</h1>
      
      {data.data && data.data.length > 0 ? (
        <div className="contributions-grid">
          {data.data.map((contribution) => (
            <div key={contribution.id} className="contribution-card">
              <h3>{contribution.title}</h3>
              <p>{contribution.description}</p>
              <div className="contribution-meta">
                <span>Status: {contribution.status}</span>
                <span>Duration: {contribution.duration}s</span>
                <span>Tags: {contribution.tags.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No contributions found for this account.</p>
      )}
    </div>
  );
}
```

## Key Features

### 1. **Progressive Enhancement**
- Works without JavaScript (basic form submission)
- Enhanced with JavaScript for better UX (progress tracking, pause/resume)

### 2. **Server-Side Processing**
- All API calls happen on the server via `.server` files
- Follows your existing pattern with `makeApiRequest`
- Proper error handling and response formatting

### 3. **File Upload Handling**
- Multipart form data support
- File validation (type, size)
- Progress tracking with XMLHttpRequest

### 4. **Pause/Resume Functionality**
- Uses AbortController for cancellation
- Progress persistence (can be extended with localStorage)
- Resumable upload state management

### 5. **Error Handling**
- Server-side validation
- Client-side file validation
- Network error handling
- User-friendly error messages

## File Structure

```
app/
├── routes/
│   ├── action+/
│   │   └── feature+/
│   │       └── editor+/
│   │           └── contribute+/
│   │               ├── create-contribution.action.ts
│   │               └── update-status.action.ts
│   └── feature+/
│       └── editor+/
│           └── contributions+/
│               ├── create.tsx
│               ├── account.$accountId.tsx
│               └── $id.tsx
├── server/
│   └── services/
│       └── editor/
│           └── contribute.server.ts
└── hooks/
    └── useContributionUpload.ts
```

## Best Practices

### 1. **File Validation**
```typescript
// Server-side validation in action
const video = formData.get("video") as File;
if (!video.type.startsWith("video/")) {
  return json({ success: false, message: "Invalid video file type" });
}
```

### 2. **Progress Persistence**
```typescript
// Save progress to localStorage for resume capability
const saveProgress = (progress: UploadProgress) => {
  localStorage.setItem('upload-progress', JSON.stringify(progress));
};
```

### 3. **Error Boundaries**
```typescript
// app/routes/feature+/editor+/contributions+/create.tsx
export function ErrorBoundary() {
  return (
    <div className="error-container">
      <h1>Upload Error</h1>
      <p>Something went wrong with the upload. Please try again.</p>
    </div>
  );
}
```

## Security Considerations

1. **Server-side validation** - All validation happens on the server
2. **File type checking** - Both client and server validate file types
3. **Size limits** - Enforce reasonable file size limits
4. **Authentication** - Access tokens handled securely on server
5. **CSRF protection** - Remix provides built-in CSRF protection

## Testing

```typescript
// Test the server service
import { createContribution } from "~/server/services/editor/contribute.server";

test("should create contribution successfully", async () => {
  const mockRequest = new Request("http://localhost");
  const mockFormData = new FormData();
  // Add test data
  
  const result = await createContribution(mockRequest, mockFormData);
  expect(result.success).toBe(true);
});
```

This implementation provides a complete Remix SSR solution for contribution uploads with resumable functionality, following your existing architecture patterns.
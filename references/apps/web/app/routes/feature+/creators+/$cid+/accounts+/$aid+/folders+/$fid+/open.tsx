import {
  Link,
  useLoaderData,
  useActionData,
  Form,
  useNavigation,
} from "@remix-run/react";
import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getSession } from "~/server/services/auth/db.server";
import {
  getFolderItems,
  uploadMediaToFolder,
} from "~/server/services/creator/folder.server";
import { CommonSubHeader } from "~/components/common/CommonSubHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Folder,
  Image,
  Video,
  FileText,
  ArrowLeft,
  Plus,
  Upload,
  Loader2,
  Download,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { toast } from "~/hooks/use-toast";

import { useState, useCallback, useEffect } from "react";
import { xDomainFolderItem, xDomainMedia } from "@spectral/types";

const determineFileType = (file: File): string => {
  const mimeType = file.type.toLowerCase();

  if (mimeType.startsWith("image/")) {
    return "IMAGE";
  } else if (mimeType.startsWith("video/")) {
    return "VIDEO";
  } else {
    // Default to IMAGE for now since schema only has IMAGE and VIDEO
    return "IMAGE";
  }
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const session = await getSession(request);
  if (!session) {
    return redirect("/");
  }

  const { fid, aid } = params;
  if (!fid) {
    return json({ error: "Folder ID is required" }, { status: 400 });
  }
  if (!aid) {
    return json({ error: "Account ID is required" }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return json({ error: "Please select a file to upload" }, { status: 400 });
  }

  // Automatically determine file type based on MIME type
  const type = determineFileType(file);

  // Create new FormData for the API request
  const uploadFormData = new FormData();
  uploadFormData.append("file", file);
  uploadFormData.append("type", type);

  const result = await uploadMediaToFolder(request, fid, aid, uploadFormData);

  if (!result.success) {
    return json({ error: result.message }, { status: 400 });
  }

  return json({
    success: true,
    message: "Media uploaded to folder successfully",
  });
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const session = await getSession(request);
  if (!session) {
    return redirect("/");
  }

  const userName = session?.user?.name || "";
  const role = session?.user?.role || "";
  const { aid, fid, cid } = params;

  if (!fid) {
    throw new Response("Folder ID is required", { status: 400 });
  }

  const getFolderItemsResult = await getFolderItems(request, fid);
  console.log("getFolderItemsResult", JSON.stringify(getFolderItemsResult));
  if (!getFolderItemsResult.success) {
    throw new Response("Failed to load folder items", { status: 500 });
  }

  return {
    userName,
    role,
    accountId: aid!,
    folderId: fid,
    folderItems: getFolderItemsResult.data || [],
    cid: cid!,
  };
};

export default function OpenFolder() {
  const data = useLoaderData<typeof loader>();
  // console.log("data", data);
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { userName, role, accountId, folderId: fid, folderItems, cid } = data;

  const [showAddMedia, setShowAddMedia] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const isSubmitting = navigation.state === "submitting";

  // Handle action data with useEffect and toast
  useEffect(() => {
    if (!actionData) return;

    if ("error" in actionData) {
      toast({
        title: "Upload Failed",
        description: actionData.error,
        variant: "destructive",
      });
    } else if ("success" in actionData && actionData.success) {
      toast({
        title: "Upload Successful",
        description: actionData.message,
      });
      // Reset form on success
      resetForm();
    }
  }, [actionData]);

  const getMediaPreview = (media: xDomainMedia) => {
    console.log("media", media);
    if (!media?.integrationUrl) return null;
    return (
      <div className="w-full">
        <iframe
          src={media.integrationUrl.replace("view", "preview")}
          width="100%"
          height="80"
          allow="autoplay"
          className="rounded-md"
        ></iframe>
      </div>
    );
  };

  const getMediaIcon = (item: xDomainFolderItem) => {
    const mediaType = item.media?.type;

    switch (mediaType) {
      case "IMAGE":
        return <Image className="h-6 w-6 text-blue-500" />;
      case "VIDEO":
        return <Video className="h-6 w-6 text-green-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onSelectFile(file);
    }
  };

  const onSelectFile = useCallback((file: File) => {
    setSelectedFile(file);

    // Create preview for images and videos
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    onSelectFile(file);
  };

  const prevent = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle client-side download
  // const handleDownload = async (media: xDomainMedia, mediaId: string) => {
  //   if (!media.integrationUrl) {
  //     toast({
  //       title: "Download Failed",
  //       description: "No download URL available for this media",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   try {
  //     // Convert Google Drive view URL to direct download URL
  //     let downloadUrl = media.integrationUrl;

  //     // Handle different Google Drive URL formats
  //     if (downloadUrl.includes("drive.google.com/file/d/")) {
  //       const fileId = downloadUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
  //       if (fileId) {
  //         downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  //       }
  //     } else if (downloadUrl.includes("/view")) {
  //       downloadUrl = downloadUrl.replace("/view", "/export?format=pdf");
  //     }

  //     // Fetch the file
  //     const response = await fetch(downloadUrl);
  //     if (!response.ok) {
  //       throw new Error(`Download failed: ${response.statusText}`);
  //     }

  //     // Get the blob
  //     const blob = await response.blob();

  //     // Create download link
  //     const url = window.URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = url;

  //     // Generate filename based on media type and ID
  //     const extension = media.type === "VIDEO" ? "mp4" : "jpg";
  //     link.download = `media_${mediaId}.${extension}`;

  //     // Trigger download
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);

  //     // Cleanup
  //     window.URL.revokeObjectURL(url);

  //     toast({
  //       title: "Download Started",
  //       description: "Your file download has begun",
  //     });
  //   } catch (error) {
  //     console.error("Download failed:", error);
  //     toast({
  //       title: "Download Failed",
  //       description: "Failed to download the file. Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const resetForm = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setShowAddMedia(false);
    // Reset file input
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="h-fit w-full p-3">
      <CommonSubHeader userName={userName} role={role} variant="default" />
      {/* Navigation */}
      <div className="flex items-center gap-2 my-2">
        <Button variant="ghost">
          <Link
            to={`/feature/creators/${cid}/accounts/${accountId}/folders`}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <Label className="text-base font-medium">Back to Account</Label>
          </Link>
        </Button>
      </div>
      <div className="my-6">
        <CommonSubHeader
          userName="Folder Media"
          role={`Viewing media in folder ${fid}`}
          variant="default"
        />

        <div className="max-w-6xl mx-auto mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Folder className="h-5 w-5" />
                    <span>Media Items</span>
                  </CardTitle>
                  <CardDescription>
                    All media files in this folder ({folderItems.length} items)
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowAddMedia(!showAddMedia)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Upload Media</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Upload Media Form */}
              {showAddMedia && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Upload className="h-5 w-5" />
                      <span>Upload Media to Folder</span>
                    </CardTitle>
                    <CardDescription>
                      Select a file to upload and it will be automatically added
                      to this folder. File type will be detected automatically.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form
                      method="post"
                      encType="multipart/form-data"
                      className="space-y-4"
                    >
                      {/* Drag & Drop File Upload */}
                      <div>
                        <Label htmlFor="file">Select File</Label>
                        <Card
                          onDrop={handleDrop}
                          onDragOver={prevent}
                          onDragEnter={prevent}
                          className="border-dashed mt-2"
                        >
                          <div
                            className="group relative flex flex-col items-center justify-center w-full h-48 rounded-md border border-dashed bg-muted/30 hover:bg-muted/40 transition cursor-pointer text-muted-foreground"
                            onClick={() =>
                              document
                                .querySelector<HTMLInputElement>("#file")
                                ?.click()
                            }
                          >
                            {filePreview ? (
                              <>
                                {selectedFile?.type.startsWith("image/") ? (
                                  <img
                                    src={filePreview}
                                    alt="Preview"
                                    className="max-h-40 object-contain rounded-md"
                                  />
                                ) : selectedFile?.type.startsWith("video/") ? (
                                  <video
                                    src={filePreview}
                                    controls
                                    className="max-h-40 object-contain rounded-md"
                                  />
                                ) : null}
                              </>
                            ) : (
                              <>
                                <Upload className="w-10 h-10 mb-4 opacity-70" />
                                <p className="font-medium">
                                  Drop your file here
                                </p>
                                <p className="text-xs mt-1">
                                  or click to browse files
                                </p>
                                <p className="text-[10px] mt-2 opacity-70">
                                  Images, Videos, Audio, Documents
                                </p>
                              </>
                            )}
                            <Input
                              id="file"
                              name="file"
                              type="file"
                              accept="image/*,video/*,audio/*"
                              onChange={handleFileChange}
                              disabled={isSubmitting}
                              className="hidden"
                              required
                            />
                          </div>
                        </Card>
                        {selectedFile && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Selected: {selectedFile.name} (
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={!selectedFile || isSubmitting}
                          className="flex items-center space-x-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              <span>Upload Media</span>
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetForm}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {folderItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No media items found in this folder
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {folderItems.map((item) => (
                    <Card
                      key={item.id}
                      className="hover:shadow-lg transition-all duration-200 h-32 group cursor-pointer"
                    >
                      <CardContent className="p-4 h-full flex flex-col">
                        {/* Media Preview */}
                        {item.media.integrationUrl && (
                          <div className="mb-3">
                            {getMediaPreview(item.media)}
                          </div>
                        )}

                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 p-2 bg-muted/50 rounded-lg group-hover:bg-muted/70 transition-colors">
                            {getMediaIcon(item)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate mb-1">
                              Media ID: {item.mediaId}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              Type: {item.media?.type || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              ID: {item.id}
                            </p>
                          </div>
                          {/* <div className="flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(item.media, item.mediaId);
                              }}
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div> */}
                        </div>
                        <div className="mt-2 pt-2 border-t border-muted/30">
                          <p className="text-xs text-muted-foreground">
                            Click to view details
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

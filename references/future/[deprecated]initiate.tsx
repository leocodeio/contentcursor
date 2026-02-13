// import {
//   ActionFunctionArgs,
//   LoaderFunctionArgs,
//   redirect,
// } from "@remix-run/node";
// import { Form, Link, useActionData } from "@remix-run/react";
// import { useEffect, useRef, useState, useCallback } from "react";
// import { CommonSubHeader } from "~/components/common/CommonSubHeader";
// import { Button } from "~/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "~/components/ui/card";
// import { Input } from "~/components/ui/input";
// import { Label } from "~/components/ui/label";
// import { getSession } from "~/server/services/auth/db.server";
// import { toast } from "~/hooks/use-toast";
// import { createContribution } from "~/server/services/editor/contribute.server";
// import type { ActionResult } from "~/types/action-result";
// import type { xDomainContribute } from "@spectral/types";
// import {
//   ArrowLeft,
//   Upload,
//   Pause,
//   Play,
//   X,
//   Image as ImageIcon,
//   Video,
//   Tags,
//   Info,
// } from "lucide-react";
// import { FutureFeature } from "~/components/common/utils/futureFeature";

// export const loader = async ({ request, params }: LoaderFunctionArgs) => {
//   const session = await getSession(request);
//   if (!session) return redirect("/");

//   const { aid } = params;
//   if (!aid) throw new Response("Account ID is required", { status: 400 });

//   return {
//     userName: session.user?.name || "",
//     role: session.user?.role || "",
//     accountId: aid,
//   };
// };

// export const action = async ({ request, params }: ActionFunctionArgs) => {
//   const session = await getSession(request);
//   if (!session) return redirect("/");

//   const { aid } = params;
//   if (!aid) {
//     return {
//       success: false,
//       origin: "contribute",
//       message: "Account ID is required",
//       data: null,
//     } satisfies ActionResult<null>;
//   }

//   const formData = await request.formData();
//   // Ensure accountId comes from the route param
//   formData.set("accountId", aid);

//   const video = formData.get("video") as File | null;
//   const thumbnail = formData.get("thumbnail") as File | null;
//   const title = (formData.get("title") as string) || "";
//   const description = (formData.get("description") as string) || "";
//   const tags = (formData.get("tags") as string) || "";

//   if (!video || !thumbnail || !title || !description || !tags) {
//     return {
//       success: false,
//       origin: "contribute",
//       message: "All fields are required",
//       data: null,
//     } satisfies ActionResult<null>;
//   }

//   if (!video.type?.startsWith("video/")) {
//     return {
//       success: false,
//       origin: "contribute",
//       message: "Invalid video file type",
//       data: null,
//     } satisfies ActionResult<null>;
//   }

//   if (!thumbnail.type?.startsWith("image/")) {
//     return {
//       success: false,
//       origin: "contribute",
//       message: "Invalid thumbnail file type",
//       data: null,
//     } satisfies ActionResult<null>;
//   }

//   if (video.size > 500 * 1024 * 1024) {
//     return {
//       success: false,
//       origin: "contribute",
//       message: "Video file too large (max 500MB)",
//       data: null,
//     } satisfies ActionResult<null>;
//   }

//   if (thumbnail.size > 5 * 1024 * 1024) {
//     return {
//       success: false,
//       origin: "contribute",
//       message: "Thumbnail file too large (max 5MB)",
//       data: null,
//     } satisfies ActionResult<null>;
//   }

//   const result = await createContribution(request, formData);

//   if (result.success) {
//     return redirect("../");
//   }

//   return result;
// };

// export default function InitiateContribution() {
//   const actionData = useActionData<ActionResult<xDomainContribute>>();

//   const formRef = useRef<HTMLFormElement>(null);
//   const xhrRef = useRef<XMLHttpRequest | null>(null);

//   const [uploadStatus, setUploadStatus] = useState<
//     "idle" | "uploading" | "paused" | "completed" | "error" | "processing"
//   >("idle");
//   const [progress, setProgress] = useState<{
//     loaded: number;
//     total: number;
//     percentage: number;
//   } | null>(null);

//   const [videoPreview, setVideoPreview] = useState<string | null>(null);
//   const [thumbPreview, setThumbPreview] = useState<string | null>(null);
//   const [tags, setTags] = useState<string[]>([]);
//   const [tagInput, setTagInput] = useState("");

//   useEffect(() => {
//     if (!actionData) return;
//     console.log(actionData.data);
//     toast({ title: actionData.origin, description: actionData.message });
//   }, [actionData]);

//   const handleTagsKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
//       e.preventDefault();
//       addTag();
//     }
//   };
//   const addTag = () => {
//     const val = tagInput.trim();
//     if (!val) return;
//     if (tags.length >= 10) {
//       toast({ title: "Tags", description: "Maximum 10 tags" });
//       return;
//     }
//     setTags((t) => [...t, val]);
//     setTagInput("");
//   };
//   const removeTag = (idx: number) =>
//     setTags((t) => t.filter((_, i) => i !== idx));

//   const assignHiddenTags = () => {
//     if (!formRef.current) return;
//     const hidden =
//       formRef.current.querySelector<HTMLInputElement>("input[name=tags]");
//     if (hidden) hidden.value = tags.join(",");
//   };

//   useEffect(assignHiddenTags, [tags]);

//   const handleEnhancedSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (!formRef.current) return;

//     assignHiddenTags();
//     const formData = new FormData(formRef.current);

//     const video = formData.get("video") as File | null;
//     const thumbnail = formData.get("thumbnail") as File | null;
//     if (!video || !thumbnail) {
//       toast({
//         title: "contribute",
//         description: "Please select both video and thumbnail files",
//       });
//       return;
//     }

//     setUploadStatus("uploading");
//     setProgress({
//       loaded: 0,
//       total: (video?.size || 0) + (thumbnail?.size || 0),
//       percentage: 0,
//     });

//     const xhr = new XMLHttpRequest();
//     xhrRef.current = xhr;

//     xhr.upload.addEventListener("progress", (event) => {
//       if (event.lengthComputable) {
//         const percentage = Math.round((event.loaded / event.total) * 100);
//         setProgress({ loaded: event.loaded, total: event.total, percentage });

//         // When upload reaches 100%, switch to processing state
//         if (percentage === 100) {
//           setUploadStatus("processing");
//         }
//       }
//     });

//     xhr.addEventListener("load", () => {
//       try {
//         if (xhr.status >= 200 && xhr.status < 300) {
//           // Parse the response to check if it's actually successful
//           let responseData;
//           try {
//             responseData = JSON.parse(xhr.responseText);
//           } catch (e) {
//             console.error("Failed to parse response:", e);
//             setUploadStatus("error");
//             toast({
//               title: "contribute",
//               description: "Invalid response from server",
//             });
//             return;
//           }

//           // Check if the backend operation was actually successful
//           if (responseData.success) {
//             setUploadStatus("completed");
//             toast({
//               title: "contribute",
//               description:
//                 responseData.message || "Upload completed successfully",
//             });
//             formRef.current?.reset();
//             setVideoPreview(null);
//             setThumbPreview(null);
//             setTags([]);
//           } else {
//             setUploadStatus("error");
//             toast({
//               title: "contribute",
//               description: responseData.message || "Upload failed",
//             });
//           }
//         } else {
//           setUploadStatus("error");
//           let errorMessage = "Upload failed";
//           try {
//             const errorResponse = JSON.parse(xhr.responseText);
//             errorMessage = errorResponse.message || errorMessage;
//           } catch (e) {
//             // Use status-based error messages
//             if (xhr.status === 413) errorMessage = "File too large";
//             else if (xhr.status === 500)
//               errorMessage = "Server error during upload";
//             else if (xhr.status === 400) errorMessage = "Invalid file format";
//           }
//           toast({ title: "contribute", description: errorMessage });
//         }
//       } catch (error) {
//         console.error("Error processing response:", error);
//         setUploadStatus("error");
//         toast({ title: "contribute", description: "Upload processing failed" });
//       }
//     });

//     xhr.addEventListener("error", () => {
//       setUploadStatus("error");
//       toast({ title: "contribute", description: "Upload failed" });
//     });

//     xhr.addEventListener("abort", () => {
//       setUploadStatus("paused");
//       toast({ title: "contribute", description: "Upload paused" });
//     });

//     xhr.addEventListener("timeout", () => {
//       setUploadStatus("error");
//       toast({
//         title: "contribute",
//         description: "Upload timed out. Please try again with a smaller file.",
//       });
//     });

//     xhr.open("POST", window.location.pathname);
//     // Set timeout to 10 minutes for large file uploads
//     xhr.timeout = 10 * 60 * 1000;
//     xhr.send(formData);
//   };

//   const handlePause = () => {
//     if (xhrRef.current && uploadStatus === "uploading") {
//       xhrRef.current.abort();
//     }
//   };

//   const handleResume = () => {
//     if (formRef.current && uploadStatus === "paused") {
//       handleEnhancedSubmit({
//         preventDefault: () => {},
//       } as React.FormEvent<HTMLFormElement>);
//     }
//   };

//   const handleCancel = () => {
//     if (
//       xhrRef.current &&
//       (uploadStatus === "uploading" || uploadStatus === "paused")
//     ) {
//       xhrRef.current.abort();
//     }
//     setUploadStatus("idle");
//     setProgress(null);
//     formRef.current?.reset();
//     setVideoPreview(null);
//     setThumbPreview(null);
//     setTags([]);
//   };

//   const onSelectFile = useCallback((file: File, type: "video" | "thumb") => {
//     const url = URL.createObjectURL(file);
//     if (type === "video") setVideoPreview(url);
//     else setThumbPreview(url);
//   }, []);

//   const handleDrop = (
//     e: React.DragEvent<HTMLDivElement>,
//     type: "video" | "thumb",
//   ) => {
//     e.preventDefault();
//     if (uploadStatus === "uploading" || uploadStatus === "processing") return;
//     const file = e.dataTransfer.files?.[0];
//     if (!file) return;
//     if (type === "video" && !file.type.startsWith("video/")) return;
//     if (type === "thumb" && !file.type.startsWith("image/")) return;
//     const input = formRef.current?.querySelector<HTMLInputElement>(
//       `input[name=${type === "video" ? "video" : "thumbnail"}]`,
//     );
//     if (input) {
//       const dataTransfer = new DataTransfer();
//       dataTransfer.items.add(file);
//       input.files = dataTransfer.files;
//       onSelectFile(file, type === "video" ? "video" : "thumb");
//     }
//   };

//   const prevent = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   return (
//     <div className="h-fit w-full p-3">
//       <div className="flex items-center gap-2 my-2">
//         <Button asChild variant="ghost">
//           <Link to=".." relative="path" className="flex items-center space-x-2">
//             <ArrowLeft className="h-5 w-5 text-muted-foreground" />
//             <Label className="text-base font-medium">Back</Label>
//           </Link>
//         </Button>
//       </div>

//       <CommonSubHeader
//         userName="Upload Video"
//         role="Share your content"
//         variant="default"
//       />

//       <Form
//         ref={formRef}
//         method="post"
//         encType="multipart/form-data"
//         onSubmit={handleEnhancedSubmit}
//         className="my-6 grid gap-6 xl:grid-cols-3 max-w-7xl mx-auto"
//       >
//         {/* Primary column */}
//         <div className="space-y-6 xl:col-span-2 order-2 xl:order-1">
//           {/* Video file */}
//           <Card
//             onDrop={(e) => handleDrop(e, "video")}
//             onDragOver={prevent}
//             className="border-dashed"
//           >
//             <CardHeader>
//               <CardTitle className="text-base">Video File</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div
//                 className="group relative flex flex-col items-center justify-center w-full h-72 rounded-md border border-dashed bg-muted/30 hover:bg-muted/40 transition cursor-pointer text-muted-foreground"
//                 onClick={() =>
//                   formRef.current
//                     ?.querySelector<HTMLInputElement>("#video")
//                     ?.click()
//                 }
//               >
//                 {videoPreview ? (
//                   <video
//                     src={videoPreview}
//                     controls
//                     className="h-full w-full object-contain rounded-md"
//                   />
//                 ) : (
//                   <>
//                     <Upload className="w-10 h-10 mb-4 opacity-70" />
//                     <p className="font-medium">Drop your video here</p>
//                     <p className="text-xs mt-1">or click to browse files</p>
//                     <p className="text-[10px] mt-2 opacity-70">
//                       MP4 MOV AVI WMV • Max 500MB
//                     </p>
//                   </>
//                 )}
//                 <Input
//                   id="video"
//                   name="video"
//                   type="file"
//                   accept="video/*"
//                   required
//                   disabled={
//                     uploadStatus === "uploading" ||
//                     uploadStatus === "processing"
//                   }
//                   className="hidden"
//                   onChange={(e) => {
//                     const f = e.target.files?.[0];
//                     if (f) onSelectFile(f, "video");
//                   }}
//                 />
//               </div>
//             </CardContent>
//           </Card>

//           {/* Thumbnail */}
//           <Card
//             onDrop={(e) => handleDrop(e, "thumb")}
//             onDragOver={prevent}
//             className="border-dashed"
//           >
//             <CardHeader>
//               <CardTitle className="text-base">Custom Thumbnail</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div
//                 className="group relative flex flex-col items-center justify-center w-full h-56 rounded-md border border-dashed bg-muted/30 hover:bg-muted/40 transition cursor-pointer text-muted-foreground"
//                 onClick={() =>
//                   formRef.current
//                     ?.querySelector<HTMLInputElement>("#thumbnail")
//                     ?.click()
//                 }
//               >
//                 {thumbPreview ? (
//                   <img
//                     src={thumbPreview}
//                     alt="thumbnail"
//                     className="h-full object-contain rounded-md"
//                   />
//                 ) : (
//                   <>
//                     <ImageIcon className="w-10 h-10 mb-4 opacity-70" />
//                     <p className="font-medium">Upload Thumbnail</p>
//                     <p className="text-xs mt-1">Browse or drag image here</p>
//                     <p className="text-[10px] mt-2 opacity-70">
//                       PNG JPG WEBP • Max 5MB
//                     </p>
//                   </>
//                 )}
//                 <Input
//                   id="thumbnail"
//                   name="thumbnail"
//                   type="file"
//                   accept="image/*"
//                   required
//                   disabled={
//                     uploadStatus === "uploading" ||
//                     uploadStatus === "processing"
//                   }
//                   className="hidden"
//                   onChange={(e) => {
//                     const f = e.target.files?.[0];
//                     if (f) onSelectFile(f, "thumb");
//                   }}
//                 />
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Side details panel */}
//         <div className="space-y-6 order-1 xl:order-2">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-sm flex items-center gap-2">
//                 <Info className="w-4 h-4" /> Video Details
//               </CardTitle>
//               <CardDescription>
//                 Basic information displayed publicly
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="title">Title *</Label>
//                 <Input
//                   id="title"
//                   name="title"
//                   type="text"
//                   placeholder="Enter your video title"
//                   required
//                   disabled={
//                     uploadStatus === "uploading" ||
//                     uploadStatus === "processing"
//                   }
//                   maxLength={100}
//                 />
//                 <p className="text-[10px] text-muted-foreground text-right">
//                   0/100 characters
//                 </p>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="description">Description *</Label>
//                 <textarea
//                   id="description"
//                   name="description"
//                   required
//                   disabled={
//                     uploadStatus === "uploading" ||
//                     uploadStatus === "processing"
//                   }
//                   className="w-full min-h-[140px] rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-input"
//                   placeholder="Tell viewers about your video..."
//                 />
//                 <p className="text-[10px] text-muted-foreground text-right">
//                   0/5000 characters
//                 </p>
//               </div>
//               <div className="space-y-2">
//                 <Label className="flex items-center gap-2">
//                   <Tags className="w-4 h-4" /> Tags
//                 </Label>
//                 <div className="flex gap-2">
//                   <Input
//                     value={tagInput}
//                     onChange={(e) => setTagInput(e.target.value)}
//                     onKeyDown={handleTagsKey}
//                     placeholder="Add a tag"
//                     disabled={
//                       uploadStatus === "uploading" ||
//                       uploadStatus === "processing"
//                     }
//                   />
//                   <Button
//                     type="button"
//                     variant="secondary"
//                     onClick={addTag}
//                     disabled={
//                       !tagInput.trim() ||
//                       uploadStatus === "uploading" ||
//                       uploadStatus === "processing"
//                     }
//                   >
//                     Add
//                   </Button>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {tags.map((t, i) => (
//                     <span
//                       key={i}
//                       className="px-2 py-1 text-xs rounded bg-secondary flex items-center gap-1"
//                     >
//                       {t}
//                       <button
//                         type="button"
//                         onClick={() => removeTag(i)}
//                         className="text-muted-foreground hover:text-foreground"
//                       >
//                         ×
//                       </button>
//                     </span>
//                   ))}
//                   {tags.length === 0 && (
//                     <p className="text-xs text-muted-foreground">
//                       Add tags to help people find your video • 0/10 tags
//                     </p>
//                   )}
//                 </div>
//                 <input type="hidden" name="tags" value={tags.join(",")} />
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="text-sm">Publish Options</CardTitle>
//               <CardDescription>
//                 Upload first to enable publishing
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <div className="flex flex-col gap-2">
//                 {uploadStatus === "idle" && (
//                   <Button
//                     type="submit"
//                     className="flex items-center w-full justify-center"
//                   >
//                     <Upload className="w-4 h-4 mr-2" /> Upload Now
//                   </Button>
//                 )}
//                 <FutureFeature>
//                   {(uploadStatus === "uploading" ||
//                     uploadStatus === "processing") && (
//                     <div className="flex gap-2">
//                       <Button
//                         type="button"
//                         variant="secondary"
//                         onClick={handlePause}
//                         className="flex-1"
//                         disabled={uploadStatus === "processing"}
//                       >
//                         {uploadStatus === "processing"
//                           ? "Processing..."
//                           : "Pause"}
//                       </Button>
//                       <Button
//                         type="button"
//                         variant="destructive"
//                         onClick={handleCancel}
//                         className="flex-1"
//                         disabled={uploadStatus === "processing"}
//                       >
//                         Cancel
//                       </Button>
//                     </div>
//                   )}
//                   {uploadStatus === "paused" && (
//                     <div className="flex gap-2">
//                       <Button
//                         type="button"
//                         onClick={handleResume}
//                         className="flex-1"
//                       >
//                         Resume
//                       </Button>
//                       <Button
//                         type="button"
//                         variant="destructive"
//                         onClick={handleCancel}
//                         className="flex-1"
//                       >
//                         Cancel
//                       </Button>
//                     </div>
//                   )}
//                 </FutureFeature>
//                 {uploadStatus === "completed" && (
//                   <Button type="button" variant="secondary" disabled>
//                     Uploaded
//                   </Button>
//                 )}
//               </div>
//               {progress && (
//                 <div className="space-y-2">
//                   <div className="flex justify-between text-xs text-muted-foreground">
//                     <span>
//                       {uploadStatus === "processing"
//                         ? "Processing files..."
//                         : "Uploading..."}
//                     </span>
//                     <span>
//                       {uploadStatus === "processing"
//                         ? "Please wait..."
//                         : `${progress.percentage}% (${formatBytes(progress.loaded)} / ${formatBytes(progress.total)})`}
//                     </span>
//                   </div>
//                   <div className="w-full h-2 bg-muted rounded">
//                     <div
//                       className={`h-2 rounded transition-all ${
//                         uploadStatus === "processing"
//                           ? "bg-yellow-500 animate-pulse"
//                           : "bg-primary"
//                       }`}
//                       style={{
//                         width: `${uploadStatus === "processing" ? 100 : progress.percentage}%`,
//                       }}
//                     />
//                   </div>
//                 </div>
//               )}
//               <ul className="text-[11px] space-y-1 text-muted-foreground pt-2">
//                 <li>Video: {videoPreview ? "Selected" : "Pending"}</li>
//                 <li>Thumbnail: {thumbPreview ? "Selected" : "Pending"}</li>
//                 <li>Title: Required</li>
//                 <li>Description: Required</li>
//                 <li>Tags: Optional</li>
//               </ul>
//             </CardContent>
//           </Card>
//         </div>
//       </Form>
//     </div>
//   );
// }

// function formatBytes(bytes: number): string {
//   if (bytes === 0) return "0 Bytes";
//   const k = 1024;
//   const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
// }

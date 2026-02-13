"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  GitBranch,
  Eye,
  Edit,
  Trash2,
  MessageCircle,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Tag,
  X,
} from "lucide-react";

interface Version {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED";
  versionNumber: number;
  duration?: number;
  createdAt: string;
  comments?: Comment[];
  video?: {
    integrationUrl?: string;
  };
  thumbnail?: {
    integrationUrl?: string;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author?: {
    name: string;
    email: string;
    image?: string;
  };
}

interface VersionCardProps {
  version: Version;
  onView: (version: Version) => void;
  onEdit?: (version: Version) => void;
  onDelete?: (version: Version) => void;
  onStatusChange?: (version: Version, status: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canApprove?: boolean;
}

export function VersionCard({
  version,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  canEdit = true,
  canDelete = false,
  canApprove = false,
}: VersionCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Version {version.versionNumber}</span>
            </div>
            <Badge className={getStatusColor(version.status)}>
              <span className="flex items-center gap-1">
                {getStatusIcon(version.status)}
                {version.status}
              </span>
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onView(version)}>
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            {canEdit && onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(version)}>
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
            {canDelete && onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => onDelete(version)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
        <CardTitle className="text-base mt-2">{version.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {version.description || "No description"}
        </p>
        
        {/* Tags */}
        {version.tags && version.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {version.tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(version.createdAt).toLocaleDateString()}
          </div>
          {version.duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {Math.floor(version.duration / 60)}:{(version.duration % 60).toString().padStart(2, "0")}
            </div>
          )}
          {version.comments && version.comments.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {version.comments.length} comments
            </div>
          )}
        </div>

        {/* Status Actions */}
        {canApprove && onStatusChange && (version.status === "PENDING") && (
          <div className="flex gap-2 mt-4 pt-3 border-t">
            <Button
              size="sm"
              variant="default"
              className="flex-1"
              onClick={() => onStatusChange(version, "COMPLETED")}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-red-600"
              onClick={() => onStatusChange(version, "REJECTED")}
            >
              <XCircle className="h-3 w-3 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

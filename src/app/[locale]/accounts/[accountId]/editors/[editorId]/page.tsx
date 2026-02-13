"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { getSession } from "@/server/services/auth/auth-client";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CommonSubHeader } from "@/components/common/CommonSubHeader";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
}

interface EditorDetail {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  status: string;
  accounts?: { id: string; email: string }[];
}

export default function AccountEditorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params.accountId as string;
  const editorId = params.editorId as string;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [editor, setEditor] = useState<EditorDetail | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await getSession();
        
        if (!session?.data?.user) {
          router.push("/auth/login");
          return;
        }

        const currentUser: User = {
          id: session.data.user.id,
          name: session.data.user.name || "User",
          email: session.data.user.email,
          image: session.data.user.image || undefined,
          role: (session.data.user as any).role || "user",
        };

        if (currentUser.role !== "creator") {
          router.push("/dashboard");
          return;
        }

        setUser(currentUser);

        // Fetch editor details
        try {
          const editorsRes = await fetch(
            `/api/map/account?creatorId=${currentUser.id}&accountId=${accountId}`
          );
          if (editorsRes.ok) {
            const data = await editorsRes.json();
            const found = data.find((e: any) => e.editorId === editorId);
            if (found) {
              setEditor({
                id: found.editorId,
                name: found.editor?.name || "Unknown",
                email: found.editor?.email || "",
                image: found.editor?.image,
                createdAt: found.createdAt,
                status: found.status,
              });
            }
          }
        } catch (error) {
          console.error("Failed to fetch editor:", error);
        }
      } catch (error) {
        console.error("Failed to load page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, accountId, editorId]);

  const handleRemoveEditor = async () => {
    if (!confirm("Are you sure you want to remove this editor?")) return;

    try {
      const editorsRes = await fetch(
        `/api/map/account?creatorId=${user?.id}&accountId=${accountId}`
      );
      if (editorsRes.ok) {
        const data = await editorsRes.json();
        const map = data.find((e: any) => e.editorId === editorId);
        if (map) {
          const response = await fetch(`/api/map/${map.id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to remove editor");
          }

          toast.success("Editor removed successfully");
          router.push(`/accounts/${accountId}/editors`);
        }
      }
    } catch (error) {
      toast.error("Failed to remove editor");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !editor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar user={user} />
      
      <div className="flex-1 flex flex-col">
        <Header page="Editor Details" user={user} />
        
        <main className="flex-1 p-6">
          <div className="h-fit w-full max-w-2xl mx-auto">
            {/* Back Button */}
            <Button variant="ghost" className="mb-4">
              <Link
                href={`/accounts/${accountId}/editors`}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Editors</span>
              </Link>
            </Button>

            {/* Editor Profile */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {getInitials(editor.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{editor.name}</CardTitle>
                    <Badge
                      className={
                        editor.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : editor.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }
                    >
                      {editor.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{editor.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Added: {new Date(editor.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="destructive" onClick={handleRemoveEditor}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Remove Editor
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/accounts/${accountId}/editors`}>Cancel</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

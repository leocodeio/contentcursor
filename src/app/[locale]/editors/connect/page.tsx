"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  Loader2,
  CheckCircle2,
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
import { toast } from "sonner";
import { CommonSubHeader } from "@/components/common/CommonSubHeader";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
}

export default function EditorsConnectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editorEmail = searchParams.get("email") || "";

  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [user, setUser] = useState<User | null>(null);

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

        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleConnect = async () => {
    if (!editorEmail) {
      toast.error("No editor selected");
      return;
    }

    setConnecting(true);
    try {
      // Find editor by email and create connection request
      const response = await fetch("/api/map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editorId: editorEmail,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send connection request");
      }

      toast.success("Connection request sent!");
      router.push("/editors");
    } catch (error: any) {
      toast.error(error.message || "Failed to connect");
    } finally {
      setConnecting(false);
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar user={user} />
      
      <div className="flex-1 flex flex-col">
        <Header page="Connect Editor" user={user} />
        
        <main className="flex-1 p-6">
          <div className="h-fit w-full max-w-2xl mx-auto">
            {/* Back Button */}
            <Button variant="ghost" className="mb-4">
              <Link href="/editors" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Editors</span>
              </Link>
            </Button>

            {/* Page Header */}
            <CommonSubHeader
              userName="Connect Editor"
              role="creator"
              variant="default"
            />

            {/* Connect Form */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Send Connection Request
                </CardTitle>
                <CardDescription>
                  {editorEmail
                    ? `You are about to connect with ${editorEmail}`
                    : "Connect with an editor to start collaborating"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editorEmail && (
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg mb-6">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(editorEmail.split("@")[0])}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{editorEmail}</p>
                      <p className="text-sm text-muted-foreground">
                        Editor
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
                  </div>
                )}

                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    By connecting with this editor, you'll be able to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Invite them to contribute to your accounts</li>
                    <li>Share content and collaborate on videos</li>
                    <li>Manage permissions and access levels</li>
                  </ul>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleConnect}
                      disabled={connecting || !editorEmail}
                      className="flex-1"
                    >
                      {connecting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Send Request
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href="/editors/search">Cancel</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

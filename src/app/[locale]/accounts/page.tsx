"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Settings, User, Loader2 } from "lucide-react";

import { getSession } from "@/server/services/auth/auth-client";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

interface LinkedAccount {
  id: string;
  email: string;
  status: string;
  creatorId: string;
  createdAt: string;
}

interface AccountsPageData {
  user: User;
  role: "creator" | "editor";
  linkedAccounts: LinkedAccount[];
}

export default function AccountsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [data, setData] = useState<AccountsPageData | null>(null);

  // Handle success/error query params from OAuth callback
  useEffect(() => {
    const success = searchParams.get("success");
    const message = searchParams.get("message");

    if (success === "true") {
      toast.success(message || "Account linked successfully!");
      // Refresh data
      router.replace("/accounts", { scroll: false });
    } else if (success === "false") {
      toast.error(message || "Failed to link account");
      router.replace("/accounts", { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await getSession();
        
        if (!session?.data?.user) {
          router.push("/auth/login");
          return;
        }

        const user: User = {
          id: session.data.user.id,
          name: session.data.user.name || "User",
          email: session.data.user.email,
          image: session.data.user.image || undefined,
          role: (session.data.user as any).role || "user",
        };

        const role = (user.role === "creator" || user.role === "editor") 
          ? user.role as "creator" | "editor" 
          : "creator";

        // Only creators can manage accounts
        if (role !== "creator") {
          router.push("/dashboard");
          return;
        }

        // Fetch linked accounts
        let linkedAccounts: LinkedAccount[] = [];
        try {
          const accountsRes = await fetch(`/api/yt_int/creator?creatorId=${user.id}`);
          if (accountsRes.ok) {
            linkedAccounts = await accountsRes.json();
          }
        } catch (error) {
          console.error("Failed to fetch accounts:", error);
        }

        setData({
          user,
          role,
          linkedAccounts,
        });
      } catch (error) {
        console.error("Failed to load accounts:", error);
        toast.error("Failed to load accounts");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLinkAccount = async () => {
    setLinking(true);
    try {
      // Get OAuth URL from API
      const authRes = await fetch("/api/yt_int", { method: "GET" });
      if (!authRes.ok) {
        throw new Error("Failed to get auth URL");
      }
      const authData = await authRes.json();
      
      // Redirect to Google OAuth
      if (authData.url) {
        window.location.href = authData.url;
      }
    } catch (error) {
      console.error("Failed to link account:", error);
      toast.error("Failed to start account linking");
      setLinking(false);
    }
  };

  const handleUnlinkAccount = async (accountId: string) => {
    if (!confirm("Are you sure you want to unlink this account?")) {
      return;
    }

    setUnlinking(accountId);
    try {
      const response = await fetch(`/api/yt_int/creator?id=${accountId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "INACTIVE" }),
      });

      if (!response.ok) {
        throw new Error("Failed to unlink account");
      }

      toast.success("Account unlinked successfully");
      
      // Update local state
      setData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          linkedAccounts: prev.linkedAccounts.filter((a) => a.id !== accountId),
        };
      });
    } catch (error) {
      console.error("Failed to unlink account:", error);
      toast.error("Failed to unlink account");
    } finally {
      setUnlinking(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading accounts...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { user, linkedAccounts } = data;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar user={user} />
      
      <div className="flex-1 flex flex-col">
        <Header page="Accounts" user={user} />
        
        <main className="flex-1 p-6">
          <div className="h-fit w-full">
            {/* Back Button */}
            <Button variant="ghost" className="mb-4">
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Link>
            </Button>

            <CommonSubHeader userName={user.name} role="creator" />

            <div className="mt-6 space-y-6">
              {/* Linked Accounts Section */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Linked Accounts</h2>
                
                {linkedAccounts.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {linkedAccounts.map((account) => (
                      <Card key={account.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {account.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {account.email}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {account.status.toLowerCase()}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <p className="text-xs text-muted-foreground">
                            Linked on {new Date(account.createdAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/accounts/${account.id}`)}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Manage
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleUnlinkAccount(account.id)}
                            disabled={unlinking === account.id}
                          >
                            {unlinking === account.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Unlink"
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        No accounts linked yet
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Link a YouTube account to get started
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Link New Account Section */}
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold mb-4">Link New Account</h2>
                <Card>
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Connect YouTube</CardTitle>
                        <CardDescription>
                          Link a new YouTube account to manage
                        </CardDescription>
                      </div>
                      <Button
                        variant="default"
                        onClick={handleLinkAccount}
                        disabled={linking}
                      >
                        {linking ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Link Account
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

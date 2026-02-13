"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, ArrowRight, Loader2, FolderInput } from "lucide-react";

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

interface AccountEditorMap {
  id: string;
  accountId: string;
  editorId: string;
  status: string;
  account?: {
    id: string;
    creatorId: string;
    email: string;
    status: string;
  };
}

interface CreatorWithAccounts {
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  creatorImage?: string;
  accounts: AccountEditorMap[];
}

interface ContributePageData {
  user: User;
  role: "creator" | "editor";
  editorLinkedAccountsByCreator: CreatorWithAccounts[];
}

export default function ContributePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ContributePageData | null>(null);
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

        const role = (currentUser.role === "creator" || currentUser.role === "editor") 
          ? currentUser.role as "creator" | "editor" 
          : "editor";

        // Only editors can access contribute page
        if (role !== "editor") {
          router.push("/dashboard");
          return;
        }

        setUser(currentUser);

        // Fetch account-editor maps for this editor
        let accountsByCreator: CreatorWithAccounts[] = [];
        
        try {
          const accountsRes = await fetch(`/api/map/account?editorId=${currentUser.id}`);
          if (accountsRes.ok) {
            const accountMaps: AccountEditorMap[] = await accountsRes.json();
            
            // Group accounts by creator
            const creatorMap = new Map<string, CreatorWithAccounts>();
            
            for (const map of accountMaps) {
              if (map.status !== "ACTIVE") continue;
              
              const existing = creatorMap.get(map.account?.creatorId || "");
              if (existing) {
                existing.accounts.push(map);
              } else {
                creatorMap.set(map.account?.creatorId || "", {
                  creatorId: map.account?.creatorId || "",
                  creatorName: "Creator",
                  creatorEmail: map.account?.email?.split("@")[0] || "creator",
                  accounts: [map],
                });
              }
            }
            
            accountsByCreator = Array.from(creatorMap.values());
          }
        } catch (error) {
          console.error("Failed to fetch accounts:", error);
        }

        setData({
          user: currentUser,
          role,
          editorLinkedAccountsByCreator: accountsByCreator,
        });
      } catch (error) {
        console.error("Failed to load contribute page:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

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

  if (!user || !data) {
    return null;
  }

  const { editorLinkedAccountsByCreator } = data;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar user={user} />
      
      <div className="flex-1 flex flex-col">
        <Header page="Contribute" user={user} />
        
        <main className="flex-1 p-6">
          <div className="h-fit w-full">
            {/* Back Button */}
            <Button variant="ghost" className="mb-4">
              <Link href="/creators" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Link>
            </Button>

            <CommonSubHeader userName={user.name} role="editor" />

            <div className="mt-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Contribute Content</h2>
                  <p className="text-sm text-muted-foreground">
                    Select a creator's account to submit your content
                  </p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FolderInput className="h-3 w-3" />
                  {editorLinkedAccountsByCreator.reduce(
                    (acc, c) => acc + c.accounts.length,
                    0
                  )}{" "}
                  Accounts
                </Badge>
              </div>

              {/* Creators with Accounts */}
              {editorLinkedAccountsByCreator.length > 0 ? (
                <div className="space-y-8">
                  {editorLinkedAccountsByCreator.map((creator) => (
                    <div key={creator.creatorId}>
                      {/* Creator Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(creator.creatorName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{creator.creatorName}</h3>
                          <p className="text-xs text-muted-foreground">
                            {creator.accounts.length} account(s)
                          </p>
                        </div>
                      </div>

                      {/* Accounts Grid */}
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {creator.accounts.map((account) => (
                          <Card
                            key={account.id}
                            className="hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-semibold text-primary uppercase">
                                    {account.account?.email?.charAt(0) || "?"}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {account.account?.email || "Unknown"}
                                  </p>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {account.status}
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardFooter>
                              <Button
                                variant="default"
                                className="w-full"
                                onClick={() =>
                                  router.push(
                                    `/contribute/${creator.creatorId}/accounts/${account.accountId}`
                                  )
                                }
                              >
                                Enter
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                      No accounts to contribute to
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      You need to be invited by a creator first
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/creators">
                        <Users className="h-4 w-4 mr-2" />
                        View Invitations
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Help Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderInput className="h-5 w-5" />
                    How to Contribute
                  </CardTitle>
                  <CardDescription>
                    Submit your edited content to creators for review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                    <li>Select a creator's account from the list above</li>
                    <li>Browse or upload content to their folder</li>
                    <li>Create contributions with video and thumbnail</li>
                    <li>Track versions and receive feedback</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

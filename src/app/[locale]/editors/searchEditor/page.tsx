"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  UserPlus,
  Loader2,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface SearchResult {
  id: string;
  name: string;
  email: string;
}

export default function EditorsSearchEditorPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params.accountId as string;

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

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

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setSearching(true);
    setHasSearched(true);
    
    // Mock search - in real app would call search API
    setTimeout(() => {
      // Simulate finding an editor
      setResults([
        {
          id: "1",
          name: searchEmail.split("@")[0].replace(".", " ").replace(/\b\w/g, l => l.toUpperCase()),
          email: searchEmail,
        },
      ]);
      setSearching(false);
    }, 1000);
  };

  const handleConnect = (result: SearchResult) => {
    if (accountId) {
      router.push(`/editors/connect?email=${encodeURIComponent(result.email)}&accountId=${accountId}`);
    } else {
      router.push(`/editors/connect?email=${encodeURIComponent(result.email)}`);
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
        <Header page="Search Editor" user={user} />
        
        <main className="flex-1 p-6">
          <div className="h-fit w-full max-w-2xl mx-auto">
            {/* Back Button */}
            <Button variant="ghost" className="mb-4">
              <Link href={accountId ? `/accounts/${accountId}/editors` : "/editors"} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Editors</span>
              </Link>
            </Button>

            {/* Page Header */}
            <CommonSubHeader
              userName="Search Editor"
              role="Find editors by email address"
              variant="default"
            />

            {/* Search Form */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search by Email
                </CardTitle>
                <CardDescription>
                  Enter an email address to find and connect with editors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        type="email"
                        placeholder="editor@example.com"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      />
                      <Button onClick={handleSearch} disabled={searching}>
                        {searching ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            {hasSearched && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Search Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {results.length > 0 ? (
                    <div className="space-y-4">
                      {results.map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(result.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{result.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {result.email}
                              </p>
                            </div>
                          </div>
                          <Button onClick={() => handleConnect(result)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No editors found with that email</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

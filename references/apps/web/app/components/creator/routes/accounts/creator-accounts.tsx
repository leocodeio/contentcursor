/*
 * fetch already linked accounts
 * show them in a grid pattren that would be responsive
 * in each card, show a button to unlink the account
 * button to link new account
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { Link } from "@remix-run/react";
import { Label } from "@/components/ui/label";

export interface Account {
  id: string;
  email: string;
}

export interface CreatorAccountsProps {
  accounts: Account[];
  onUnlink: (accountId: string) => void;
  onLinkNew: () => void;
}

export default function CreatorAccounts({
  accounts,
  onUnlink,
  onLinkNew,
}: CreatorAccountsProps) {
  return (
    <div className="p-4">
      {/* Back Button */}
      <Button variant="ghost" className="my-2">
        <Link to="/feature/dashboard" className="flex items-center space-x-2">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          <Label className="text-base font-medium">Back</Label>
        </Link>
      </Button>


    </div>
  );
}

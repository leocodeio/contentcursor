import { Persona } from "~/models/persona";
import { CommonSubHeader } from "~/components/common/CommonSubHeader";

// loader
import { loader as dashboardLoader } from "@/routes/loader+/feature+/dashboard+/dashboard.loader";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import EditorCreator from "~/components/editor/routes/editors/editor-creator";
import { EmailSearch } from "~/components/creator/routes/editors/search";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Label } from "~/components/ui/label";
export const loader = dashboardLoader;

export const renderEditors = ({ role }: { role: Persona }) => {
  switch (role) {
    case Persona.CREATOR:
      return <EmailSearch />;

    case Persona.EDITOR:
      return <EditorCreator />;

    default:
      return <div>Admin</div>;
  }
};

export default function Search() {
  const data = useLoaderData<typeof loader>() as { role: Persona };
  const { role } = data;

  return (
    <div className="h-fit w-full p-3">
      <CommonSubHeader
        userName="Search Editor via Email"
        role="Creator"
        variant="default"
      />
      <Button variant="ghost">
        <Link to="/feature/editors" className="flex items-center space-x-2">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          <Label className="text-base font-medium">Back</Label>
        </Link>
      </Button>
      {renderEditors({ role })}
    </div>
  );
}

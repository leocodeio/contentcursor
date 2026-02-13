# UI Context - Spectral to ContentCursor Migration

This document captures the UI structure, components, and patterns from the Spectral (Remix) web application for migration to ContentCursor (Next.js).

---

## 📁 Project Structure (Spectral)

```
references/apps/web/
├── app/
│   ├── components/
│   │   ├── ui/              # Base UI components (shadcn/ui)
│   │   ├── common/          # Shared components (sidebar, header)
│   │   ├── creator/         # Creator-specific components
│   │   ├── editor/          # Editor-specific components
│   │   └── auth/            # Auth components
│   ├── routes/
│   │   ├── feature+/         # Feature routes (dashboard, accounts, etc.)
│   │   ├── auth+/           # Auth routes
│   │   ├── api+/            # API routes
│   │   └── action+/         # Action routes
│   ├── models/              # Data models
│   ├── hooks/               # Custom hooks
│   ├── context/             # React context providers
│   ├── lib/                 # Utility libraries
│   └── utils/               # Helper functions
```

---

## 🎨 Design System

### Tailwind CSS Configuration
- **Framework**: Tailwind CSS with shadcn/ui
- **Theme**: CSS variables for colors (via `@class-variance-authority`)
- **Icons**: Lucide React
- **Charts**: Recharts

### Color Variables (CSS)
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}
```

---

## 🧩 Base UI Components (`components/ui/`)

### Core Components
| Component | Description | Dependencies |
|-----------|-------------|--------------|
| `Button` | Multi-variant button | class-variance-authority |
| `Input` | Text input field | - |
| `Textarea` | Multi-line text input | - |
| `Label` | Form label | - |
| `Card` | Content container | - |
| `Avatar` | User avatar image | @radix-ui/react-avatar |
| `Badge` | Status/label badge | - |
| `Checkbox` | Checkbox input | @radix-ui/react-checkbox |
| `Select` | Dropdown select | @radix-ui/react-select |
| `Dialog` | Modal dialog | @radix-ui/react-dialog |
| `DropdownMenu` | Dropdown menu | @radix-ui/react-dropdown-menu |
| `Tabs` | Tab navigation | @radix-ui/react-tabs |
| `Table` | Data table | - |
| `Tooltip` | Hover tooltip | @radix-ui/react-tooltip |
| `Popover` | Popover content | @radix-ui/react-popover |
| `Sheet` | Slide-out panel | @radix-ui/react-sheet |
| `Separator` | Visual separator | @radix-ui/react-separator |
| `Switch` | Toggle switch | @radix-ui/react-switch |
| `Toggle` | Pressable toggle | @radix-ui/react-toggle |
| `Toast` | Toast notifications | sonner/use-toast |
| `Toaster` | Toast container | sonner |
| `Combobox` | Autocomplete combo | cmdk |
| `NavigationMenu` | Nav menu | @radix-ui/react-navigation-menu |
| `ScrollArea` | Scrollable container | @radix-ui/react-scroll-area |
| `Alert` | Alert message | - |
| `Chart` | Charts | recharts |
| `Skeleton` | Loading skeleton | - |
| `Sidebar` | Collapsible sidebar | complex (see below) |

### Sidebar Component (`components/ui/sidebar.tsx`)
The sidebar is a complex component with multiple sub-components:

```tsx
// Main components
<Sidebar>
  <SidebarHeader />
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel />
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton />
            <SidebarMenuAction />
            <SidebarMenuBadge />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>
  <SidebarFooter />
</Sidebar>

// Context hook
const { state, open, setOpen, toggleSidebar } = useSidebar();
```

**Key features:**
- Collapsible (expanded/collapsed states)
- Mobile responsive (sheet variant)
- Cookie persistence for state
- Keyboard shortcut (Cmd/Ctrl + B)
- Tooltips on collapsed state
- Rail variant for minimal view

---

## 🏗️ Layout Components (`components/common/`)

### CommonSidebar.tsx
```tsx
interface SidebarProps {
  data: {
    name: string;
    to: string;
    icon: LucideIcon;
  }[];
}

export function CommonSidebar({ data }: SidebarProps) {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <Link to={item.to}>
                    <SidebarMenuButton>
                      <item.icon />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
```

### CommonHeader.tsx
```tsx
interface HeaderProps {
  user: { image: string } | null;
}

export function CommonHeader({ user }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b">
      <SidebarTrigger />
      <Select onValueChange={handleLanguageChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
      </Select>
      <ThemeColorToggle />
      <ModeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar><AvatarImage src={user?.image} /></Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem><Link to="/profile">Profile</Link></DropdownMenuItem>
          <DropdownMenuItem><Form onSubmit={handleSignout}>Logout</Form></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
```

### CommonSubHeader.tsx
```tsx
interface SubHeaderProps {
  userName: string;
  role: "creator" | "editor";
  variant: "default" | "compact";
}

export function CommonSubHeader({ userName, role, variant }: SubHeaderProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <h1 className="text-2xl font-bold">{userName}</h1>
        <Badge>{role}</Badge>
      </div>
    </div>
  );
}
```

---

## 📱 Feature Pages (`routes/feature+/`)

### Navigation Structure (`models/navlinks.ts`)
```ts
export const NavLinks = [
  { name: "Home", to: "/feature/home", accesibleRoles: [] },
  { name: "Dashboard", to: "/feature/dashboard", accesibleRoles: ["creator", "editor"] },
  { name: "Editors", to: "/feature/editors", accesibleRoles: ["creator"] },
  { name: "Creators", to: "/feature/creators", accesibleRoles: ["editor"] },
  { name: "Accounts", to: "/feature/accounts", accesibleRoles: ["creator"] },
  { name: "Contribute", to: "/feature/contribute", accesibleRoles: ["editor"] },
];
```

### Dashboard Page (`feature+/dashboard+/`)
```tsx
export default function Dashboard() {
  const { role, name } = useLoaderData<typeof loader>();
  
  return (
    <div className="p-3">
      <CommonSubHeader userName={name} role={role} />
      
      {/* Role-based content */}
      <PermissionCheck role={role} allowedRoles={["creator"]}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle>Linked Accounts</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your connected social and content platforms.
              </p>
              <Button variant="default" className="w-full">
                <Link to="/feature/accounts">View Accounts</Link>
              </Button>
            </CardContent>
          </Card>
          {/* More cards... */}
        </div>
      </PermissionCheck>
      
      <Card>
        <CardHeader><CardTitle>Performance Metrics</CardTitle></CardHeader>
        <CardContent>
          <ChartAreaInteractive />
        </CardContent>
      </Card>
    </div>
  );
}
```

### Accounts Page (`feature+/accounts+/`)
```tsx
export default function Accounts() {
  const { name, role, linkedAccounts } = useLoaderData<typeof loader>();
  
  return (
    <div className="p-3">
      <CommonSubHeader userName={name} role={role} />
      <Button variant="ghost"><Link to="/feature/dashboard"><ArrowLeft /> Back</Link></Button>
      
      <PermissionCheck role={role} allowedRoles={["creator"]}>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {linkedAccounts?.map((account) => (
            <Card key={account.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar>
                    <span className="text-sm font-semibold">
                      {account.email?.charAt(0)}
                    </span>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{account.email}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(`/feature/accounts/${account.id}`)}>
                  <Settings /> Manage
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onUnlink(account.id)}>
                  Unlink
                </Button>
              </CardContent>
            </Card>
          ))}
          
          {/* Add new account card */}
          <Card>
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <Plus className="w-6 h-6" />
              <Button onClick={onLinkNew}>Link New Account</Button>
            </CardContent>
          </Card>
        </div>
      </PermissionCheck>
    </div>
  );
}
```

### Creators/Editors Page (`feature+/creators+/`)
```tsx
export default function Creators() {
  const { role, name, creatorResults } = useLoaderData<typeof loader>();
  const [statusFilter, setStatusFilter] = useState("active");
  
  return (
    <div className="p-3">
      <CommonSubHeader userName={name} role={role} />
      
      {/* Filter dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger><Filter /> {getFilterLabel()}</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Card className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredCreators?.map((creatorMap) => (
          <Card key={creatorMap.id}>
            <CardContent className="p-4">
              <Avatar>
                <AvatarImage src={creatorMap.creator?.image} />
                <AvatarFallback>{getInitials(creatorMap.creator?.email)}</AvatarFallback>
              </Avatar>
              <Badge variant={getStatusVariant(creatorMap.status)}>
                {creatorMap.status}
              </Badge>
              
              {creatorMap.status === "PENDING" && (
                <Form method="post"><input name="mapId" value={creatorMap.id} /><Button type="submit">Accept</Button></Form>
              )}
              {creatorMap.status === "ACTIVE" && (
                <Button variant="default"><Link to={`/feature/creators/${creatorMap.creatorId}`}>Contribute</Link></Button>
              )}
            </CardContent>
          </Card>
        ))}
      </Card>
    </div>
  );
}
```

### Contribute Page (`feature+/contribute+/`)
```tsx
export default function Contribute() {
  const { name, role, editorLinkedAccountsByCreator } = useLoaderData<typeof loader>();
  
  return (
    <>
      <CommonSubHeader userName={name} role={role} />
      <div className="p-6">
        <Button variant="ghost"><Link to="/feature/creators"><ArrowLeft /> Back</Link></Button>
        
        <PermissionCheck role={role} allowedRoles={["editor"]}>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {editorLinkedAccountsByCreator?.map((account) => (
              <Card key={account.id}>
                <CardContent className="p-6">
                  <Avatar><span>{account.account?.email?.charAt(0)}</span></Avatar>
                </CardContent>
                <CardFooter>
                  <Button variant="default">
                    <Link to={`/feature/creators/${account.account?.creatorId}/accounts/${account.account?.id}`}>
                      Enter
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </PermissionCheck>
      </div>
    </>
  );
}
```

---

## 🔧 Version Management Component (`components/common/VersionManager.tsx`)

### Features
- List versions with status badges (PENDING, COMPLETED, REJECTED)
- Create new version dialog with file upload
- Edit version modal
- Delete version confirmation
- Comments section
- Tag management
- Status filtering

### Usage
```tsx
<VersionManager
  contributeId={contributeId}
  versions={versions}
  onVersionSelect={(version) => handleVersionSelect(version)}
  canCreateVersion={true}
  canEditVersion={true}
  canDeleteVersion={false}
/>
```

### Version Card Layout
```
┌─────────────────────────────────────┐
│ Version 3                    [VIEW]│
│ COMPLETED                      [E]│
├─────────────────────────────────────┤
│ This is the version description... │
│ [tag1] [tag2]                      │
│ 📅 2024-01-15  ⏱ 120s  💬 5       │
└─────────────────────────────────────┘
```

---

## 📊 Data Models

### User Roles
```ts
type UserRole = "creator" | "editor";
```

### Account Types
```ts
interface YtCreator {
  id: string;
  creatorId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}
```

### Map Types
```ts
interface CreatorEditorMap {
  id: string;
  creatorId: string;
  editorId: string;
  status: "PENDING" | "ACTIVE" | "INACTIVE";
}

interface AccountEditorMap {
  id: string;
  accountId: string;
  editorId: string;
  status: "ACTIVE" | "INACTIVE";
}
```

### Contribution Types
```ts
interface Contribute {
  id: string;
  accountId: string;
  editorId: string;
  videoId: string;
  thumbnailId: string;
  title: string;
  description?: string;
  tags: string[];
  duration?: number;
}

interface ContributionVersion {
  id: string;
  contributeId: string;
  videoId: string;
  thumbnailId: string;
  title: string;
  description?: string;
  tags: string[];
  duration?: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED";
  versionNumber: number;
  comments?: VersionComment[];
}

interface VersionComment {
  id: string;
  versionId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}
```

---

## 🎯 State Management

### Loaders (Remix) → Server Components (Next.js)
```tsx
// Remix loader
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request);
  const user = await getUserData(session.user.id);
  return json({ user });
};

// Next.js Server Component
export default async function Page() {
  const session = await auth.api.getSession();
  const user = await getUserData(session.user.id);
  return <Dashboard user={user} />;
}
```

### Actions (Remix) → Server Actions (Next.js)
```tsx
// Remix action
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  // handle form submission
};

// Next.js Server Action
export async function action(formData: FormData) {
  "use server";
  // handle form submission
}
```

### useFetcher (Remix) → useActionState/useFormStatus (Next.js)
```tsx
// Remix
const fetcher = useFetcher();
fetcher.submit(data, { method: "post" });

// Next.js
const [state, action, isPending] = useActionState(asyncFormAction, null);
```

---

## 🔐 Authentication

### Better Auth Integration
```tsx
// Client-side
import { signIn, signOut } from "better-auth/react";

// Server-side
import { auth } from "@/lib/auth";
const session = await auth.api.getSession({ headers: req.headers });
```

### Protected Routes
```tsx
// Middleware pattern
export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}
```

---

## 🗺️ Migration Checklist

### Phase 1: Base Components
- [ ] Setup shadcn/ui components in Next.js
- [ ] Create Sidebar component with context
- [ ] Create CommonHeader/CommonSubHeader
- [ ] Setup Tailwind CSS configuration

### Phase 2: Layout & Navigation
- [ ] Create app layout with sidebar
- [ ] Implement role-based navigation
- [ ] Setup authentication flow
- [ ] Create protected route wrapper

### Phase 3: Feature Pages
- [ ] Dashboard page
- [ ] Accounts page (creator)
- [ ] Creators/Editors page
- [ ] Contribute page (editor)
- [ ] Version management

### Phase 4: API Integration
- [ ] Connect loaders to Next.js API routes
- [ ] Implement server actions for mutations
- [ ] Add toast notifications
- [ ] Handle loading/error states

### Phase 5: Polish
- [ ] Add charts/metrics
- [ ] Implement file uploads
- [ ] Add real-time updates (optional)
- [ ] Accessibility improvements

---

## 📦 Dependencies for Next.js

```json
{
  "dependencies": {
    "next": "15.x",
    "react": "18.x",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-sheet": "^4.1.1",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "lucide-react": "^0.344.0",
    "sonner": "^1.4.3",
    "cmdk": "^0.2.1",
    "recharts": "^2.12.2",
    "better-auth": "latest"
  }
}
```

---

## 🎨 Profile Pictures

### Current Source
```ts
// references/apps/web/app/models/profilePictures.ts
export const PROFILE_PICTURES = [
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_21.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_10.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/teams_5.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/teams_1.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_1.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_5.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/teams_2.png",
  "https://cdn.jsdelivr.net/gh/alohe/avatars/png/teams_3.png",
];
```

---

## 🔄 Key Differences: Remix → Next.js

| Aspect | Remix | Next.js |
|--------|-------|---------|
| Data Loading | `loader` | Server Components + `useSuspense` |
| Mutations | `action` | Server Actions + `useActionState` |
| Optimistic UI | `useFetcher` | `useOptimistic` |
| Forms | `<Form>` | Server Actions + `useFormStatus` |
| Error Boundaries | `ErrorBoundary` | `error.tsx` |
| Layouts | `routes/_layout.tsx` | `layout.tsx` |
| i18n | `react-i18next` | `next-intl` |
| Types | `.ts` | `.ts` |

---

## 🚀 Quick Start for Migration

1. **Initialize Next.js with app router**
   ```bash
   npx create-next-app@latest contentcursor --typescript --tailwind --app
   ```

2. **Install dependencies**
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button input card avatar badge dialog dropdown-menu tabs table tooltip sheet separator switch toggle toast select checkbox label popover scroll-area navigation-menu
   npm install better-auth lucide-react sonner cmdk recharts class-variance-authority clsx tailwind-merge next-intl
   ```

3. **Copy base components** from `references/apps/web/app/components/ui/` to `src/components/ui/`

4. **Create common components** based on `ui_context.md` patterns

5. **Set up routes** following the feature structure

6. **Connect to API** endpoints created in `src/app/api/`

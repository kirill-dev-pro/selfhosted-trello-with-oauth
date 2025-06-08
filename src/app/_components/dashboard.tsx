"use client";

import { useRouter } from "next/navigation";
import {
  Plus,
  Settings,
  Users,
  BookOpen,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { api } from "~/trpc/react";
import { useSession, signOut } from "~/lib/auth-client";

export function Dashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: organization } = api.organization.get.useQuery();
  const { data: projects } = api.project.getAll.useQuery(
    { organizationId: organization?.id ?? "" },
    { enabled: !!organization?.id }
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (!session?.user) {
    return <div>Loading...</div>;
  }

  if (!organization) {
    return <div>Loading organization...</div>;
  }

  const userInitials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : session.user.email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {organization.name}
              </h1>
              <span className="text-sm text-gray-500">
                Self-Hosted Project Management
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/settings")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/members")}
              >
                <Users className="h-4 w-4 mr-2" />
                Members
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.user.image ?? undefined}
                        alt={session.user.name ?? ""}
                      />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Projects</h2>
              <p className="text-gray-600 mt-1">
                Manage your team's projects, boards, and documentation
              </p>
            </div>
            <Button onClick={() => router.push("/projects/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/projects/${project.id}/boards`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: project.color ?? "#3b82f6" }}
                  />
                  <span>{project.name}</span>
                </CardTitle>
                {project.description && (
                  <CardDescription>{project.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <LayoutDashboard className="h-4 w-4 mr-1" />
                    {project.boards.length} boards
                  </span>
                  <span className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {project.wikiPages.length} wiki pages
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          {(!projects || projects.length === 0) && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <LayoutDashboard className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No projects yet
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  Create your first project to start organizing your work with
                  boards and wiki pages.
                </p>
                <Button onClick={() => router.push("/projects/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

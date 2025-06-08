"use client";

import React, { useState, useId } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Search,
  FileText,
  Calendar,
  User,
  Edit,
  Eye,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";

interface ProjectWikiPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectWikiPage({ params }: ProjectWikiPageProps) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [pageContent, setPageContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const pageTitleId = useId();
  const pageContentId = useId();
  const searchInputId = useId();

  const { data: project, isLoading: projectLoading } =
    api.project.getById.useQuery({
      id: resolvedParams.id,
    });

  const { data: wikiPages, isLoading: wikiLoading } =
    api.wiki.getByProject.useQuery(
      { projectId: resolvedParams.id },
      { enabled: !!resolvedParams.id }
    );

  const utils = api.useUtils();

  const createWikiPage = api.wiki.createSimple.useMutation({
    onSuccess: (page) => {
      setIsCreateDialogOpen(false);
      setPageTitle("");
      setPageContent("");
      void utils.wiki.getByProject.invalidate({ projectId: resolvedParams.id });
      router.push(`/wiki/${page.id}`);
    },
    onError: (error) => {
      console.error("Failed to create wiki page:", error);
    },
  });

  const handleCreateWikiPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageTitle || !resolvedParams.id) return;

    setIsCreating(true);
    try {
      await createWikiPage.mutateAsync({
        title: pageTitle,
        content: pageContent,
        projectId: resolvedParams.id,
      });
    } catch (error) {
      console.error("Error creating wiki page:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredPages = wikiPages?.filter(
    (page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (page.content &&
        page.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (projectLoading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/projects/${project.id}/boards`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Boards
              </Button>
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: project.color ?? "#3b82f6" }}
                />
                <h1 className="text-2xl font-bold text-gray-900">
                  {project.name} Wiki
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Page
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Wiki Page</DialogTitle>
                    <DialogDescription>
                      Add documentation or notes for your project
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateWikiPage} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={pageTitleId}>Page Title</Label>
                      <Input
                        id={pageTitleId}
                        value={pageTitle}
                        onChange={(e) => setPageTitle(e.target.value)}
                        placeholder="Getting Started Guide"
                        required
                        disabled={isCreating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={pageContentId}>Content</Label>
                      <Textarea
                        id={pageContentId}
                        value={pageContent}
                        onChange={(e) => setPageContent(e.target.value)}
                        placeholder="Write your content here... (Markdown supported)"
                        disabled={isCreating}
                        rows={10}
                        className="font-mono"
                      />
                    </div>
                    {createWikiPage.error && (
                      <div className="text-red-600 text-sm">
                        {createWikiPage.error.message}
                      </div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        disabled={isCreating}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isCreating || !pageTitle}>
                        {isCreating ? "Creating..." : "Create Page"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id={searchInputId}
              type="text"
              placeholder="Search wiki pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Wiki Pages */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Wiki Pages</h2>
            <Badge variant="secondary">
              {filteredPages?.length || 0} pages
            </Badge>
          </div>

          {wikiLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading wiki pages...</p>
            </div>
          ) : filteredPages && filteredPages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPages.map((page) => (
                <Card
                  key={page.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/wiki/${page.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span className="truncate">{page.title}</span>
                    </CardTitle>
                    {page.content && (
                      <CardDescription className="line-clamp-3">
                        {page.content.substring(0, 100)}
                        {page.content.length > 100 && "..."}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {page.createdBy.name || page.createdBy.email}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(page.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {page.lastEditedBy &&
                      page.lastEditedById !== page.createdById && (
                        <div className="mt-2 text-xs text-gray-400">
                          Last edited by{" "}
                          {page.lastEditedBy.name || page.lastEditedBy.email}
                        </div>
                      )}
                    <div className="mt-3 flex justify-between items-center">
                      <Badge variant="outline">
                        {page.published ? "Published" : "Draft"}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? "No pages found" : "No wiki pages yet"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? `No pages match "${searchQuery}". Try a different search term.`
                    : "Create your first wiki page to start documenting your project."}
                </p>
                {!searchQuery && (
                  <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Page
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Wiki Page</DialogTitle>
                        <DialogDescription>
                          Add documentation or notes for your project
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={handleCreateWikiPage}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor={pageTitleId}>Page Title</Label>
                          <Input
                            id={pageTitleId}
                            value={pageTitle}
                            onChange={(e) => setPageTitle(e.target.value)}
                            placeholder="Getting Started Guide"
                            required
                            disabled={isCreating}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={pageContentId}>Content</Label>
                          <Textarea
                            id={pageContentId}
                            value={pageContent}
                            onChange={(e) => setPageContent(e.target.value)}
                            placeholder="Write your content here... (Markdown supported)"
                            disabled={isCreating}
                            rows={10}
                            className="font-mono"
                          />
                        </div>
                        {createWikiPage.error && (
                          <div className="text-red-600 text-sm">
                            {createWikiPage.error.message}
                          </div>
                        )}
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateDialogOpen(false)}
                            disabled={isCreating}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isCreating || !pageTitle}
                          >
                            {isCreating ? "Creating..." : "Create Page"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

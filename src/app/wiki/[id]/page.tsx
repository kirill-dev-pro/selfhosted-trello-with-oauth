"use client";

import React, { useState, useId } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  FileText,
  Calendar,
  User,
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";

interface WikiPageProps {
  params: Promise<{ id: string }>;
}

export default function WikiPage({ params }: WikiPageProps) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const titleId = useId();
  const contentId = useId();

  const { data: wikiPage, isLoading } = api.wiki.getById.useQuery({
    id: resolvedParams.id,
  });

  const utils = api.useUtils();

  const updateWikiPage = api.wiki.update.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      void utils.wiki.getById.invalidate({ id: resolvedParams.id });
    },
    onError: (error) => {
      console.error("Failed to update wiki page:", error);
    },
  });

  const handleStartEdit = () => {
    if (wikiPage) {
      setEditTitle(wikiPage.title);
      setEditContent(wikiPage.content || "");
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle("");
    setEditContent("");
  };

  const handleSave = async () => {
    if (!wikiPage || !editTitle) return;

    setIsSaving(true);
    try {
      await updateWikiPage.mutateAsync({
        id: wikiPage.id,
        title: editTitle,
        content: editContent,
      });
    } catch (error) {
      console.error("Error updating wiki page:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading wiki page...</p>
        </div>
      </div>
    );
  }

  if (!wikiPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Page not found
          </h1>
          <p className="text-gray-500 mb-4">
            The wiki page you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  router.push(`/projects/${wikiPage.project.id}/wiki`)
                }
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Wiki
              </Button>
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: wikiPage.project.color ?? "#3b82f6",
                  }}
                />
                <span className="text-sm text-gray-500">
                  {wikiPage.project.name}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button onClick={handleStartEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !editTitle}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor={titleId}>Title</Label>
                  <Input
                    id={titleId}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-2xl font-bold"
                    disabled={isSaving}
                  />
                </div>
              </div>
            ) : (
              <>
                <CardTitle className="text-3xl">{wikiPage.title}</CardTitle>
                <CardDescription className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Created by{" "}
                    {wikiPage.createdBy.name || wikiPage.createdBy.email}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(wikiPage.createdAt).toLocaleDateString()}
                  </span>
                  <Badge variant={wikiPage.published ? "default" : "secondary"}>
                    {wikiPage.published ? "Published" : "Draft"}
                  </Badge>
                </CardDescription>
                {wikiPage.lastEditedBy &&
                  wikiPage.lastEditedById !== wikiPage.createdById && (
                    <CardDescription className="text-xs text-gray-500">
                      Last edited by{" "}
                      {wikiPage.lastEditedBy.name ||
                        wikiPage.lastEditedBy.email}{" "}
                      on {new Date(wikiPage.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  )}
              </>
            )}
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor={contentId}>Content</Label>
                  <Textarea
                    id={contentId}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={20}
                    className="font-mono"
                    placeholder="Write your content here... (Markdown supported)"
                    disabled={isSaving}
                  />
                </div>
                {updateWikiPage.error && (
                  <div className="text-red-600 text-sm">
                    {updateWikiPage.error.message}
                  </div>
                )}
              </div>
            ) : (
              <div className="prose max-w-none">
                {wikiPage.content ? (
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {wikiPage.content}
                  </div>
                ) : (
                  <div className="text-gray-500 italic text-center py-8">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>This page is empty. Click "Edit" to add content.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Page Metadata */}
        <div className="mt-8 text-sm text-gray-500 text-center">
          <p>
            Page slug:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              {wikiPage.slug}
            </code>
          </p>
        </div>
      </main>
    </div>
  );
}

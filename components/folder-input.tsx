"use client";

import { useState } from "react";
import { FolderOpen, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FolderInputProps {
  onSubmit: (folderUrl: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function FolderInput({ onSubmit, isLoading = false, error }: FolderInputProps) {
  const [folderUrl, setFolderUrl] = useState("");

  const validateGoogleDriveUrl = (url: string): boolean => {
    // Accept various Google Drive folder URL formats
    const patterns = [
      /^https:\/\/drive\.google\.com\/drive\/folders\/[\w-]+/,
      /^https:\/\/drive\.google\.com\/drive\/u\/\d+\/folders\/[\w-]+/,
      /^https:\/\/drive\.google\.com\/open\?id=[\w-]+/,
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderUrl.trim()) {
      onSubmit(folderUrl.trim());
    }
  };

  const isValidUrl = folderUrl.trim() === "" || validateGoogleDriveUrl(folderUrl);

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FolderOpen className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Storefront Image Labeling</CardTitle>
          <CardDescription className="text-base">
            Enter your Google Drive folder URL containing the storefront images to begin labeling.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="folder-url" className="text-sm font-medium">
                Google Drive Folder URL
              </label>
              <Input
                id="folder-url"
                type="url"
                placeholder="https://drive.google.com/drive/folders/..."
                value={folderUrl}
                onChange={(e) => setFolderUrl(e.target.value)}
                className={!isValidUrl ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {!isValidUrl && (
                <p className="text-sm text-destructive">
                  Please enter a valid Google Drive folder URL
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={!folderUrl.trim() || !isValidUrl || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading Images...
                </>
              ) : (
                <>
                  Start Labeling
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium mb-3">Instructions</h3>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Make sure the Google Drive folder is shared (at least view access)</li>
              <li>The folder should contain subfolders named by address</li>
              <li>Each address folder should contain storefront images</li>
              <li>All images must be labeled before you can export the CSV</li>
            </ol>
          </div>

          <div className="mt-4 text-center">
            <a 
              href="https://support.google.com/drive/answer/7166529" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              How to share a Google Drive folder
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

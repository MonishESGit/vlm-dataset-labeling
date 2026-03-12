import { NextRequest, NextResponse } from "next/server";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webContentLink?: string;
  thumbnailLink?: string;
}

interface DriveListResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

// Extract folder ID from various Google Drive URL formats
function extractFolderId(url: string): string | null {
  const patterns = [
    /\/folders\/([a-zA-Z0-9_-]+)/,
    /\/drive\/folders\/([a-zA-Z0-9_-]+)/,
    /\/drive\/u\/\d+\/folders\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Fetch files from a Google Drive folder using the public API
async function fetchFolderContents(folderId: string, apiKey: string): Promise<DriveFile[]> {
  const allFiles: DriveFile[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false`,
      key: apiKey,
      fields: "nextPageToken,files(id,name,mimeType,webContentLink,thumbnailLink)",
      pageSize: "1000",
    });

    if (pageToken) {
      params.set("pageToken", pageToken);
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params.toString()}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to fetch folder contents");
    }

    const data: DriveListResponse = await response.json();
    allFiles.push(...data.files);
    pageToken = data.nextPageToken;
  } while (pageToken);

  return allFiles;
}

// Get direct image URL from Google Drive file ID
function getDirectImageUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

export async function POST(request: NextRequest) {
  try {
    const { folderUrl } = await request.json();

    if (!folderUrl) {
      return NextResponse.json(
        { error: "Folder URL is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Drive API key not configured. Please add GOOGLE_DRIVE_API_KEY to environment variables." },
        { status: 500 }
      );
    }

    const folderId = extractFolderId(folderUrl);
    if (!folderId) {
      return NextResponse.json(
        { error: "Invalid Google Drive folder URL" },
        { status: 400 }
      );
    }

    // Fetch the top-level folder contents (should be address subfolders)
    const topLevelContents = await fetchFolderContents(folderId, apiKey);

    // Filter for folders only (these are the address folders)
    const addressFolders = topLevelContents.filter(
      (file) => file.mimeType === "application/vnd.google-apps.folder"
    );

    if (addressFolders.length === 0) {
      return NextResponse.json(
        { error: "No address folders found in the provided Google Drive folder. Please ensure the folder contains subfolders named by address." },
        { status: 400 }
      );
    }

    // Fetch images from each address folder
    const addresses = await Promise.all(
      addressFolders.map(async (folder) => {
        const folderContents = await fetchFolderContents(folder.id, apiKey);
        
        // Filter for image files
        const imageFiles = folderContents.filter((file) =>
          file.mimeType.startsWith("image/")
        );

        // Sort images by name
        imageFiles.sort((a, b) => a.name.localeCompare(b.name));

        return {
          id: folder.id,
          name: folder.name,
          displayName: folder.name,
          images: imageFiles.map((image) => ({
            id: image.id,
            name: image.name,
            url: getDirectImageUrl(image.id),
            addressId: folder.id,
          })),
        };
      })
    );

    // Filter out addresses with no images and sort by name
    const validAddresses = addresses
      .filter((addr) => addr.images.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    if (validAddresses.length === 0) {
      return NextResponse.json(
        { error: "No images found in any address folder. Please ensure each address folder contains image files." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      addresses: validAddresses,
      totalAddresses: validAddresses.length,
      totalImages: validAddresses.reduce((sum, addr) => sum + addr.images.length, 0),
    });
  } catch (error) {
    console.error("Drive API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch folder contents" },
      { status: 500 }
    );
  }
}

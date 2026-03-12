"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImageViewerProps {
  src: string;
  alt: string;
}

export function ImageViewer({ src, alt }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => setZoom(1);

  return (
    <div className="relative flex flex-col h-full">
      {/* Zoom Controls */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg p-1 border">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleZoomIn}
          disabled={zoom >= 3}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-contain"
              crossOrigin="anonymous"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Image Container */}
      <div className="flex-1 overflow-auto bg-muted/30 rounded-lg flex items-center justify-center">
        <div
          className="transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[50vh] object-contain rounded shadow-lg"
            crossOrigin="anonymous"
          />
        </div>
      </div>
    </div>
  );
}

interface ThumbnailStripProps {
  images: { id: string; url: string; name: string }[];
  currentImageId: string;
  onSelectImage: (imageId: string) => void;
  isImageLabeled: (imageId: string) => boolean;
}

export function ThumbnailStrip({
  images,
  currentImageId,
  onSelectImage,
  isImageLabeled,
}: ThumbnailStripProps) {
  return (
    <div className="flex gap-2 overflow-x-auto py-2 px-1">
      {images.map((image, idx) => {
        const isSelected = image.id === currentImageId;
        const isLabeled = isImageLabeled(image.id);

        return (
          <button
            key={image.id}
            onClick={() => onSelectImage(image.id)}
            className={cn(
              "relative shrink-0 rounded-lg overflow-hidden border-2 transition-all",
              isSelected
                ? "border-primary ring-2 ring-primary/20"
                : "border-transparent hover:border-muted-foreground/50"
            )}
          >
            <img
              src={image.url}
              alt={`Thumbnail ${idx + 1}`}
              className="w-20 h-14 object-cover"
              crossOrigin="anonymous"
            />
            {/* Completion indicator */}
            <div
              className={cn(
                "absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-white",
                isLabeled ? "bg-green-500" : "bg-muted-foreground/30"
              )}
            />
            {/* Image number */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-0.5">
              {idx + 1}
            </div>
          </button>
        );
      })}
    </div>
  );
}

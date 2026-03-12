"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Keyboard, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AddressSidebar } from "@/components/address-sidebar";
import { ProgressBar } from "@/components/progress-bar";
import { ImageViewer, ThumbnailStrip } from "@/components/image-viewer";
import { AnnotationForm } from "@/components/annotation-form";
import { ExportDialog } from "@/components/export-dialog";
import { FolderInput } from "@/components/folder-input";
import { useLabelStore } from "@/hooks/use-label-store";
import { mockAddresses } from "@/lib/mock-data";
import { validateImageLabel, createEmptyLabel, type Address } from "@/lib/types";

export default function LabelingPage() {
  const [folderUrl, setFolderUrl] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingFolder, setIsLoadingFolder] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);
  const [currentAddressIndex, setCurrentAddressIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { labels, isLoaded, lastSaved, getLabel, updateLabel, resetLabel, resetAddressLabels } = useLabelStore();

  // Derived values (not hooks, so safe after early returns)
  const currentAddress = addresses[currentAddressIndex];
  const currentImage = currentAddress?.images[currentImageIndex];
  const currentLabel = currentImage ? getLabel(currentImage.id) : createEmptyLabel();

  // Check if current image is labeled - MUST be before any conditional returns
  const isImageLabeled = useCallback((imageId: string) => {
    const label = labels[imageId];
    return label ? validateImageLabel(label).isValid : false;
  }, [labels]);

  // Navigation functions - MUST be before any conditional returns
  const goToNextImage = useCallback(() => {
    if (!currentAddress) return;
    
    if (currentImageIndex < currentAddress.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else if (currentAddressIndex < addresses.length - 1) {
      setCurrentAddressIndex(currentAddressIndex + 1);
      setCurrentImageIndex(0);
    }
  }, [currentAddress, currentImageIndex, currentAddressIndex, addresses.length]);

  const goToPrevImage = useCallback(() => {
    if (!currentAddress) return;
    
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (currentAddressIndex > 0) {
      const prevAddress = addresses[currentAddressIndex - 1];
      setCurrentAddressIndex(currentAddressIndex - 1);
      setCurrentImageIndex(prevAddress.images.length - 1);
    }
  }, [currentAddress, currentImageIndex, currentAddressIndex, addresses]);

  const goToNextAddress = useCallback(() => {
    if (currentAddressIndex < addresses.length - 1) {
      setCurrentAddressIndex(currentAddressIndex + 1);
      setCurrentImageIndex(0);
    }
  }, [currentAddressIndex, addresses.length]);

  const goToPrevAddress = useCallback(() => {
    if (currentAddressIndex > 0) {
      setCurrentAddressIndex(currentAddressIndex - 1);
      setCurrentImageIndex(0);
    }
  }, [currentAddressIndex]);

  // Select specific address/image
  const selectAddress = useCallback((addressId: string) => {
    const index = addresses.findIndex(a => a.id === addressId);
    if (index !== -1) {
      setCurrentAddressIndex(index);
      setCurrentImageIndex(0);
    }
  }, [addresses]);

  const selectImage = useCallback((addressId: string, imageId: string) => {
    const addressIndex = addresses.findIndex(a => a.id === addressId);
    if (addressIndex !== -1) {
      const imageIndex = addresses[addressIndex].images.findIndex(i => i.id === imageId);
      if (imageIndex !== -1) {
        setCurrentAddressIndex(addressIndex);
        setCurrentImageIndex(imageIndex);
      }
    }
  }, [addresses]);

  // Handle label updates
  const handleUpdateLabel = useCallback((updates: Parameters<typeof updateLabel>[1]) => {
    if (currentImage) {
      updateLabel(currentImage.id, updates);
    }
  }, [currentImage, updateLabel]);

  // Reset handlers
  const handleResetImage = useCallback(() => {
    if (currentImage) {
      resetLabel(currentImage.id);
    }
  }, [currentImage, resetLabel]);

  const handleResetAddress = useCallback(() => {
    if (currentAddress) {
      resetAddressLabels(currentAddress.images.map(img => img.id));
    }
  }, [currentAddress, resetAddressLabels]);

  // Handle folder URL submission
  const handleFolderSubmit = useCallback(async (url: string) => {
    setIsLoadingFolder(true);
    setFolderError(null);
    
    try {
      // For now, we'll use mock data since Google Drive API integration 
      // would require OAuth setup. In production, this would fetch from the API.
      // Simulating a network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFolderUrl(url);
      setAddresses(mockAddresses);
    } catch {
      setFolderError("Failed to load images from the folder. Please check the URL and try again.");
    } finally {
      setIsLoadingFolder(false);
    }
  }, []);

  // Keyboard shortcuts - MUST be before any conditional returns
  useEffect(() => {
    // Don't add listener if we're on the folder input screen
    if (!folderUrl) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goToPrevImage();
          break;
        case "ArrowRight":
          e.preventDefault();
          goToNextImage();
          break;
        case "ArrowUp":
          e.preventDefault();
          goToPrevAddress();
          break;
        case "ArrowDown":
          e.preventDefault();
          goToNextAddress();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [folderUrl, goToNextImage, goToPrevImage, goToNextAddress, goToPrevAddress]);

  // Show folder input if no folder URL yet
  if (!folderUrl) {
    return (
      <FolderInput 
        onSubmit={handleFolderSubmit} 
        isLoading={isLoadingFolder}
        error={folderError}
      />
    );
  }

  // Calculate navigation state
  const canGoPrev = currentAddressIndex > 0 || currentImageIndex > 0;
  const canGoNext = currentAddressIndex < addresses.length - 1 || 
    (currentAddress && currentImageIndex < currentAddress.images.length - 1);

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading labels...</p>
        </div>
      </div>
    );
  }

  if (!currentAddress || !currentImage) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No images to label</p>
        </div>
      </div>
    );
  }

  const validation = validateImageLabel(currentLabel);

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-background">
        {/* Progress Bar */}
        <ProgressBar addresses={addresses} labels={labels} lastSaved={lastSaved} />

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-72 shrink-0 h-full overflow-hidden">
            <AddressSidebar
              addresses={addresses}
              labels={labels}
              currentAddressId={currentAddress.id}
              currentImageId={currentImage.id}
              onSelectAddress={selectAddress}
              onSelectImage={selectImage}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header with Address Info */}
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <div>
                <h1 className="font-semibold text-lg">{currentAddress.displayName}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Image {currentImageIndex + 1} of {currentAddress.images.length}</span>
                  <span>•</span>
                  <span>Address {currentAddressIndex + 1} of {addresses.length}</span>
                  {!validation.isValid && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="text-amber-600 border-amber-600 gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {validation.missingFields.length} field(s) missing
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Keyboard className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="text-sm space-y-1">
                      <p><strong>← →</strong> Previous/Next Image</p>
                      <p><strong>↑ ↓</strong> Previous/Next Address</p>
                    </div>
                  </TooltipContent>
                </Tooltip>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <RotateCcw className="h-3 w-3" />
                      Reset Image
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Image Labels?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will clear all labels for the current image. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetImage}>Reset</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <RotateCcw className="h-3 w-3" />
                      Reset Address
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset All Labels for This Address?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will clear all labels for all images in the current address ({currentAddress.images.length} images). This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetAddress}>Reset All</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <ExportDialog addresses={addresses} labels={labels} />
              </div>
            </div>

            {/* Image and Form */}
            <div className="flex-1 flex overflow-hidden">
              {/* Image Section */}
              <div className="w-1/2 flex flex-col border-r p-4">
                <div className="flex-1 min-h-0">
                  <ImageViewer src={currentImage.url} alt={currentImage.name} />
                </div>
                <ThumbnailStrip
                  images={currentAddress.images}
                  currentImageId={currentImage.id}
                  onSelectImage={(imageId) => {
                    const idx = currentAddress.images.findIndex(i => i.id === imageId);
                    if (idx !== -1) setCurrentImageIndex(idx);
                  }}
                  isImageLabeled={isImageLabeled}
                />
              </div>

              {/* Annotation Form Section */}
              <div className="w-1/2 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4">
                  <AnnotationForm
                    label={currentLabel}
                    onUpdate={handleUpdateLabel}
                  />
                </div>

                {/* Navigation Footer */}
                <div className="border-t px-4 py-3 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={goToPrevImage}
                    disabled={!canGoPrev}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    {currentImage.name}
                  </div>

                  <Button
                    onClick={goToNextImage}
                    disabled={!canGoNext}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

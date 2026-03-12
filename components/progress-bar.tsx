"use client";

import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MapPin, Image, CheckCircle, Clock } from "lucide-react";
import { AddressData, LabelStore, validateImageLabel } from "@/lib/types";

interface ProgressBarProps {
  addresses: AddressData[];
  labels: LabelStore;
  lastSaved: Date | null;
}

export function ProgressBar({ addresses, labels, lastSaved }: ProgressBarProps) {
  const stats = useMemo(() => {
    let totalImages = 0;
    let labeledImages = 0;
    let completedAddresses = 0;

    for (const address of addresses) {
      let addressLabeledCount = 0;
      for (const image of address.images) {
        totalImages++;
        const label = labels[image.id];
        if (label && validateImageLabel(label).isValid) {
          labeledImages++;
          addressLabeledCount++;
        }
      }
      if (addressLabeledCount === address.images.length) {
        completedAddresses++;
      }
    }

    const imageProgress = totalImages > 0 ? Math.round((labeledImages / totalImages) * 100) : 0;
    const addressProgress = addresses.length > 0 ? Math.round((completedAddresses / addresses.length) * 100) : 0;

    return {
      totalAddresses: addresses.length,
      completedAddresses,
      remainingAddresses: addresses.length - completedAddresses,
      totalImages,
      labeledImages,
      remainingImages: totalImages - labeledImages,
      imageProgress,
      addressProgress,
    };
  }, [addresses, labels]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-card border-b px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Progress Stats */}
        <div className="flex flex-wrap items-center gap-6">
          {/* Address Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Addresses</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                {stats.completedAddresses}
              </Badge>
              <span className="text-muted-foreground text-xs">/</span>
              <Badge variant="secondary" className="font-mono">
                {stats.totalAddresses}
              </Badge>
            </div>
          </div>

          {/* Image Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Image className="h-4 w-4" />
              <span className="text-sm font-medium">Images</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                {stats.labeledImages}
              </Badge>
              <span className="text-muted-foreground text-xs">/</span>
              <Badge variant="secondary" className="font-mono">
                {stats.totalImages}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3 min-w-[200px]">
            <Progress value={stats.imageProgress} className="h-2 flex-1" />
            <span className="text-sm font-bold text-primary">{stats.imageProgress}%</span>
          </div>
        </div>

        {/* Save Status */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {lastSaved ? (
            <>
              <Clock className="h-4 w-4" />
              <span>Saved at {formatTime(lastSaved)}</span>
            </>
          ) : (
            <span>Auto-saving enabled</span>
          )}
        </div>
      </div>
    </div>
  );
}

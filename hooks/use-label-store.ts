"use client";

import { useState, useEffect, useCallback } from "react";
import { ImageLabel, LabelStore, createEmptyLabel } from "@/lib/types";

const STORAGE_KEY = "storefront-labels";

export const useLabelStore = () => {
  const [labels, setLabels] = useState<LabelStore>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLabels(JSON.parse(stored));
      }
    } catch {
      console.error("Failed to load labels from storage");
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever labels change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(labels));
        setLastSaved(new Date());
      } catch {
        console.error("Failed to save labels to storage");
      }
    }
  }, [labels, isLoaded]);

  const getLabel = useCallback((imageId: string): ImageLabel => {
    return labels[imageId] || createEmptyLabel();
  }, [labels]);

  const updateLabel = useCallback((imageId: string, updates: Partial<ImageLabel>) => {
    setLabels(prev => ({
      ...prev,
      [imageId]: {
        ...(prev[imageId] || createEmptyLabel()),
        ...updates
      }
    }));
  }, []);

  const resetLabel = useCallback((imageId: string) => {
    setLabels(prev => {
      const updated = { ...prev };
      delete updated[imageId];
      return updated;
    });
  }, []);

  const resetAddressLabels = useCallback((imageIds: string[]) => {
    setLabels(prev => {
      const updated = { ...prev };
      imageIds.forEach(id => delete updated[id]);
      return updated;
    });
  }, []);

  const clearAllLabels = useCallback(() => {
    setLabels({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    labels,
    isLoaded,
    lastSaved,
    getLabel,
    updateLabel,
    resetLabel,
    resetAddressLabels,
    clearAllLabels
  };
};

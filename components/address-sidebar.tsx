"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, MapPin, Image as ImageIcon, Check, Clock, Circle, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddressData, LabelStore, AddressStatus, validateImageLabel, createEmptyLabel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AddressSidebarProps {
  addresses: AddressData[];
  labels: LabelStore;
  currentAddressId: string | null;
  currentImageId: string | null;
  onSelectAddress: (addressId: string) => void;
  onSelectImage: (addressId: string, imageId: string) => void;
}

type FilterType = "all" | "completed" | "incomplete" | "not_started";

export function AddressSidebar({
  addresses,
  labels,
  currentAddressId,
  currentImageId,
  onSelectAddress,
  onSelectImage,
}: AddressSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedAddresses, setExpandedAddresses] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterType>("all");

  // Calculate status for each address
  const addressStatuses = useMemo(() => {
    const statuses: Record<string, { status: AddressStatus; labeledCount: number; totalCount: number }> = {};
    
    for (const address of addresses) {
      let labeledCount = 0;
      for (const image of address.images) {
        const label = labels[image.id];
        if (label && validateImageLabel(label).isValid) {
          labeledCount++;
        }
      }
      
      const totalCount = address.images.length;
      let status: AddressStatus = "not_started";
      
      if (labeledCount === totalCount) {
        status = "completed";
      } else if (labeledCount > 0) {
        status = "in_progress";
      }
      
      statuses[address.id] = { status, labeledCount, totalCount };
    }
    
    return statuses;
  }, [addresses, labels]);

  // Filter and search addresses
  const filteredAddresses = useMemo(() => {
    return addresses.filter(address => {
      // Search filter
      const matchesSearch = address.displayName.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const status = addressStatuses[address.id]?.status;
      let matchesFilter = true;
      
      if (filter === "completed") {
        matchesFilter = status === "completed";
      } else if (filter === "incomplete") {
        matchesFilter = status === "in_progress";
      } else if (filter === "not_started") {
        matchesFilter = status === "not_started";
      }
      
      return matchesSearch && matchesFilter;
    });
  }, [addresses, searchQuery, filter, addressStatuses]);

  const toggleExpanded = (addressId: string) => {
    setExpandedAddresses(prev => {
      const next = new Set(prev);
      if (next.has(addressId)) {
        next.delete(addressId);
      } else {
        next.add(addressId);
      }
      return next;
    });
  };

  const getStatusIcon = (status: AddressStatus) => {
    switch (status) {
      case "completed":
        return <Check className="h-3 w-3 text-green-500" />;
      case "in_progress":
        return <Clock className="h-3 w-3 text-amber-500" />;
      default:
        return <Circle className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: AddressStatus) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-600 text-xs">Done</Badge>;
      case "in_progress":
        return <Badge variant="default" className="bg-amber-600 text-xs">WIP</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">New</Badge>;
    }
  };

  const isImageLabeled = (imageId: string) => {
    const label = labels[imageId];
    return label && validateImageLabel(label).isValid;
  };

  return (
    <div className="flex flex-col h-full bg-card border-r">
      {/* Search and Filter Header */}
      <div className="p-3 border-b space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search addresses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Filter className="h-4 w-4 mr-2" />
              {filter === "all" ? "All Addresses" : 
               filter === "completed" ? "Completed" :
               filter === "incomplete" ? "In Progress" : "Not Started"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuCheckboxItem
              checked={filter === "all"}
              onCheckedChange={() => setFilter("all")}
            >
              All Addresses
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filter === "completed"}
              onCheckedChange={() => setFilter("completed")}
            >
              Completed
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filter === "incomplete"}
              onCheckedChange={() => setFilter("incomplete")}
            >
              In Progress
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filter === "not_started"}
              onCheckedChange={() => setFilter("not_started")}
            >
              Not Started
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Address List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {filteredAddresses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No addresses match your search
            </div>
          ) : (
            filteredAddresses.map((address) => {
              const { status, labeledCount, totalCount } = addressStatuses[address.id];
              const isExpanded = expandedAddresses.has(address.id);
              const isCurrentAddress = currentAddressId === address.id;

              return (
                <Collapsible
                  key={address.id}
                  open={isExpanded}
                  onOpenChange={() => toggleExpanded(address.id)}
                >
                  <div
                    className={cn(
                      "rounded-lg mb-1 transition-colors",
                      isCurrentAddress ? "bg-primary/10" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-1 p-2">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <button
                        onClick={() => onSelectAddress(address.id)}
                        className="flex-1 flex items-start gap-2 text-left min-w-0"
                      >
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">
                            {address.displayName}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {getStatusIcon(status)}
                            <span className="text-xs text-muted-foreground">
                              {labeledCount}/{totalCount} images
                            </span>
                          </div>
                        </div>
                      </button>
                      {getStatusBadge(status)}
                    </div>
                  </div>

                  <CollapsibleContent>
                    <div className="ml-6 pl-4 border-l border-border space-y-1 pb-2">
                      {address.images.map((image, idx) => {
                        const isLabeled = isImageLabeled(image.id);
                        const isCurrentImage = currentImageId === image.id;

                        return (
                          <button
                            key={image.id}
                            onClick={() => onSelectImage(address.id, image.id)}
                            className={cn(
                              "w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm transition-colors",
                              isCurrentImage
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted/50"
                            )}
                          >
                            <ImageIcon className="h-3 w-3 shrink-0" />
                            <span className="flex-1 truncate">Image {idx + 1}</span>
                            {isLabeled ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Circle className="h-3 w-3 text-muted-foreground" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

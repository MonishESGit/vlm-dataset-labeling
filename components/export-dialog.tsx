"use client";

import { useState } from "react";
import { Download, AlertTriangle, CheckCircle, FileText, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AddressData, LabelStore, validateAllLabels } from "@/lib/types";
import { generateMainCSV, generateAddressSummaryCSV, downloadCSV } from "@/lib/csv-export";

interface ExportDialogProps {
  addresses: AddressData[];
  labels: LabelStore;
}

export function ExportDialog({ addresses, labels }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [includeMainCSV, setIncludeMainCSV] = useState(true);
  const [includeSummaryCSV, setIncludeSummaryCSV] = useState(true);

  const validation = validateAllLabels(addresses, labels);

  const handleExport = () => {
    if (includeMainCSV) {
      const mainCSV = generateMainCSV(addresses, labels);
      downloadCSV(mainCSV, "storefront_labels.csv");
    }
    
    if (includeSummaryCSV) {
      const summaryCSV = generateAddressSummaryCSV(addresses, labels);
      downloadCSV(summaryCSV, "address_summary.csv");
    }
    
    setIsOpen(false);
  };

  const totalImages = addresses.reduce((sum, addr) => sum + addr.images.length, 0);
  const labeledImages = totalImages - validation.incompleteImages.length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Labels to CSV
          </DialogTitle>
          <DialogDescription>
            Download your annotations as CSV files for further processing.
          </DialogDescription>
        </DialogHeader>

        {/* Validation Status */}
        {!validation.isValid ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Cannot Export - Incomplete Labels</AlertTitle>
            <AlertDescription>
              All images must be fully labeled before exporting. You have{" "}
              <strong>{validation.incompleteImages.length}</strong> incomplete image(s).
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-500 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700">Ready to Export</AlertTitle>
            <AlertDescription className="text-green-600">
              All {totalImages} images have been fully labeled and are ready for export.
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Summary */}
        <div className="grid grid-cols-3 gap-4 py-2">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{addresses.length}</div>
            <div className="text-xs text-muted-foreground">Total Addresses</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{labeledImages}</div>
            <div className="text-xs text-muted-foreground">Labeled Images</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-amber-600">
              {validation.incompleteImages.length}
            </div>
            <div className="text-xs text-muted-foreground">Remaining</div>
          </div>
        </div>

        {/* Incomplete Images List */}
        {!validation.isValid && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Incomplete Images:</h4>
            <ScrollArea className="h-48 border rounded-lg">
              <div className="p-3 space-y-2">
                {validation.incompleteImages.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-2 bg-muted/50 rounded text-sm"
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.address}</div>
                      <div className="text-muted-foreground">{item.image}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.missing.map((field) => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Export Options */}
        {validation.isValid && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Export Options:</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="main-csv"
                  checked={includeMainCSV}
                  onCheckedChange={(checked) => setIncludeMainCSV(!!checked)}
                />
                <div className="flex-1">
                  <label htmlFor="main-csv" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    Main Labels CSV
                  </label>
                  <p className="text-xs text-muted-foreground">
                    All image labels with full annotation data
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="summary-csv"
                  checked={includeSummaryCSV}
                  onCheckedChange={(checked) => setIncludeSummaryCSV(!!checked)}
                />
                <div className="flex-1">
                  <label htmlFor="summary-csv" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Address Summary CSV
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Per-address completion statistics
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={!validation.isValid || (!includeMainCSV && !includeSummaryCSV)}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download CSV{includeMainCSV && includeSummaryCSV ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

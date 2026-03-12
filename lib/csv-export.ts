import { AddressData, ImageLabel, LabelStore, createEmptyLabel, validateImageLabel } from "./types";

// Generate main CSV with all image labels
export const generateMainCSV = (
  addresses: AddressData[],
  labels: LabelStore
): string => {
  const headers = [
    "address",
    "image_path",
    "step_1a_visibility",
    "gas_station_override",
    "obstruction_type",
    "step_1b_routing",
    "evidence_type",
    "notes",
    "annotator_confidence",
    "multiple_businesses_visible",
    "outside_schema_guess"
  ];

  const rows: string[][] = [headers];

  for (const address of addresses) {
    for (const image of address.images) {
      const label = labels[image.id] || createEmptyLabel();
      const imagePath = `${address.name}/${image.name}`;
      
      rows.push([
        escapeCSV(address.displayName),
        escapeCSV(imagePath),
        label.step_1a_visibility || "",
        label.gas_station_override || "",
        label.obstruction_type || "",
        label.step_1b_routing || "",
        label.evidence_type.join("|"), // Pipe-separated for multi-select
        escapeCSV(label.notes),
        label.annotator_confidence || "",
        label.multiple_businesses_visible || "",
        escapeCSV(label.outside_schema_guess)
      ]);
    }
  }

  return rows.map(row => row.join(",")).join("\n");
};

// Generate address summary CSV
export const generateAddressSummaryCSV = (
  addresses: AddressData[],
  labels: LabelStore
): string => {
  const headers = [
    "address",
    "total_images",
    "labeled_images",
    "completion_percentage",
    "status"
  ];

  const rows: string[][] = [headers];

  for (const address of addresses) {
    let labeledCount = 0;
    
    for (const image of address.images) {
      const label = labels[image.id];
      if (label && validateImageLabel(label).isValid) {
        labeledCount++;
      }
    }

    const totalImages = address.images.length;
    const completionPct = totalImages > 0 
      ? Math.round((labeledCount / totalImages) * 100) 
      : 0;
    
    let status = "not_started";
    if (labeledCount === totalImages) {
      status = "completed";
    } else if (labeledCount > 0) {
      status = "in_progress";
    }

    rows.push([
      escapeCSV(address.displayName),
      totalImages.toString(),
      labeledCount.toString(),
      `${completionPct}%`,
      status
    ]);
  }

  return rows.map(row => row.join(",")).join("\n");
};

// Escape CSV values
const escapeCSV = (value: string): string => {
  if (!value) return "";
  // If contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

// Download CSV file
export const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

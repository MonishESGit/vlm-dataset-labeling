// Label types for storefront annotation

export type Step1AVisibility = "NOT_A_STOREFRONT" | "OBSTRUCTED_VIEW" | "STOREFRONT_VISIBLE" | null;

export type GasStationOverride = "YES" | "NO" | null;

export type ObstructionType =
  | "VEHICLE"
  | "TREE_POLE"
  | "CROPPING_OUT_OF_FRAME"
  | "GLARE_REFLECTION"
  | "DARKNESS"
  | "BLUR"
  | "WEATHER"
  | "LOW_RESOLUTION"
  | "CROWD"
  | "OTHER"
  | "NONE"
  | null;

export type Step1BRouting =
  | "G52_BUILDING_HARDWARE_GARDEN_MOBILEHOME"
  | "G53_GENERAL_MERCH_DEPARTMENT"
  | "G54_FOOD_STORES"
  | "G55_AUTO_DEALERS_GAS"
  | "G56_APPAREL_SHOES_ACCESSORIES"
  | "G57_FURNITURE_FURNISHINGS_ELECTRONICS_MUSIC"
  | "G59_OTHER_SPECIALTY_RETAIL"
  | "UNCERTAIN_INSUFFICIENT_EVIDENCE"
  | "OTHER_OUTSIDE_SCHEMA"
  | null;

export type EvidenceType = "READABLE_TEXT" | "LOGO_BRAND" | "DISTINCTIVE_OBJECTS_LAYOUT";

export type AnnotatorConfidence = "HIGH" | "MEDIUM" | "LOW" | null;

export type MultipleBusiness = "YES" | "NO" | null;

export interface ImageLabel {
  step_1a_visibility: Step1AVisibility;
  gas_station_override: GasStationOverride;
  obstruction_type: ObstructionType;
  step_1b_routing: Step1BRouting;
  evidence_type: EvidenceType[];
  notes: string;
  annotator_confidence: AnnotatorConfidence;
  multiple_businesses_visible: MultipleBusiness;
  outside_schema_guess: string;
}

export interface ImageData {
  id: string;
  name: string;
  url: string;
  addressId: string;
}

export interface AddressData {
  id: string;
  name: string;
  displayName: string;
  images: ImageData[];
}

export interface LabelStore {
  [imageId: string]: ImageLabel;
}

export type AddressStatus = "not_started" | "in_progress" | "completed";

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  message: string;
}

export const createEmptyLabel = (): ImageLabel => ({
  step_1a_visibility: null,
  gas_station_override: null,
  obstruction_type: null,
  step_1b_routing: null,
  evidence_type: [],
  notes: "",
  annotator_confidence: null,
  multiple_businesses_visible: null,
  outside_schema_guess: "",
});

// Validation logic for determining if an image is fully labeled
export const validateImageLabel = (label: ImageLabel): ValidationResult => {
  const missingFields: string[] = [];
  
  // Step 1A is always required
  if (!label.step_1a_visibility) {
    missingFields.push("Step 1A Visibility");
    return {
      isValid: false,
      missingFields,
      message: "Step 1A Visibility is required"
    };
  }
  
  // If NOT_A_STOREFRONT, gas_station_override is required
  if (label.step_1a_visibility === "NOT_A_STOREFRONT") {
    if (!label.gas_station_override) {
      missingFields.push("Gas Station Override");
    }
    // If gas station YES, Step 1B is required
    if (label.gas_station_override === "YES" && !label.step_1b_routing) {
      missingFields.push("Step 1B Routing");
    }
  }
  
  // If OBSTRUCTED_VIEW, obstruction_type and Step 1B are required
  if (label.step_1a_visibility === "OBSTRUCTED_VIEW") {
    if (!label.obstruction_type || label.obstruction_type === "NONE") {
      missingFields.push("Obstruction Type");
    }
    if (!label.step_1b_routing) {
      missingFields.push("Step 1B Routing");
    }
  }
  
  // If STOREFRONT_VISIBLE, Step 1B is required
  if (label.step_1a_visibility === "STOREFRONT_VISIBLE") {
    if (!label.step_1b_routing) {
      missingFields.push("Step 1B Routing");
    }
  }
  
  // If Step 1B is OTHER_OUTSIDE_SCHEMA, outside_schema_guess is required
  if (label.step_1b_routing === "OTHER_OUTSIDE_SCHEMA" && !label.outside_schema_guess.trim()) {
    missingFields.push("Outside Schema Guess");
  }
  
  // Evidence type is required when Step 1B is shown
  const showStep1B = 
    label.step_1a_visibility === "STOREFRONT_VISIBLE" ||
    label.step_1a_visibility === "OBSTRUCTED_VIEW" ||
    (label.step_1a_visibility === "NOT_A_STOREFRONT" && label.gas_station_override === "YES");
  
  if (showStep1B && label.evidence_type.length === 0) {
    missingFields.push("Evidence Type");
  }
  
  // Annotator confidence is always required
  if (!label.annotator_confidence) {
    missingFields.push("Annotator Confidence");
  }
  
  // Multiple businesses visible is always required
  if (!label.multiple_businesses_visible) {
    missingFields.push("Multiple Businesses Visible");
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
    message: missingFields.length > 0 
      ? `Missing: ${missingFields.join(", ")}`
      : "Complete"
  };
};

// Check if all images in dataset are fully labeled
export const validateAllLabels = (
  addresses: AddressData[], 
  labels: LabelStore
): { isValid: boolean; incompleteImages: { address: string; image: string; missing: string[] }[] } => {
  const incompleteImages: { address: string; image: string; missing: string[] }[] = [];
  
  for (const address of addresses) {
    for (const image of address.images) {
      const label = labels[image.id] || createEmptyLabel();
      const validation = validateImageLabel(label);
      
      if (!validation.isValid) {
        incompleteImages.push({
          address: address.displayName,
          image: image.name,
          missing: validation.missingFields
        });
      }
    }
  }
  
  return {
    isValid: incompleteImages.length === 0,
    incompleteImages
  };
};

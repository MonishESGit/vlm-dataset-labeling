"use client";

import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ImageLabel,
  Step1AVisibility,
  GasStationOverride,
  ObstructionType,
  Step1BRouting,
  EvidenceType,
  AnnotatorConfidence,
  MultipleBusiness,
  validateImageLabel
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface AnnotationFormProps {
  label: ImageLabel;
  onUpdate: (updates: Partial<ImageLabel>) => void;
}

const step1aOptions: { value: Step1AVisibility; label: string; description: string }[] = [
  { value: "STOREFRONT_VISIBLE", label: "Storefront Visible", description: "Clear view of the storefront" },
  { value: "OBSTRUCTED_VIEW", label: "Obstructed View", description: "Partially blocked or unclear" },
  { value: "NOT_A_STOREFRONT", label: "Not a Storefront", description: "No storefront in image" },
];

const obstructionOptions: { value: ObstructionType; label: string }[] = [
  { value: "VEHICLE", label: "Vehicle" },
  { value: "TREE_POLE", label: "Tree/Pole" },
  { value: "CROPPING_OUT_OF_FRAME", label: "Cropping/Out of Frame" },
  { value: "GLARE_REFLECTION", label: "Glare/Reflection" },
  { value: "DARKNESS", label: "Darkness" },
  { value: "BLUR", label: "Blur" },
  { value: "WEATHER", label: "Weather" },
  { value: "LOW_RESOLUTION", label: "Low Resolution" },
  { value: "CROWD", label: "Crowd" },
  { value: "OTHER", label: "Other" },
];

const step1bOptions: { value: Step1BRouting; label: string }[] = [
  { value: "G52_BUILDING_HARDWARE_GARDEN_MOBILEHOME", label: "G52 - Building, Hardware, Garden" },
  { value: "G53_GENERAL_MERCH_DEPARTMENT", label: "G53 - General Merchandise/Dept" },
  { value: "G54_FOOD_STORES", label: "G54 - Food Stores" },
  { value: "G55_AUTO_DEALERS_GAS", label: "G55 - Auto Dealers/Gas" },
  { value: "G56_APPAREL_SHOES_ACCESSORIES", label: "G56 - Apparel/Shoes/Accessories" },
  { value: "G57_FURNITURE_FURNISHINGS_ELECTRONICS_MUSIC", label: "G57 - Furniture/Electronics/Music" },
  { value: "G59_OTHER_SPECIALTY_RETAIL", label: "G59 - Other Specialty Retail" },
  { value: "UNCERTAIN_INSUFFICIENT_EVIDENCE", label: "Uncertain / Insufficient Evidence" },
  { value: "OTHER_OUTSIDE_SCHEMA", label: "Other - Outside Schema" },
];

const evidenceOptions: { value: EvidenceType; label: string }[] = [
  { value: "READABLE_TEXT", label: "Readable Text" },
  { value: "LOGO_BRAND", label: "Logo/Brand" },
  { value: "DISTINCTIVE_OBJECTS_LAYOUT", label: "Distinctive Objects/Layout" },
];

const confidenceOptions: { value: AnnotatorConfidence; label: string; color: string }[] = [
  { value: "HIGH", label: "High", color: "bg-green-500" },
  { value: "MEDIUM", label: "Medium", color: "bg-yellow-500" },
  { value: "LOW", label: "Low", color: "bg-red-500" },
];

export function AnnotationForm({ label, onUpdate }: AnnotationFormProps) {
  const validation = validateImageLabel(label);

  // Determine which sections to show based on logic
  const showGasStationOverride = label.step_1a_visibility === "NOT_A_STOREFRONT";
  const showObstructionType = label.step_1a_visibility === "OBSTRUCTED_VIEW";
  const showStep1B = 
    label.step_1a_visibility === "STOREFRONT_VISIBLE" ||
    label.step_1a_visibility === "OBSTRUCTED_VIEW" ||
    (label.step_1a_visibility === "NOT_A_STOREFRONT" && label.gas_station_override === "YES");
  const showOutsideSchemaGuess = label.step_1b_routing === "OTHER_OUTSIDE_SCHEMA";

  const handleEvidenceToggle = useCallback((value: EvidenceType) => {
    const current = label.evidence_type;
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onUpdate({ evidence_type: updated });
  }, [label.evidence_type, onUpdate]);

  return (
    <div className="space-y-4">
      {/* Validation Status */}
      <div className="flex items-center gap-2">
        <Badge variant={validation.isValid ? "default" : "destructive"} className={cn(
          validation.isValid ? "bg-green-600" : "bg-amber-600"
        )}>
          {validation.isValid ? "Complete" : "Incomplete"}
        </Badge>
        {!validation.isValid && (
          <span className="text-sm text-muted-foreground">{validation.message}</span>
        )}
      </div>

      {/* Category 1: Step 1A Visibility */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            Step 1A: Visibility Gate
            {!label.step_1a_visibility && <Badge variant="outline" className="text-amber-600 border-amber-600">Required</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={label.step_1a_visibility || ""}
            onValueChange={(value) => {
              const updates: Partial<ImageLabel> = { step_1a_visibility: value as Step1AVisibility };
              // Reset dependent fields when changing
              if (value !== "NOT_A_STOREFRONT") {
                updates.gas_station_override = null;
              }
              if (value !== "OBSTRUCTED_VIEW") {
                updates.obstruction_type = "NONE";
              }
              if (value === "OBSTRUCTED_VIEW") {
                updates.obstruction_type = null;
              }
              onUpdate(updates);
            }}
            className="grid grid-cols-1 gap-2"
          >
            {step1aOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex items-center space-x-3 rounded-lg border p-3 cursor-pointer transition-colors",
                  label.step_1a_visibility === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                )}
                onClick={() => {
                  const updates: Partial<ImageLabel> = { step_1a_visibility: option.value };
                  if (option.value !== "NOT_A_STOREFRONT") {
                    updates.gas_station_override = null;
                  }
                  if (option.value !== "OBSTRUCTED_VIEW") {
                    updates.obstruction_type = "NONE";
                  }
                  if (option.value === "OBSTRUCTED_VIEW") {
                    updates.obstruction_type = null;
                  }
                  onUpdate(updates);
                }}
              >
                <RadioGroupItem value={option.value!} id={option.value!} />
                <div className="flex-1">
                  <Label htmlFor={option.value!} className="font-medium cursor-pointer">
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Category 2: Gas Station Override */}
      {showGasStationOverride && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              Is it a Gas Station?
              {!label.gas_station_override && <Badge variant="outline" className="text-amber-600 border-amber-600">Required</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={label.gas_station_override || ""}
              onValueChange={(value) => onUpdate({ gas_station_override: value as GasStationOverride })}
              className="flex gap-4"
            >
              {(["YES", "NO"] as GasStationOverride[]).map((option) => (
                <div
                  key={option}
                  className={cn(
                    "flex items-center space-x-2 rounded-lg border px-4 py-2 cursor-pointer transition-colors",
                    label.gas_station_override === option
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                  onClick={() => onUpdate({ gas_station_override: option })}
                >
                  <RadioGroupItem value={option!} id={`gas-${option}`} />
                  <Label htmlFor={`gas-${option}`} className="cursor-pointer">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Category 3: Obstruction Type */}
      {showObstructionType && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
              Obstruction Type
              {!label.obstruction_type && <Badge variant="outline" className="text-amber-600 border-amber-600">Required</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {obstructionOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-start gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors text-sm min-w-0",
                    label.obstruction_type === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                  onClick={() => onUpdate({ obstruction_type: option.value })}
                >
                  <div className={cn(
                    "w-3 h-3 rounded-full border-2 shrink-0 mt-0.5",
                    label.obstruction_type === option.value
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  )} />
                  <span className="break-words">{option.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category 4: Step 1B Routing */}
      {showStep1B && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
              Step 1B: Business Category
              {!label.step_1b_routing && <Badge variant="outline" className="text-amber-600 border-amber-600">Required</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={label.step_1b_routing || ""}
              onValueChange={(value) => {
                const updates: Partial<ImageLabel> = { step_1b_routing: value as Step1BRouting };
                if (value !== "OTHER_OUTSIDE_SCHEMA") {
                  updates.outside_schema_guess = "";
                }
                onUpdate(updates);
              }}
              className="grid grid-cols-1 gap-2"
            >
              {step1bOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors text-sm",
                    label.step_1b_routing === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                  onClick={() => {
                    const updates: Partial<ImageLabel> = { step_1b_routing: option.value };
                    if (option.value !== "OTHER_OUTSIDE_SCHEMA") {
                      updates.outside_schema_guess = "";
                    }
                    onUpdate(updates);
                  }}
                >
                  <RadioGroupItem value={option.value!} id={option.value!} />
                  <Label htmlFor={option.value!} className="flex-1 cursor-pointer">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Outside Schema Guess */}
      {showOutsideSchemaGuess && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Outside Schema Guess
              {!label.outside_schema_guess.trim() && <Badge variant="outline" className="text-amber-600 border-amber-600">Required</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="e.g., bank, salon, gym..."
              value={label.outside_schema_guess}
              onChange={(e) => onUpdate({ outside_schema_guess: e.target.value })}
            />
          </CardContent>
        </Card>
      )}

      {/* Category 5: Evidence Type (Multi-select) */}
      {showStep1B && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
              Evidence Type
              <span className="text-xs text-muted-foreground">(Select all that apply)</span>
              {label.evidence_type.length === 0 && <Badge variant="outline" className="text-amber-600 border-amber-600">Required</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {evidenceOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center space-x-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors",
                    label.evidence_type.includes(option.value)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                  onClick={() => handleEvidenceToggle(option.value)}
                >
                  <Checkbox
                    checked={label.evidence_type.includes(option.value)}
                    onCheckedChange={() => handleEvidenceToggle(option.value)}
                  />
                  <span className="text-sm">{option.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category 7: Annotator Confidence */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">6</span>
            Annotator Confidence
            {!label.annotator_confidence && <Badge variant="outline" className="text-amber-600 border-amber-600">Required</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {confidenceOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex items-center space-x-2 rounded-lg border px-4 py-2 cursor-pointer transition-colors",
                  label.annotator_confidence === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                )}
                onClick={() => onUpdate({ annotator_confidence: option.value })}
              >
                <div className={cn("w-3 h-3 rounded-full", option.color)} />
                <span className="text-sm font-medium">{option.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category 8: Multiple Businesses Visible */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">7</span>
            Multiple Businesses Visible?
            {!label.multiple_businesses_visible && <Badge variant="outline" className="text-amber-600 border-amber-600">Required</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={label.multiple_businesses_visible || ""}
            onValueChange={(value) => onUpdate({ multiple_businesses_visible: value as MultipleBusiness })}
            className="flex gap-4"
          >
            {(["YES", "NO"] as MultipleBusiness[]).map((option) => (
              <div
                key={option}
                className={cn(
                  "flex items-center space-x-2 rounded-lg border px-4 py-2 cursor-pointer transition-colors",
                  label.multiple_businesses_visible === option
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                )}
                onClick={() => onUpdate({ multiple_businesses_visible: option })}
              >
                <RadioGroupItem value={option!} id={`multi-${option}`} />
                <Label htmlFor={`multi-${option}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Category 6: Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="bg-muted text-muted-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">+</span>
            Notes
            <span className="text-xs text-muted-foreground">(Optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Additional comments or observations..."
            value={label.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            rows={2}
          />
        </CardContent>
      </Card>
    </div>
  );
}

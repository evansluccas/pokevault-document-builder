import { useState, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanLine, Camera, Upload, AlertTriangle, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ScanResult {
  item_type: string;
  name: string;
  set_name: string | null;
  card_number: string | null;
  era_name: string | null;
  condition_estimate: string | null;
  confidence: number;
  notes: string | null;
}

export default function ScanPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!imagePreview) return;
    setScanning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("scan-card", {
        body: { image_base64: imagePreview },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data.data);
      toast.success("Card identified!");
    } catch (err: any) {
      toast.error(err.message || "Scanner failed. Try a clearer photo.");
    } finally {
      setScanning(false);
    }
  };

  const handleUseResult = () => {
    if (!result) return;
    // Navigate to add item page with pre-filled data via query params
    const params = new URLSearchParams();
    if (result.name) params.set("name", result.name);
    if (result.set_name) params.set("set_name", result.set_name);
    if (result.card_number) params.set("card_number", result.card_number);
    if (result.era_name) params.set("era_name", result.era_name);
    if (result.condition_estimate) params.set("condition", result.condition_estimate);
    if (result.item_type) params.set("type", result.item_type);
    if (imagePreview) params.set("has_image", "1");

    // Store image in sessionStorage for the add item page
    if (imagePreview) {
      sessionStorage.setItem("scan_image", imagePreview);
    }

    navigate(`/items/new?${params.toString()}`);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">AI Card Scanner</h1>
          <p className="text-muted-foreground mt-1">Snap a photo to auto-identify your card</p>
        </div>

        {/* Upload area */}
        {!imagePreview ? (
          <Card className="glass-elevated">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-2xl gradient-accent flex items-center justify-center mb-6">
                <ScanLine className="w-10 h-10 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Scan a Pokémon Card</h3>
              <p className="text-muted-foreground text-sm mb-8 max-w-sm">
                Take a photo or upload an image. Our AI will identify the card name, set, number, and estimated condition.
              </p>
              <div className="flex gap-3">
                <Button variant="hero" size="lg" className="gap-2" onClick={() => cameraInputRef.current?.click()}>
                  <Camera className="w-5 h-5" />
                  Take Photo
                </Button>
                <Button variant="outline" size="lg" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-5 h-5" />
                  Upload Image
                </Button>
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <input ref={cameraInputRef} type="file" className="hidden" accept="image/*" capture="environment" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <Card className="glass-elevated overflow-hidden">
              <CardContent className="p-4">
                <img src={imagePreview} alt="Card to scan" className="w-full max-h-96 object-contain rounded-lg" />
              </CardContent>
            </Card>

            {/* Scan Button */}
            {!result && (
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setImagePreview(null); setResult(null); }}>
                  Choose Different Photo
                </Button>
                <Button variant="hero" className="gap-2 flex-1" onClick={handleScan} disabled={scanning}>
                  {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
                  {scanning ? "Identifying..." : "Identify Card"}
                </Button>
              </div>
            )}

            {/* Results */}
            {result && (
              <Card className="glass-elevated animate-fade-in">
                <CardContent className="p-6 space-y-4">
                  {result.confidence < 0.7 && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-600 text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      Low confidence identification — please verify the fields below.
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-accent font-medium">
                    <Check className="w-4 h-4" />
                    Confidence: {(result.confidence * 100).toFixed(0)}%
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Name", value: result.name },
                      { label: "Type", value: result.item_type },
                      { label: "Set", value: result.set_name },
                      { label: "Number", value: result.card_number },
                      { label: "Era", value: result.era_name },
                      { label: "Condition", value: result.condition_estimate?.replace(/_/g, " ") },
                    ].map((field) => (
                      <div key={field.label}>
                        <p className="text-xs text-muted-foreground">{field.label}</p>
                        <p className="text-sm font-medium text-foreground">{field.value || "—"}</p>
                      </div>
                    ))}
                  </div>

                  {result.notes && (
                    <p className="text-sm text-muted-foreground italic">{result.notes}</p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => { setImagePreview(null); setResult(null); }}>
                      Scan Another
                    </Button>
                    <Button variant="hero" className="gap-2 flex-1" onClick={handleUseResult}>
                      <Check className="w-4 h-4" />
                      Add to Collection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

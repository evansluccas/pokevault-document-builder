import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ScanLine, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ScanPage() {
  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">AI Card Scanner</h1>
          <p className="text-muted-foreground mt-1">Snap a photo to auto-identify your card</p>
        </div>

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
              <Button variant="hero" size="lg" className="gap-2">
                <Camera className="w-5 h-5" />
                Take Photo
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <ScanLine className="w-5 h-5" />
                Upload Image
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              Requires Cloud backend for AI processing. Connect to enable.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

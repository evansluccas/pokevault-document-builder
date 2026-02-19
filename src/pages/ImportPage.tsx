import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImportPage() {
  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Import from Spreadsheet</h1>
          <p className="text-muted-foreground mt-1">Migrate your existing collection data</p>
        </div>

        <Card className="glass-elevated">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
              <FileSpreadsheet className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Upload Your Spreadsheet</h3>
            <p className="text-muted-foreground text-sm mb-8 max-w-sm">
              Upload a .xlsx or .csv file and we'll help you map columns to PokéVault fields. Supports up to 10,000 rows.
            </p>
            <Button variant="hero" size="lg" className="gap-2">
              <Upload className="w-5 h-5" />
              Choose File
            </Button>
            <p className="text-xs text-muted-foreground mt-6">
              Requires Cloud backend for data persistence. Connect to enable.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

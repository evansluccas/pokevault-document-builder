import { useState, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileSpreadsheet, Upload, ArrowRight, ArrowLeft, Check, AlertCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { useCollections, useCreateCollection } from "@/hooks/useDatabase";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import * as XLSX from "xlsx";

const POKEVAULT_FIELDS = [
  { key: "name", label: "Name", required: true },
  { key: "set_name", label: "Set Name" },
  { key: "card_number", label: "Card Number" },
  { key: "era_name", label: "Era" },
  { key: "condition", label: "Condition" },
  { key: "purchase_price", label: "Purchase Price" },
  { key: "notes", label: "Notes" },
];

const AUTO_MAP: Record<string, string> = {
  name: "name", "card name": "name", item: "name", title: "name", pokemon: "name",
  set: "set_name", "set name": "set_name", collection: "set_name", series: "set_name", expansion: "set_name",
  number: "card_number", "card #": "card_number", "no.": "card_number", "card number": "card_number", "#": "card_number",
  era: "era_name", gen: "era_name", generation: "era_name", period: "era_name",
  condition: "condition", grade: "condition", quality: "condition", state: "condition",
  price: "purchase_price", "purchase price": "purchase_price", cost: "purchase_price", paid: "purchase_price", "buy price": "purchase_price", "price paid": "purchase_price",
  notes: "notes", comments: "notes", description: "notes", details: "notes",
};

type Step = "upload" | "mapping" | "collection" | "importing" | "summary";

export default function ImportPage() {
  const { user } = useAuth();
  const { data: collections } = useCollections();
  const createCollection = useCreateCollection();
  const [step, setStep] = useState<Step>("upload");
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[][]>([]);
  const [allRows, setAllRows] = useState<any[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [targetCollection, setTargetCollection] = useState("");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] }>({ imported: 0, skipped: 0, errors: [] });

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (rows.length < 2) {
          toast.error("File must have at least a header row and one data row.");
          return;
        }

        const headerRow = (rows[0] as string[]).map(h => String(h || "").trim());
        setHeaders(headerRow);
        setPreviewRows(rows.slice(1, 6));
        setAllRows(rows.slice(1));

        // Auto-map
        const autoMapping: Record<string, string> = {};
        headerRow.forEach((h, i) => {
          const key = h.toLowerCase();
          if (AUTO_MAP[key]) {
            autoMapping[String(i)] = AUTO_MAP[key];
          }
        });
        setMapping(autoMapping);
        setStep("mapping");
        toast.success(`File loaded: ${rows.length - 1} rows found`);
      } catch {
        toast.error("Could not parse file. Please upload a valid .xlsx or .csv file.");
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleImport = async () => {
    if (!user) return;
    setStep("importing");
    setProgress(0);

    let collectionId = targetCollection;
    if (newCollectionName) {
      try {
        const col = await createCollection.mutateAsync({ name: newCollectionName, description: "Imported from spreadsheet" });
        collectionId = col.id;
      } catch (err: any) {
        toast.error("Failed to create collection: " + err.message);
        setStep("collection");
        return;
      }
    }

    const nameIndex = Object.entries(mapping).find(([_, v]) => v === "name")?.[0];
    if (nameIndex === undefined) {
      toast.error("Name field must be mapped.");
      setStep("mapping");
      return;
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < allRows.length; i++) {
      const row = allRows[i];
      const name = row[Number(nameIndex)];
      if (!name || String(name).trim() === "") {
        skipped++;
        errors.push(`Row ${i + 2}: Missing name`);
        continue;
      }

      const item: any = {
        user_id: user.id,
        name: String(name).trim(),
        type: "card",
        collection_id: collectionId || null,
      };

      Object.entries(mapping).forEach(([colIdx, field]) => {
        if (field === "name") return;
        const val = row[Number(colIdx)];
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          if (field === "purchase_price") {
            const num = parseFloat(String(val).replace(/[^0-9.]/g, ""));
            if (!isNaN(num)) item[field] = num;
          } else {
            item[field] = String(val).trim();
          }
        }
      });

      try {
        const { error } = await supabase.from("items").insert(item);
        if (error) throw error;
        imported++;
      } catch (err: any) {
        skipped++;
        errors.push(`Row ${i + 2}: ${err.message}`);
      }

      setProgress(Math.round(((i + 1) / allRows.length) * 100));
    }

    setImportResult({ imported, skipped, errors });
    setStep("summary");
  };

  const downloadErrors = () => {
    const csv = "Row,Error\n" + importResult.errors.map(e => `"${e}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-errors.csv";
    a.click();
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Import from Spreadsheet</h1>
          <p className="text-muted-foreground mt-1">Migrate your existing collection data</p>
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <Card className="glass-elevated">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
                <FileSpreadsheet className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Upload Your Spreadsheet</h3>
              <p className="text-muted-foreground text-sm mb-8 max-w-sm">
                Upload a .xlsx or .csv file. We'll help you map columns to PokéVault fields. Max 10,000 rows.
              </p>
              <label>
                <Button variant="hero" size="lg" className="gap-2 cursor-pointer" asChild>
                  <span><Upload className="w-5 h-5" />Choose File</span>
                </Button>
                <input type="file" className="hidden" accept=".xlsx,.csv,.xls" onChange={handleFileUpload} />
              </label>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Column Mapping */}
        {step === "mapping" && (
          <div className="space-y-4">
            <Card className="glass-elevated">
              <CardHeader><CardTitle className="text-base">Preview (first 5 rows)</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>{headers.map((h, i) => <th key={i} className="px-3 py-2 text-left text-muted-foreground font-medium border-b border-border">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, ri) => (
                      <tr key={ri}>{headers.map((_, ci) => <td key={ci} className="px-3 py-2 border-b border-border text-foreground">{row[ci] ?? ""}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="glass-elevated">
              <CardHeader><CardTitle className="text-base">Column Mapping</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {headers.map((header, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-foreground w-40 truncate">{header}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Select value={mapping[String(i)] || "ignore"} onValueChange={(v) => setMapping(prev => ({ ...prev, [String(i)]: v === "ignore" ? "" : v }))}>
                      <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ignore">— Ignore —</SelectItem>
                        {POKEVAULT_FIELDS.map((f) => (
                          <SelectItem key={f.key} value={f.key}>{f.label}{f.required ? " *" : ""}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setStep("upload")}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
              <Button variant="hero" onClick={() => {
                if (!Object.values(mapping).includes("name")) {
                  toast.error("You must map at least the Name field.");
                  return;
                }
                setStep("collection");
              }}>Next: Choose Collection <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {/* Step 3: Collection */}
        {step === "collection" && (
          <div className="space-y-4">
            <Card className="glass-elevated">
              <CardHeader><CardTitle className="text-base">Target Collection</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Choose an existing collection or create a new one for imported items.</p>
                <Select value={targetCollection} onValueChange={(v) => { setTargetCollection(v); setNewCollectionName(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select collection" /></SelectTrigger>
                  <SelectContent>
                    {(collections || []).map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <span>— or —</span>
                </div>
                <div className="space-y-2">
                  <Label>Create New Collection</Label>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="e.g. Imported Collection"
                    value={newCollectionName}
                    onChange={(e) => { setNewCollectionName(e.target.value); setTargetCollection(""); }}
                  />
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setStep("mapping")}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
              <Button variant="hero" onClick={handleImport}>
                Import {allRows.length} Items <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Importing */}
        {step === "importing" && (
          <Card className="glass-elevated">
            <CardContent className="py-20 text-center space-y-6">
              <FileSpreadsheet className="w-12 h-12 text-accent mx-auto animate-pulse" />
              <h3 className="text-xl font-semibold text-foreground">Importing...</h3>
              <Progress value={progress} className="max-w-md mx-auto" />
              <p className="text-sm text-muted-foreground">{progress}% complete</p>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Summary */}
        {step === "summary" && (
          <div className="space-y-4">
            <Card className="glass-elevated">
              <CardContent className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Import Complete!</h3>
                <div className="flex justify-center gap-8 text-sm">
                  <div>
                    <p className="text-2xl font-bold text-accent">{importResult.imported}</p>
                    <p className="text-muted-foreground">Imported</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-muted-foreground">{importResult.skipped}</p>
                    <p className="text-muted-foreground">Skipped</p>
                  </div>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="pt-4">
                    <Button variant="outline" size="sm" className="gap-2" onClick={downloadErrors}>
                      <Download className="w-4 h-4" />
                      Download Error Report
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => { setStep("upload"); setAllRows([]); setHeaders([]); setMapping({}); }}>Import Another</Button>
              <Button variant="hero" onClick={() => window.location.href = "/dashboard"}>Go to Dashboard</Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, ScanLine, Save } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useCreateItem, useCollections } from "@/hooks/useDatabase";

const conditions = [
  { value: "mint", label: "Mint (M)" },
  { value: "near_mint", label: "Near Mint (NM)" },
  { value: "lightly_played", label: "Lightly Played (LP)" },
  { value: "moderately_played", label: "Moderately Played (MP)" },
  { value: "heavily_played", label: "Heavily Played (HP)" },
  { value: "damaged", label: "Damaged (D)" },
];

export default function AddItemPage() {
  const [itemType, setItemType] = useState("card");
  const [name, setName] = useState("");
  const [setName_, setSetName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [eraName, setEraName] = useState("");
  const [condition, setCondition] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [notes, setNotes] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const createItem = useCreateItem();
  const { data: collections } = useCollections();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter an item name.");
      return;
    }
    try {
      await createItem.mutateAsync({
        name,
        type: itemType,
        collection_id: collectionId || null,
        era_name: eraName || undefined,
        set_name: setName_ || undefined,
        card_number: cardNumber || undefined,
        condition: condition || undefined,
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : undefined,
        notes: notes || undefined,
      });
      toast.success("Item added to your collection!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Add Item</h1>
            <p className="text-muted-foreground mt-1">Add a card or product to your collection</p>
          </div>
          <Link to="/scan">
            <Button variant="outline" className="gap-2">
              <ScanLine className="w-4 h-4" />
              Use Scanner
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Item Type */}
            <Card className="glass-elevated">
              <CardHeader><CardTitle className="text-base">Item Type</CardTitle></CardHeader>
              <CardContent>
                <RadioGroup value={itemType} onValueChange={setItemType} className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="card" id="type-card" />
                    <Label htmlFor="type-card" className="cursor-pointer font-medium">Card</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="product" id="type-product" />
                    <Label htmlFor="type-product" className="cursor-pointer font-medium">Product</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Photo */}
            <Card className="glass-elevated">
              <CardHeader><CardTitle className="text-base">Photo</CardTitle></CardHeader>
              <CardContent>
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full object-contain rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="w-8 h-8" />
                      <span className="text-sm font-medium">Click to upload a photo</span>
                      <span className="text-xs">JPEG, PNG, WEBP — max 10MB</span>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </CardContent>
            </Card>

            {/* Details */}
            <Card className="glass-elevated">
              <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" placeholder="e.g. Charizard" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collection">Collection</Label>
                  <Select value={collectionId} onValueChange={setCollectionId}>
                    <SelectTrigger id="collection">
                      <SelectValue placeholder="Select collection (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {(collections || []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="set">Set / Collection Name</Label>
                    <Input id="set" placeholder="e.g. Base Set" value={setName_} onChange={(e) => setSetName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">Card Number</Label>
                    <Input id="number" placeholder="e.g. 4/102" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="era">Era</Label>
                    <Input id="era" placeholder="e.g. Gen 1" value={eraName} onChange={(e) => setEraName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger id="condition"><SelectValue placeholder="Select condition" /></SelectTrigger>
                      <SelectContent>
                        {conditions.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Purchase Price (USD)</Label>
                  <Input id="price" type="number" step="0.01" min="0" placeholder="0.00" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Any additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Link to="/dashboard"><Button variant="outline">Cancel</Button></Link>
              <Button type="submit" variant="hero" className="gap-2" disabled={createItem.isPending}>
                <Save className="w-4 h-4" />
                {createItem.isPending ? "Saving..." : "Save Item"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

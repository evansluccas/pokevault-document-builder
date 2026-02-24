import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  PlusCircle,
  Search,
  DollarSign,
  TrendingUp,
  Package,
  ImageIcon,
  LinkIcon,
} from "lucide-react";
import { useItems, useCollections } from "@/hooks/useDatabase";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: collections, isLoading: loadingCol } = useCollections();
  const { data: items, isLoading: loadingItems } = useItems(id);
  const { data: allItems } = useItems(); // all user items
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddExisting, setShowAddExisting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [existingSearch, setExistingSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // Items not already in this collection
  const availableItems = (allItems || []).filter(
    (i) => i.collection_id !== id
  );
  const filteredAvailable = availableItems.filter((i) =>
    i.name.toLowerCase().includes(existingSearch.toLowerCase())
  );

  const toggleItem = (itemId: string) => {
    setSelectedIds((prev) =>
      prev.includes(itemId) ? prev.filter((x) => x !== itemId) : [...prev, itemId]
    );
  };

  const handleAddExisting = async () => {
    if (selectedIds.length === 0) return;
    setSaving(true);
    const { error } = await supabase
      .from("items")
      .update({ collection_id: id })
      .in("id", selectedIds);
    setSaving(false);
    if (error) {
      toast.error("Failed to add items");
    } else {
      toast.success(`${selectedIds.length} item(s) added to collection`);
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setSelectedIds([]);
      setShowAddExisting(false);
    }
  };

  const collection = collections?.find((c) => c.id === id);

  const totalCost = (items || []).reduce(
    (sum, i) => sum + (Number(i.purchase_price) || 0),
    0
  );

  const filtered = (items || []).filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loadingCol || loadingItems) {
    return (
      <AppLayout>
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!collection) {
    return (
      <AppLayout>
        <div className="p-4 md:p-8 max-w-6xl mx-auto text-center py-20">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Collection not found
          </h2>
          <Link to="/collections">
            <Button variant="outline" className="gap-2 mt-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Collections
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/collections">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-muted-foreground mt-1">
                  {collection.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setShowAddExisting(true)}>
              <LinkIcon className="w-4 h-4" />
              Add Existing
            </Button>
            <Link to={`/items/new?collection=${id}`}>
              <Button variant="hero" className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Add New
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="glass-elevated">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Items</p>
                <p className="text-xl font-bold text-foreground">
                  {items?.length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-elevated">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Cost</p>
                <p className="text-xl font-bold text-foreground">
                  ${totalCost.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-elevated col-span-2 md:col-span-1">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Est. Value</p>
                <p className="text-xl font-bold text-foreground">—</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        {(items?.length || 0) > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Items grid */}
        {!items || items.length === 0 ? (
          <Card className="glass-elevated">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No items yet
              </h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                Start adding cards and products to this collection.
              </p>
              <Link to={`/items/new?collection=${id}`}>
                <Button variant="hero" className="gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Add First Item
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <Link key={item.id} to={`/items/${item.id}`}>
                <Card className="glass-elevated hover:shadow-lg transition-shadow group cursor-pointer h-full">
                  <CardContent className="p-4 space-y-3">
                    <div className="w-full h-36 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {item.set_name && (
                          <Badge variant="secondary" className="text-xs">
                            {item.set_name}
                          </Badge>
                        )}
                        {item.condition && (
                          <Badge variant="outline" className="text-xs">
                            {item.condition}
                          </Badge>
                        )}
                      </div>
                      {item.purchase_price != null && (
                        <p className="text-sm text-muted-foreground mt-2">
                          ${Number(item.purchase_price).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Add Existing Items Dialog */}
      <Dialog open={showAddExisting} onOpenChange={(open) => { setShowAddExisting(open); if (!open) { setSelectedIds([]); setExistingSearch(""); } }}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Existing Items</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search your items..."
              className="pl-9"
              value={existingSearch}
              onChange={(e) => setExistingSearch(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 min-h-0 max-h-[50vh]">
            {filteredAvailable.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No available items found.
              </p>
            ) : (
              filteredAvailable.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={() => toggleItem(item.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {item.set_name && <span>{item.set_name}</span>}
                      {item.condition && <span>• {item.condition}</span>}
                    </div>
                  </div>
                  {item.purchase_price != null && (
                    <span className="text-xs text-muted-foreground">${Number(item.purchase_price).toFixed(2)}</span>
                  )}
                </label>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddExisting(false)}>Cancel</Button>
            <Button onClick={handleAddExisting} disabled={selectedIds.length === 0 || saving}>
              {saving ? "Adding..." : `Add ${selectedIds.length} Item${selectedIds.length !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

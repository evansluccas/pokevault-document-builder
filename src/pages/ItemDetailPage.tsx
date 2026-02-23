import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Package, Pencil, Trash2, RefreshCw, ExternalLink, TrendingUp, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface EbayPrice {
  price: number;
  date: string;
  title: string;
}

interface PriceData {
  sold_prices: EbayPrice[];
  average_price: number;
  lowest_price: number;
  highest_price: number;
}

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [fetchingPrices, setFetchingPrices] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchItem = async () => {
      const { data, error } = await supabase.from("items").select("*").eq("id", id).single();
      if (error) { toast.error("Item not found"); navigate("/dashboard"); return; }
      setItem(data);
      setLoading(false);

      // Fetch existing prices
      const { data: prices } = await supabase
        .from("ebay_prices")
        .select("*")
        .eq("item_id", id)
        .order("fetched_at", { ascending: false })
        .limit(1);

      if (prices && prices.length > 0) {
        setPriceData({
          sold_prices: (prices[0].sold_prices as any) || [],
          average_price: Number(prices[0].average_price) || 0,
          lowest_price: Number(prices[0].lowest_price) || 0,
          highest_price: Number(prices[0].highest_price) || 0,
        });
      }
    };
    fetchItem();
  }, [id, navigate]);

  const fetchEbayPrices = async () => {
    if (!item) return;
    setFetchingPrices(true);
    try {
      const { data, error } = await supabase.functions.invoke("ebay-prices", {
        body: { item_id: item.id, name: item.name, set_name: item.set_name, card_number: item.card_number, type: item.type },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPriceData(data.data);
      toast.success("Prices updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch prices");
    } finally {
      setFetchingPrices(false);
    }
  };

  const deleteItem = async () => {
    if (!id) return;
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    queryClient.invalidateQueries({ queryKey: ["items"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    toast.success("Item deleted");
    navigate("/dashboard");
  };

  const conditionLabels: Record<string, string> = {
    mint: "Mint", near_mint: "Near Mint", lightly_played: "Lightly Played",
    moderately_played: "Moderately Played", heavily_played: "Heavily Played", damaged: "Damaged",
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{item.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {item.set_name && <span className="text-sm text-muted-foreground">{item.set_name}</span>}
              {item.card_number && <span className="text-sm text-muted-foreground">#{item.card_number}</span>}
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Item</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete "{item.name}" from your collection.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteItem} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image + Details */}
          <div className="space-y-4">
            <Card className="glass-elevated overflow-hidden">
              <CardContent className="p-4">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full rounded-lg object-contain max-h-96" />
                ) : (
                  <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-elevated">
              <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Type", value: item.type === "card" ? "Card" : "Product" },
                  { label: "Era", value: item.era_name },
                  { label: "Condition", value: item.condition ? conditionLabels[item.condition] || item.condition : null },
                  { label: "Purchase Price", value: item.purchase_price ? `$${Number(item.purchase_price).toFixed(2)}` : null },
                  { label: "Notes", value: item.notes },
                ].filter(f => f.value).map((field) => (
                  <div key={field.label} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{field.label}</span>
                    <span className="text-sm font-medium text-foreground">{field.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* eBay Pricing Panel */}
          <div>
            <Card className="glass-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    eBay Market Value
                  </CardTitle>
                  <Button variant="outline" size="sm" className="gap-1" onClick={fetchEbayPrices} disabled={fetchingPrices}>
                    {fetchingPrices ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    {priceData ? "Refresh" : "Fetch Prices"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {fetchingPrices && !priceData ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}
                  </div>
                ) : priceData ? (
                  <div className="space-y-4">
                    {/* Average */}
                    <div className="text-center p-4 rounded-xl bg-accent/10">
                      <p className="text-sm text-muted-foreground mb-1">Average Sold Price</p>
                      <p className="text-3xl font-bold text-accent">${priceData.average_price.toFixed(2)}</p>
                      <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Low: ${priceData.lowest_price.toFixed(2)}</span>
                        <span>High: ${priceData.highest_price.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Sold Listings */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Recent Sales</p>
                      {priceData.sold_prices.map((sale, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{sale.title}</p>
                            <p className="text-xs text-muted-foreground">{sale.date}</p>
                          </div>
                          <span className="text-sm font-semibold text-foreground ml-3">${sale.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">No price data yet</p>
                    <Button variant="hero" size="sm" className="gap-1" onClick={fetchEbayPrices}>
                      <TrendingUp className="w-4 h-4" />
                      Get Market Prices
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

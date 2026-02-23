import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  PlusCircle,
  Search,
  DollarSign,
  TrendingUp,
  Package,
  ImageIcon,
} from "lucide-react";
import { useItems, useCollections } from "@/hooks/useDatabase";

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: collections, isLoading: loadingCol } = useCollections();
  const { data: items, isLoading: loadingItems } = useItems(id);
  const [searchQuery, setSearchQuery] = useState("");

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
          <Link to={`/items/new?collection=${id}`}>
            <Button variant="hero" className="gap-2">
              <PlusCircle className="w-4 h-4" />
              Add Item
            </Button>
          </Link>
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
    </AppLayout>
  );
}

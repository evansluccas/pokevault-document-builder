import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Package,
  FolderOpen,
  TrendingUp,
  DollarSign,
  PlusCircle,
  ScanLine,
  ArrowRight,
} from "lucide-react";
import { useDashboardStats, useItems, useCollections } from "@/hooks/useDatabase";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentItems, isLoading: itemsLoading } = useItems();
  const { data: collections, isLoading: colLoading } = useCollections();

  const statCards = [
    { label: "Total Items", value: stats?.totalItems ?? 0, icon: Package, color: "text-accent", format: (v: number) => String(v) },
    { label: "Collections", value: stats?.totalCollections ?? 0, icon: FolderOpen, color: "text-electric", format: (v: number) => String(v) },
    { label: "Portfolio Value", value: stats?.portfolioValue ?? 0, icon: TrendingUp, color: "text-emerald-500", format: (v: number) => `$${v.toFixed(2)}` },
    { label: "Total Cost", value: stats?.totalCost ?? 0, icon: DollarSign, color: "text-amber-500", format: (v: number) => `$${v.toFixed(2)}` },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome to your PokéVault</p>
          </div>
          <div className="flex gap-3">
            <Link to="/scan">
              <Button variant="outline" className="gap-2">
                <ScanLine className="w-4 h-4" />
                Scan Card
              </Button>
            </Link>
            <Link to="/items/new">
              <Button variant="hero" className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Add Item
              </Button>
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="glass-elevated">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stat.format(stat.value)}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Items */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Items</h2>
          {itemsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          ) : recentItems && recentItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentItems.slice(0, 8).map((item) => (
                <Link key={item.id} to={`/items/${item.id}`}>
                <Card className="glass-elevated hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="w-full h-24 rounded-lg bg-muted flex items-center justify-center mb-3">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover rounded-lg" />
                      ) : (
                        <Package className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="font-medium text-foreground text-sm truncate">{item.name}</h3>
                    {item.set_name && <p className="text-xs text-muted-foreground truncate">{item.set_name}</p>}
                    {item.purchase_price && (
                      <p className="text-xs font-semibold text-accent mt-1">${Number(item.purchase_price).toFixed(2)}</p>
                    )}
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="glass-elevated">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No items yet</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                  Start building your collection by adding your first card or product.
                </p>
                <div className="flex gap-3">
                  <Link to="/scan"><Button variant="outline" className="gap-2"><ScanLine className="w-4 h-4" />Scan a Card</Button></Link>
                  <Link to="/items/new"><Button className="gap-2"><PlusCircle className="w-4 h-4" />Add Manually</Button></Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Collections */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Your Collections</h2>
            <Link to="/collections"><Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">View All <ArrowRight className="w-4 h-4" /></Button></Link>
          </div>
          {colLoading ? (
            <div className="grid sm:grid-cols-3 gap-4">
              {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : collections && collections.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.slice(0, 6).map((col) => (
                <Link key={col.id} to={`/collections`}>
                  <Card className="glass-elevated hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                      <div className="w-full h-24 rounded-lg bg-muted mb-3 flex items-center justify-center">
                        <FolderOpen className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground">{col.name}</h3>
                      {col.description && <p className="text-sm text-muted-foreground line-clamp-1">{col.description}</p>}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="glass-elevated">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <FolderOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No collections yet</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                  Organize your items into collections like "Base Set", "Vintage Holos", or "For Trade".
                </p>
                <Link to="/collections"><Button className="gap-2"><PlusCircle className="w-4 h-4" />Create Collection</Button></Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

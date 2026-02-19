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

const stats = [
  { label: "Total Items", value: "0", icon: Package, color: "text-accent" },
  { label: "Collections", value: "0", icon: FolderOpen, color: "text-electric" },
  { label: "Portfolio Value", value: "$0.00", icon: TrendingUp, color: "text-emerald-500" },
  { label: "Total Cost", value: "$0.00", icon: DollarSign, color: "text-amber-500" },
];

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        {/* Header */}
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
          {stats.map((stat) => (
            <Card key={stat.label} className="glass-elevated">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Items - Empty State */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Items</h2>
          </div>
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
                <Link to="/scan">
                  <Button variant="outline" className="gap-2">
                    <ScanLine className="w-4 h-4" />
                    Scan a Card
                  </Button>
                </Link>
                <Link to="/items/new">
                  <Button className="gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Add Manually
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collections Quick View */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Your Collections</h2>
            <Link to="/collections">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <Card className="glass-elevated">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FolderOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No collections yet</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                Organize your items into collections like "Base Set", "Vintage Holos", or "For Trade".
              </p>
              <Link to="/collections">
                <Button className="gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Create Collection
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

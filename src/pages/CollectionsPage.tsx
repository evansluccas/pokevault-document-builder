import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FolderOpen, PlusCircle, Search, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollections, useCreateCollection, useDeleteCollection } from "@/hooks/useDatabase";
import { toast } from "sonner";

export default function CollectionsPage() {
  const { data: collections, isLoading } = useCollections();
  const createCollection = useCreateCollection();
  const deleteCollection = useDeleteCollection();
  const [searchQuery, setSearchQuery] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createCollection.mutateAsync({ name: newName, description: newDesc });
      toast.success("Collection created!");
      setNewName("");
      setNewDesc("");
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCollection.mutateAsync(id);
      toast.success("Collection deleted");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filtered = (collections || []).filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Collections</h1>
            <p className="text-muted-foreground mt-1">Organize your cards and products</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-2">
                <PlusCircle className="w-4 h-4" />
                New Collection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Collection</DialogTitle>
                <DialogDescription>Give your collection a name and optional description.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="col-name">Name</Label>
                  <Input id="col-name" placeholder="e.g. Base Set Complete" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="col-desc">Description</Label>
                  <Textarea id="col-desc" placeholder="Optional description..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={createCollection.isPending}>
                  {createCollection.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {(collections?.length || 0) > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search collections..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        )}

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-56 rounded-xl" />)}
          </div>
        ) : !collections || collections.length === 0 ? (
          <Card className="glass-elevated">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FolderOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No collections yet</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                Create your first collection to start organizing your Pokémon cards and products.
              </p>
              <Button variant="hero" className="gap-2" onClick={() => setDialogOpen(true)}>
                <PlusCircle className="w-4 h-4" />
                Create Your First Collection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((col) => (
              <Card key={col.id} className="glass-elevated hover:shadow-lg transition-shadow group">
                <CardContent className="p-5">
                  <div className="w-full h-32 rounded-lg bg-muted mb-4 flex items-center justify-center">
                    <FolderOpen className="w-10 h-10 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">{col.name}</h3>
                      {col.description && <p className="text-sm text-muted-foreground line-clamp-2">{col.description}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(col.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useCollections() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["collections", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      const { data, error } = await supabase
        .from("collections")
        .insert({ name, description, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collections"] }),
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("collections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collections"] }),
  });
}

export function useItems(collectionId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["items", user?.id, collectionId],
    queryFn: async () => {
      let query = supabase.from("items").select("*").order("created_at", { ascending: false });
      if (collectionId) query = query.eq("collection_id", collectionId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (item: {
      name: string;
      type: string;
      collection_id?: string | null;
      era_name?: string;
      set_name?: string;
      card_number?: string;
      condition?: string;
      purchase_price?: number;
      notes?: string;
      image_url?: string;
    }) => {
      const { data, error } = await supabase
        .from("items")
        .insert({ ...item, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDashboardStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      const [itemsRes, collectionsRes] = await Promise.all([
        supabase.from("items").select("purchase_price"),
        supabase.from("collections").select("id"),
      ]);
      if (itemsRes.error) throw itemsRes.error;
      if (collectionsRes.error) throw collectionsRes.error;

      const items = itemsRes.data || [];
      const totalCost = items.reduce((sum, i) => sum + (Number(i.purchase_price) || 0), 0);

      return {
        totalItems: items.length,
        totalCollections: collectionsRes.data?.length || 0,
        totalCost,
        portfolioValue: 0, // Will come from eBay prices later
      };
    },
    enabled: !!user,
  });
}

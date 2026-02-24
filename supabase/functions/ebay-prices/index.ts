import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { item_id, name, set_name, card_number, type } = await req.json();
    if (!item_id || !name) {
      return new Response(JSON.stringify({ error: "item_id and name are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const appId = Deno.env.get("EBAY_CLIENT_ID");
    if (!appId) throw new Error("EBAY_CLIENT_ID not configured");

    // Build search keywords — exclude bulk/lot listings
    const parts = [name, set_name, card_number].filter(Boolean);
    const isProduct = type === "product";
    const keywords = isProduct
      ? `Pokemon ${parts.join(" ")} sealed -lot -bundle -bulk -wholesale -playset -case`
      : `Pokemon ${parts.join(" ")} card -lot -bundle -bulk -wholesale -playset -case`;

    // Use Finding API — findCompletedItems (sold listings only)
    const url = new URL("https://svcs.ebay.com/services/search/FindingService/v1");
    url.searchParams.set("OPERATION-NAME", "findCompletedItems");
    url.searchParams.set("SERVICE-VERSION", "1.13.0");
    url.searchParams.set("SECURITY-APPNAME", appId);
    url.searchParams.set("RESPONSE-DATA-FORMAT", "JSON");
    url.searchParams.set("REST-PAYLOAD", "");
    url.searchParams.set("keywords", keywords);
    url.searchParams.set("categoryId", "183454"); // Trading Cards category
    url.searchParams.set("paginationInput.entriesPerPage", "40");
    url.searchParams.set("sortOrder", "EndTimeSoonest");
    // Only sold items (not unsold completed)
    url.searchParams.set("itemFilter(0).name", "SoldItemsOnly");
    url.searchParams.set("itemFilter(0).value", "true");
    // Condition: new / like new
    url.searchParams.set("itemFilter(1).name", "Condition");
    url.searchParams.set("itemFilter(1).value(0)", "1000"); // New
    url.searchParams.set("itemFilter(1).value(1)", "1500"); // New other
    url.searchParams.set("itemFilter(1).value(2)", "2500"); // Seller refurbished / Like New

    const res = await fetch(url.toString());
    if (!res.ok) {
      const errText = await res.text();
      console.error("eBay Finding API error:", res.status, errText);
      throw new Error(`eBay Finding API error [${res.status}]`);
    }

    const data = await res.json();
    const searchResult = data?.findCompletedItemsResponse?.[0]?.searchResult?.[0];
    const rawItems = searchResult?.item || [];

    // Filter out bulk/lot/case titles
    const bulkPattern = /\b(\d+x\b|\d+\s*x\s|\blot\b|\bbundle\b|\bwholesale\b|\bbulk\b|\bplayset\b|\bcollection\b|\bcase\b|\bfactory sealed case\b)/i;
    const items = rawItems.filter((i: any) => {
      const title = (i.title?.[0] || "").toLowerCase();
      if (bulkPattern.test(title)) return false;
      if (/^\d+\s*x\s/i.test(title)) return false;
      // Filter titles with quantity indicators like "6 box"
      if (/\b\d+\s*(x\s*)?box/i.test(title) && !/\b(36|1)\s/i.test(title)) return false;
      return true;
    });

    if (items.length === 0) {
      return new Response(
        JSON.stringify({ error: "No sold listings found on eBay for this item." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract sold prices
    const soldPrices = items
      .filter((i: any) => i.sellingStatus?.[0]?.currentPrice?.[0]?.__value__)
      .map((i: any) => ({
        price: parseFloat(i.sellingStatus[0].currentPrice[0].__value__),
        title: i.title?.[0] || "",
        date: i.listingInfo?.[0]?.endTime?.[0] || new Date().toISOString(),
        url: i.viewItemURL?.[0] || "",
        condition: i.condition?.[0]?.conditionDisplayName?.[0] || "",
      }))
      .sort((a: any, b: any) => b.price - a.price);

    if (soldPrices.length === 0) {
      return new Response(
        JSON.stringify({ error: "Could not extract prices from eBay results." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prices = soldPrices.map((s: any) => s.price);
    const average_price = parseFloat((prices.reduce((a: number, b: number) => a + b, 0) / prices.length).toFixed(2));
    const lowest_price = Math.min(...prices);
    const highest_price = Math.max(...prices);

    const result = {
      sold_prices: soldPrices.slice(0, 10),
      average_price,
      lowest_price,
      highest_price,
    };

    // Store in database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase.from("ebay_prices").delete().eq("item_id", item_id);
    await supabase.from("ebay_prices").insert({
      item_id,
      sold_prices: result.sold_prices,
      average_price: result.average_price,
      lowest_price: result.lowest_price,
      highest_price: result.highest_price,
    });

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ebay-prices error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

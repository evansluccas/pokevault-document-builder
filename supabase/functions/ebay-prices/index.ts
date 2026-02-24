import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Get an eBay OAuth Application token (client_credentials flow). */
async function getEbayToken(): Promise<string> {
  const clientId = Deno.env.get("EBAY_CLIENT_ID");
  const clientSecret = Deno.env.get("EBAY_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("eBay credentials not configured");

  const credentials = btoa(`${clientId}:${clientSecret}`);

  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("eBay token error:", res.status, text);
    throw new Error(`eBay auth failed [${res.status}]`);
  }

  const data = await res.json();
  return data.access_token;
}

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

    // Build search query
    const parts = [name, set_name, card_number].filter(Boolean);
    const isProduct = type === "product";
    const query = isProduct ? `Pokemon ${parts.join(" ")} sealed` : `Pokemon ${parts.join(" ")} card`;

    // Get eBay access token
    const token = await getEbayToken();

    // Search eBay Browse API for SOLD items using the item_summary/search endpoint
    // filter=buyingOptions:{FIXED_PRICE|AUCTION} and sort by endDate descending
    const searchUrl = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("filter", "buyingOptions:{FIXED_PRICE|AUCTION},conditions:{NEW|LIKE_NEW|VERY_GOOD}");
    searchUrl.searchParams.set("sort", "-price");
    searchUrl.searchParams.set("limit", "20");

    const searchRes = await fetch(searchUrl.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
        "Content-Type": "application/json",
      },
    });

    if (!searchRes.ok) {
      const errText = await searchRes.text();
      console.error("eBay search error:", searchRes.status, errText);
      throw new Error(`eBay API error [${searchRes.status}]`);
    }

    const searchData = await searchRes.json();
    const items = searchData.itemSummaries || [];

    if (items.length === 0) {
      return new Response(
        JSON.stringify({ error: "No listings found on eBay for this item." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract prices from results
    const soldPrices = items
      .filter((i: any) => i.price?.value)
      .map((i: any) => ({
        price: parseFloat(i.price.value),
        title: i.title || "",
        date: i.itemEndDate || new Date().toISOString(),
        url: i.itemWebUrl || "",
        condition: i.condition || "",
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
      sold_prices: soldPrices.slice(0, 10), // Keep top 10
      average_price,
      lowest_price,
      highest_price,
    };

    // Store in database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Upsert: delete old prices for this item, insert new
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

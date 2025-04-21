
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (req.method === "POST") {
      const { product_id, quantity } = await req.json();
      
      if (!product_id || !quantity) {
        return new Response(
          JSON.stringify({ error: "Product ID and quantity are required" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Get current stock
      const { data: product, error: fetchError } = await supabaseClient
        .from("products")
        .select("stock")
        .eq("id", product_id)
        .single();

      if (fetchError) {
        return new Response(
          JSON.stringify({ error: "Error fetching product stock", details: fetchError }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      if (!product) {
        return new Response(
          JSON.stringify({ error: "Product not found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        );
      }

      const newStock = Math.max(0, product.stock - quantity);

      // Update stock
      const { error: updateError } = await supabaseClient
        .from("products")
        .update({ stock: newStock })
        .eq("id", product_id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Error updating stock", details: updateError }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, newStock }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

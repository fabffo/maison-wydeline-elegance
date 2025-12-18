import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Server-side validation schema
    const checkoutSchema = z.object({
      customerName: z.string().trim().min(1).max(100),
      customerEmail: z.string().email().max(255),
      phone: z.string().trim().min(10).max(20),
      shippingAddress: z.object({
        nomComplet: z.string().trim().max(100).optional(),
        adresse1: z.string().trim().min(1).max(200),
        adresse2: z.string().trim().max(200).optional(),
        codePostal: z.string().trim().min(4).max(10),
        ville: z.string().trim().min(1).max(100),
        pays: z.string().length(2),
      }),
      items: z.array(z.object({
        productId: z.string(),
        productName: z.string().max(255),
        size: z.number().int().positive(),
        quantity: z.number().int().positive().max(10),
        unitPrice: z.number().positive(),
        isPreorder: z.boolean().optional(),
      })).min(1).max(20),
    });

    // Validate input
    const validationResult = checkoutSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(JSON.stringify({ 
        error: "Invalid input data", 
        details: validationResult.error.issues 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { customerName, customerEmail, phone, shippingAddress, items } = validationResult.data;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify all products exist and validate prices
    const productIds = items.map(item => item.productId);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, price")
      .in("id", productIds);

    if (productsError) {
      return new Response(JSON.stringify({ error: "Failed to verify products" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!products || products.length !== productIds.length) {
      return new Response(JSON.stringify({ error: "Some products do not exist" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate prices match database
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || Math.abs(product.price - item.unitPrice) > 0.01) {
        return new Response(JSON.stringify({ error: "Price mismatch detected" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    // Calculate total
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.unitPrice * item.quantity);
    }, 0);

    // Create order in database with shipping address
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        total_amount: totalAmount,
        status: "PENDING",
        shipping_address: {
          ...shippingAddress,
          phone,
        },
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      size: item.size,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
      is_preorder: item.isPreorder || false,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Check for existing customer
    const customers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });

    let customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    // Create Stripe checkout session
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: `${item.productName} - Taille ${item.size}`,
        },
        unit_amount: Math.round(item.unitPrice * 100),
      },
      quantity: item.quantity,
    }));

    // Get origin from request headers or fallback to referer
    let origin = req.headers.get("origin");
    if (!origin) {
      const referer = req.headers.get("referer");
      if (referer) {
        const url = new URL(referer);
        origin = url.origin;
      }
    }
    
    // Fallback to environment variable if headers don't provide origin
    if (!origin) {
      origin = Deno.env.get("SUPABASE_URL") ?? "";
    }

    console.log("Creating checkout session with origin:", origin);
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: lineItems,
      mode: "payment",
      payment_method_types: ['card'],
      success_url: `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/panier`,
      metadata: {
        orderId: order.id,
        phone,
        shippingAddress: JSON.stringify(shippingAddress),
      },
    });

    console.log("Checkout session created:", session.id, "URL:", session.url, "for order:", order.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

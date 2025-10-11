import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
      undefined,
      cryptoProvider
    );

    console.log("Webhook event:", event.type);

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("Payment succeeded:", paymentIntent.id);

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Find the order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .maybeSingle();

      if (orderError) {
        console.error("Error fetching order:", orderError);
        return new Response(JSON.stringify({ error: "Error fetching order" }), { status: 500 });
      }

      if (!order) {
        console.error("Order not found for payment intent:", paymentIntent.id);
        return new Response(JSON.stringify({ error: "Order not found" }), { status: 404 });
      }

      console.log("Order found:", order.id);

      // Update order status to A_PREPARER (ready to prepare)
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "A_PREPARER" })
        .eq("id", order.id);

      if (updateError) {
        console.error("Error updating order status:", updateError);
        throw updateError;
      }

      console.log("Order status updated to A_PREPARER");

      // Reserve stock for the order
      const { error: stockError } = await supabase.rpc('reserve_stock_for_order', { 
        _order_id: order.id 
      });

      if (stockError) {
        console.error("Stock reservation error:", stockError);
      } else {
        console.log("Stock reserved successfully");
      }

      // Generate invoice
      const invoiceNumber = await generateInvoiceNumber(supabase);
      const { error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          order_id: order.id,
          invoice_number: invoiceNumber,
        });

      if (invoiceError) {
        console.error("Error creating invoice:", invoiceError);
        throw invoiceError;
      }

      console.log("Invoice created:", invoiceNumber);

      // Get order items for email
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);

      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
      }

      // Send confirmation email
      try {
        const { data: emailData, error: emailError } = await supabase.functions.invoke(
          'send-order-confirmation',
          {
            body: {
              customerName: order.customer_name,
              customerEmail: order.customer_email,
              orderNumber: order.id.slice(0, 8),
              items: orderItems?.map((item: any) => ({
                productName: item.product_name,
                size: item.size,
                quantity: item.quantity,
                unitPrice: Number(item.unit_price),
                totalPrice: Number(item.total_price),
              })) || [],
              totalAmount: Number(order.total_amount),
              invoiceNumber: invoiceNumber,
            },
          }
        );

        if (emailError) {
          console.error("Error sending confirmation email:", emailError);
        } else {
          console.log("Confirmation email sent successfully");
        }
      } catch (emailErr) {
        console.error("Exception sending email:", emailErr);
      }

      // Notify admins about new order
      const { error: notifyError } = await supabase.rpc('notify_admins', {
        _type: 'ORDER_CREATED',
        _title: 'Nouvelle commande',
        _message: `Nouvelle commande ${order.id.slice(0, 8)} - ${order.customer_name}`,
        _reference_id: order.id
      });

      if (notifyError) {
        console.error("Notification error:", notifyError);
      } else {
        console.log("Admin notification sent");
      }

      // Notify admins about invoice generation
      await supabase.rpc('notify_admins', {
        _type: 'INVOICE_GENERATED',
        _title: 'Facture générée',
        _message: `Facture ${invoiceNumber} créée pour la commande ${order.id.slice(0, 8)}`,
        _reference_id: order.id
      });

      console.log("Webhook processing completed successfully");
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(error.message, { status: 400 });
  }
});

async function generateInvoiceNumber(supabase: any): Promise<string> {
  const { data } = await supabase.rpc("generate_invoice_number");
  return data || `MW-${new Date().getFullYear()}-${Date.now()}`;
}

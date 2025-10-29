import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  items: Array<{
    productName: string;
    size: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  invoiceNumber?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      customerName, 
      customerEmail, 
      orderNumber, 
      items, 
      totalAmount,
      invoiceNumber 
    }: OrderConfirmationRequest = await req.json();

    console.log("Sending order confirmation to:", customerEmail);

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.size}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.unitPrice.toFixed(2)} €</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${item.totalPrice.toFixed(2)} €</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
            .content { background: white; padding: 30px; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f5f5f5; padding: 10px; text-align: left; font-weight: bold; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Wydeline</h1>
              <p>Confirmation de commande</p>
            </div>
            <div class="content">
              <h2>Merci pour votre commande, ${customerName} !</h2>
              <p>Votre commande a été confirmée et sera traitée dans les plus brefs délais.</p>
              
              <p><strong>Numéro de commande :</strong> ${orderNumber}</p>
              ${invoiceNumber ? `<p><strong>Numéro de facture :</strong> ${invoiceNumber}</p>` : ''}
              
              <h3>Détails de la commande</h3>
              <table>
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Taille</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div class="total">
                Total : ${totalAmount.toFixed(2)} €
              </div>
              
              <p style="margin-top: 30px;">Nous vous tiendrons informé de l'évolution de votre commande.</p>
              <p>Pour toute question, n'hésitez pas à nous contacter.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Wydeline - Tous droits réservés</p>
              <p>Cet email est envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Wydeline <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `Confirmation de commande ${orderNumber}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log email to database
    await supabase.from('email_logs').insert({
      recipient_email: customerEmail,
      subject: `Confirmation de commande ${orderNumber}`,
      email_type: 'ORDER_CONFIRMATION',
      status: 'sent',
      metadata: { 
        order_number: orderNumber,
        invoice_number: invoiceNumber,
        total_amount: totalAmount
      }
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    
    // Log error to database
    try {
      const body: OrderConfirmationRequest = await req.json();
      await supabase.from('email_logs').insert({
        recipient_email: body.customerEmail || 'unknown',
        subject: `Confirmation de commande ${body.orderNumber || ''}`,
        email_type: 'ORDER_CONFIRMATION',
        status: 'failed',
        error_message: error.message,
        metadata: { order_number: body.orderNumber }
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
  shippingAddress?: {
    adresse1: string;
    adresse2?: string;
    codePostal: string;
    ville: string;
    pays: string;
  };
}

function generateOrderPdf(data: OrderConfirmationRequest): string {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Maison Wydeline", 20, 25);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Maison de chaussures", 20, 32);
  
  // Order badge
  doc.setFillColor(26, 26, 26);
  doc.rect(pageWidth - 70, 15, 55, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("BON DE COMMANDE", pageWidth - 42.5, 23, { align: "center" });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Order info box
  doc.setFillColor(250, 250, 250);
  doc.rect(20, 45, pageWidth - 40, 28, 'F');
  doc.setDrawColor(26, 26, 26);
  doc.setLineWidth(0.5);
  doc.line(20, 45, 20, 73);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Commande N° : ${data.orderNumber}`, 25, 55);
  doc.setFont("helvetica", "normal");
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 25, 62);
  doc.text(`Client : ${data.customerName}`, 25, 69);
  
  if (data.invoiceNumber) {
    doc.text(`Facture N° : ${data.invoiceNumber}`, 120, 55);
  }
  
  // Shipping address
  let yPos = 88;
  if (data.shippingAddress) {
    doc.setFont("helvetica", "bold");
    doc.text("Adresse de livraison :", 20, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 7;
    doc.text(data.shippingAddress.adresse1, 20, yPos);
    if (data.shippingAddress.adresse2) {
      yPos += 5;
      doc.text(data.shippingAddress.adresse2, 20, yPos);
    }
    yPos += 5;
    doc.text(`${data.shippingAddress.codePostal} ${data.shippingAddress.ville}`, 20, yPos);
    yPos += 5;
    doc.text(data.shippingAddress.pays, 20, yPos);
    yPos += 15;
  }
  
  // Table header
  doc.setFillColor(26, 26, 26);
  doc.rect(20, yPos, pageWidth - 40, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Produit", 25, yPos + 7);
  doc.text("Taille", 95, yPos + 7);
  doc.text("Qté", 115, yPos + 7);
  doc.text("Prix unit.", 135, yPos + 7);
  doc.text("Total", 170, yPos + 7);
  
  yPos += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  // Table rows
  data.items.forEach((item, index) => {
    yPos += 10;
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(20, yPos - 6, pageWidth - 40, 10, 'F');
    }
    doc.text(item.productName.substring(0, 30), 25, yPos);
    doc.text(item.size.toString(), 97, yPos);
    doc.text(item.quantity.toString(), 117, yPos);
    doc.text(`${item.unitPrice.toFixed(2)} €`, 135, yPos);
    doc.setFont("helvetica", "bold");
    doc.text(`${item.totalPrice.toFixed(2)} €`, 170, yPos);
    doc.setFont("helvetica", "normal");
  });
  
  // Total row
  yPos += 15;
  doc.setDrawColor(26, 26, 26);
  doc.setLineWidth(0.5);
  doc.line(20, yPos - 5, pageWidth - 20, yPos - 5);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total", 135, yPos + 2);
  doc.text(`${data.totalAmount.toFixed(2)} €`, 170, yPos + 2);
  
  // Thank you message
  yPos += 25;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Merci pour votre commande !", pageWidth / 2, yPos, { align: "center" });
  doc.setFontSize(9);
  doc.text("Nous vous tiendrons informé de l'évolution de votre commande.", pageWidth / 2, yPos + 7, { align: "center" });
  
  // Page footer
  doc.setFontSize(8);
  doc.text(`© ${new Date().getFullYear()} Wydeline - Tous droits réservés`, pageWidth / 2, 285, { align: "center" });
  
  return doc.output('datauristring').split(',')[1];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: OrderConfirmationRequest = await req.json();
    const { 
      customerName, 
      customerEmail, 
      orderNumber, 
      items, 
      totalAmount,
      invoiceNumber,
      shippingAddress
    } = requestData;

    console.log("Sending order confirmation to:", customerEmail);

    // Generate PDF
    const pdfBase64 = generateOrderPdf(requestData);
    console.log("Order PDF generated successfully");

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(item.productName)}</td>
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
            .pdf-notice { background: #1a1a1a; color: white; padding: 15px; text-align: center; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Wydeline</h1>
              <p>Confirmation de commande</p>
            </div>
            <div class="content">
              <h2>Merci pour votre commande, ${escapeHtml(customerName)} !</h2>
              <p>Votre commande a été confirmée et sera traitée dans les plus brefs délais.</p>
              
              <p><strong>Numéro de commande :</strong> ${escapeHtml(orderNumber)}</p>
              ${invoiceNumber ? `<p><strong>Numéro de facture :</strong> ${escapeHtml(invoiceNumber)}</p>` : ''}
              
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
              
              <div class="pdf-notice">
                📎 Votre bon de commande PDF est joint à cet email
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
      from: "Maison Wydeline <no-reply@wavyservices.fr>",
      to: [customerEmail],
      subject: `Confirmation de commande ${orderNumber}`,
      html: emailHtml,
      attachments: [
        {
          filename: `commande-${orderNumber}.pdf`,
          content: pdfBase64,
        }
      ]
    });

    console.log("Email sent successfully with PDF:", emailResponse);

    await supabase.from('email_logs').insert({
      recipient_email: customerEmail,
      subject: `Confirmation de commande ${orderNumber}`,
      email_type: 'ORDER_CONFIRMATION',
      status: 'sent',
      metadata: { 
        order_number: orderNumber,
        invoice_number: invoiceNumber,
        total_amount: totalAmount,
        has_pdf: true
      }
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

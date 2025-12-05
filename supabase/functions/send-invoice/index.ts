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

interface InvoiceEmailRequest {
  customerName: string;
  customerEmail: string;
  invoiceNumber: string;
  invoiceDate: string;
  orderNumber: string;
  items: Array<{
    productName: string;
    size: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  shippingAddress?: {
    adresse1: string;
    adresse2?: string;
    codePostal: string;
    ville: string;
    pays: string;
  };
}

function generateInvoicePdf(data: InvoiceEmailRequest): string {
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
  
  // Invoice badge
  doc.setFillColor(139, 115, 85);
  doc.rect(pageWidth - 60, 15, 45, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURE", pageWidth - 37.5, 23, { align: "center" });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Invoice info box
  doc.setFillColor(250, 250, 250);
  doc.rect(20, 45, pageWidth - 40, 35, 'F');
  doc.setDrawColor(139, 115, 85);
  doc.setLineWidth(0.5);
  doc.line(20, 45, 20, 80);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Facture N° : ${data.invoiceNumber}`, 25, 55);
  doc.setFont("helvetica", "normal");
  doc.text(`Date : ${data.invoiceDate}`, 25, 62);
  doc.text(`Commande N° : ${data.orderNumber}`, 25, 69);
  doc.text(`Client : ${data.customerName}`, 25, 76);
  
  // Shipping address if available
  let yPos = 95;
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
  doc.text("Article", 25, yPos + 7);
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
  doc.text("Total TTC", 135, yPos + 2);
  doc.text(`${data.totalAmount.toFixed(2)} €`, 170, yPos + 2);
  
  // Footer
  yPos += 30;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Maison Wydeline", 20, yPos);
  doc.text("TVA non applicable, art. 293 B du CGI", 20, yPos + 5);
  
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
    const requestData: InvoiceEmailRequest = await req.json();
    const { 
      customerName, 
      customerEmail, 
      invoiceNumber,
      invoiceDate,
      orderNumber, 
      items, 
      totalAmount,
      shippingAddress
    } = requestData;

    console.log("Sending invoice email to:", customerEmail, "Invoice:", invoiceNumber);

    // Generate PDF
    const pdfBase64 = generateInvoicePdf(requestData);
    console.log("PDF generated successfully");

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">${escapeHtml(item.productName)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${item.size}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">${item.unitPrice.toFixed(2)} €</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right; font-weight: 600;">${item.totalPrice.toFixed(2)} €</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 650px; margin: 0 auto; background: white; }
            .header { background: #1a1a1a; color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 3px; }
            .invoice-badge { display: inline-block; background: #8B7355; color: white; padding: 8px 20px; font-size: 14px; letter-spacing: 1px; margin-top: 15px; }
            .content { padding: 40px; }
            .invoice-info { background: #fafafa; padding: 25px; margin-bottom: 30px; border-left: 4px solid #8B7355; }
            .invoice-info p { margin: 8px 0; }
            .invoice-info strong { color: #1a1a1a; }
            table { width: 100%; border-collapse: collapse; margin: 25px 0; }
            th { background: #1a1a1a; color: white; padding: 14px 12px; text-align: left; font-weight: 500; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
            th:nth-child(2), th:nth-child(3) { text-align: center; }
            th:nth-child(4), th:nth-child(5) { text-align: right; }
            .total-row { background: #fafafa; }
            .total-row td { padding: 16px 12px; font-size: 16px; font-weight: 700; border-top: 2px solid #1a1a1a; }
            .footer { background: #1a1a1a; color: #999; padding: 25px; text-align: center; font-size: 12px; }
            .footer p { margin: 5px 0; }
            .pdf-notice { background: #8B7355; color: white; padding: 15px; text-align: center; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>WYDELINE</h1>
              <div class="invoice-badge">FACTURE</div>
            </div>
            <div class="content">
              <div class="invoice-info">
                <p><strong>Facture N° :</strong> ${escapeHtml(invoiceNumber)}</p>
                <p><strong>Date :</strong> ${escapeHtml(invoiceDate)}</p>
                <p><strong>Commande N° :</strong> ${escapeHtml(orderNumber)}</p>
                <p><strong>Client :</strong> ${escapeHtml(customerName)}</p>
              </div>
              
              <h3 style="color: #1a1a1a; font-weight: 500; margin-bottom: 15px;">Détails de la facture</h3>
              <table>
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Taille</th>
                    <th>Qté</th>
                    <th>Prix unit.</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr class="total-row">
                    <td colspan="4" style="text-align: right;">Total TTC</td>
                    <td style="text-align: right;">${totalAmount.toFixed(2)} €</td>
                  </tr>
                </tbody>
              </table>
              
              <div class="pdf-notice">
                📎 Votre facture PDF est jointe à cet email
              </div>
              
              <p style="margin-top: 30px; color: #666;">
                Pour toute question concernant cette facture, n'hésitez pas à nous contacter.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Wydeline - Tous droits réservés</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Maison Wydeline <no-reply@wavyservices.fr>",
      to: [customerEmail],
      subject: `Facture ${invoiceNumber} - Wydeline`,
      html: emailHtml,
      attachments: [
        {
          filename: `facture-${invoiceNumber}.pdf`,
          content: pdfBase64,
        }
      ]
    });

    console.log("Invoice email sent successfully with PDF:", emailResponse);

    await supabase.from('email_logs').insert({
      recipient_email: customerEmail,
      subject: `Facture ${invoiceNumber} - Wydeline`,
      email_type: 'INVOICE',
      status: 'sent',
      metadata: { 
        invoice_number: invoiceNumber,
        order_number: orderNumber,
        total_amount: totalAmount,
        has_pdf: true
      }
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending invoice email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  message: string;
}

interface ContactRecipient {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
}

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br>");
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-contact-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message }: ContactEmailRequest = await req.json();
    
    console.log("Contact form submission from:", email);

    // Validate inputs
    if (!name || !email || !message) {
      throw new Error("Missing required fields: name, email, or message");
    }

    if (name.length > 100 || email.length > 255 || message.length > 5000) {
      throw new Error("Field length exceeds maximum allowed");
    }

    // Initialize Supabase client with service role key to access contact recipients securely
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Fetch active contact recipients from database
    const { data: recipients, error: fetchError } = await supabase
      .from("contact_recipients")
      .select("id, name, email, is_active")
      .eq("is_active", true);

    if (fetchError) {
      console.error("Error fetching contact recipients:", fetchError);
      throw new Error("Failed to fetch contact recipients");
    }

    if (!recipients || recipients.length === 0) {
      console.warn("No active contact recipients configured, using fallback");
      // Fallback to default email if no recipients configured
      recipients?.push({ 
        id: "fallback", 
        name: "Contact Principal", 
        email: "contact@maisonwydeline.com",
        is_active: true 
      });
    }

    const recipientEmails = recipients.map((r: ContactRecipient) => r.email);
    console.log("Sending notification to recipients:", recipientEmails);

    // Send notification email to all active recipients
    const notificationResponse = await resend.emails.send({
      from: "Maison Wydeline <no-reply@wavyservices.fr>",
      to: recipientEmails,
      reply_to: email,
      subject: `Nouveau message de contact - ${escapeHtml(name)}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
            Nouveau message de contact
          </h1>
          
          <div style="margin: 20px 0; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #d4af37;">
            <p style="margin: 0 0 10px 0;"><strong>Nom:</strong> ${escapeHtml(name)}</p>
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h2 style="color: #1a1a1a; font-size: 16px;">Message:</h2>
            <div style="padding: 15px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 4px;">
              ${escapeHtml(message)}
            </div>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Ce message a été envoyé depuis le formulaire de contact du site Maison Wydeline.
          </p>
        </div>
      `,
    });

    console.log("Notification email sent:", notificationResponse);

    // Send confirmation email to the customer
    const confirmationResponse = await resend.emails.send({
      from: "Maison Wydeline <no-reply@wavyservices.fr>",
      to: [email],
      subject: "Nous avons bien reçu votre message - Maison Wydeline",
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
            Merci pour votre message
          </h1>
          
          <p style="color: #333; line-height: 1.6;">
            Chère ${escapeHtml(name)},
          </p>
          
          <p style="color: #333; line-height: 1.6;">
            Nous avons bien reçu votre message et nous vous en remercions.
            Notre équipe vous répondra dans les plus brefs délais.
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #d4af37;">
            <p style="margin: 0; font-style: italic; color: #666;">
              Votre message:
            </p>
            <p style="margin: 10px 0 0 0; color: #333;">
              ${escapeHtml(message)}
            </p>
          </div>
          
          <p style="color: #333; line-height: 1.6;">
            À très bientôt,<br>
            L'équipe Maison Wydeline
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Maison Wydeline - Chaussures grandes pointures pour femmes
          </p>
        </div>
      `,
    });

    console.log("Confirmation email sent:", confirmationResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Emails sent successfully",
        recipientCount: recipientEmails.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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

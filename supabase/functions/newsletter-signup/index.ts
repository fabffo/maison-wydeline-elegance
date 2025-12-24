import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignupRequest {
  email: string;
  source_path?: string;
}

interface PromoCode {
  id: string;
  code: string;
  label: string | null;
  type: string;
  value: number | null;
  min_cart_amount: number | null;
  ends_at: string | null;
  usage_limit_per_email: number;
  used_count: number;
}

const generateWelcomeEmailHtml = (
  code: string, 
  type: string, 
  value: number | null, 
  minCartAmount: number | null, 
  endsAt: string | null
): string => {
  const formatValue = () => {
    if (type === 'percent') return `${value}%`;
    if (type === 'fixed') return `${value}€`;
    if (type === 'free_shipping') return 'Livraison offerte';
    return '';
  };

  const conditions: string[] = [];
  if (minCartAmount) conditions.push(`Valable dès ${minCartAmount}€ d'achat`);
  if (endsAt) conditions.push(`Offre valable jusqu'au ${new Date(endsAt).toLocaleDateString('fr-FR')}`);

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue chez Maison Wydeline</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #f8f6f3;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-collapse: collapse;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e8e4de;">
              <h1 style="margin: 0; font-size: 28px; font-weight: normal; color: #2d2926; letter-spacing: 2px;">
                MAISON WYDELINE
              </h1>
            </td>
          </tr>
          
          <!-- Welcome Message -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: normal; color: #2d2926; text-align: center;">
                Bienvenue dans le Cercle Maison Wydeline
              </h2>
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #5a5652; text-align: center;">
                Merci pour votre inscription. Nous sommes ravis de vous accueillir parmi nos membres privilégiés. 
                Découvrez notre collection de chaussures élégantes, du 41 au 45, fabriquées avec soin au Portugal.
              </p>
              
              <!-- Promo Code Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td style="background-color: #f8f6f3; padding: 30px; text-align: center; border: 1px solid #e8e4de;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #8a8580; text-transform: uppercase; letter-spacing: 1px;">
                      Votre avantage exclusif : ${formatValue()}
                    </p>
                    <p style="margin: 0; font-size: 32px; font-weight: bold; color: #2d2926; letter-spacing: 3px;">
                      ${code}
                    </p>
                    ${conditions.length > 0 ? `
                    <p style="margin: 15px 0 0; font-size: 13px; color: #8a8580;">
                      ${conditions.join(' • ')}
                    </p>
                    ` : ''}
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://maisonwydeline.com/collection" 
                       style="display: inline-block; padding: 16px 40px; background-color: #2d2926; color: #ffffff; text-decoration: none; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">
                      Découvrir la collection
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f6f3; text-align: center; border-top: 1px solid #e8e4de;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #8a8580;">
                Maison Wydeline — Chaussures élégantes du 41 au 45
              </p>
              <p style="margin: 0; font-size: 11px; color: #a9a5a0;">
                Pour vous désinscrire, cliquez <a href="https://maisonwydeline.com/unsubscribe" style="color: #8a8580;">ici</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, source_path }: SignupRequest = await req.json();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Email invalide" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if subscriber exists
    const { data: existingSubscriber } = await supabase
      .from("newsletter_subscribers")
      .select("id, status, promo_code, promo_code_id")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existingSubscriber) {
      // If unsubscribed, refuse
      if (existingSubscriber.status === "unsubscribed") {
        return new Response(
          JSON.stringify({ ok: false, error: "Cet email s'est désinscrit. Veuillez nous contacter pour vous réinscrire." }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Already subscribed - return existing promo code
      if (existingSubscriber.promo_code) {
        // Get promo details
        const { data: promoDetails } = await supabase
          .from("promo_codes")
          .select("type, value, min_cart_amount, ends_at")
          .eq("id", existingSubscriber.promo_code_id)
          .maybeSingle();

        return new Response(
          JSON.stringify({
            ok: true,
            already_subscribed: true,
            promo_code: existingSubscriber.promo_code,
            promo_type: promoDetails?.type || "percent",
            promo_value: promoDetails?.value || 10,
            min_cart_amount: promoDetails?.min_cart_amount,
            ends_at: promoDetails?.ends_at
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Find active promo code (prioritize WYDELINE10 or first active)
    const { data: promoCodes } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("is_active", true)
      .or("starts_at.is.null,starts_at.lte.now()")
      .or("ends_at.is.null,ends_at.gte.now()")
      .order("created_at", { ascending: true })
      .limit(10);

    if (!promoCodes || promoCodes.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: "Aucun code promo disponible actuellement" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Prefer WYDELINE10 or take first
    const promo: PromoCode = promoCodes.find(p => p.code === "WYDELINE10") || promoCodes[0];

    // Check usage limit per email
    const { count: existingAssignments } = await supabase
      .from("promo_assignments")
      .select("*", { count: "exact", head: true })
      .eq("promo_code_id", promo.id)
      .eq("email", email.toLowerCase().trim());

    if (existingAssignments && existingAssignments >= promo.usage_limit_per_email) {
      // Already assigned, return the code anyway
      return new Response(
        JSON.stringify({
          ok: true,
          already_assigned: true,
          promo_code: promo.code,
          promo_type: promo.type,
          promo_value: promo.value,
          min_cart_amount: promo.min_cart_amount,
          ends_at: promo.ends_at
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create or update subscriber
    let subscriberId: string;
    if (existingSubscriber) {
      subscriberId = existingSubscriber.id;
      await supabase
        .from("newsletter_subscribers")
        .update({
          promo_code_id: promo.id,
          promo_code: promo.code,
          source_path: source_path || null,
          status: "active"
        })
        .eq("id", subscriberId);
    } else {
      const { data: newSubscriber, error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email: email.toLowerCase().trim(),
          promo_code_id: promo.id,
          promo_code: promo.code,
          source_path: source_path || null,
          status: "active"
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Error inserting subscriber:", insertError);
        return new Response(
          JSON.stringify({ ok: false, error: "Erreur lors de l'inscription" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      subscriberId = newSubscriber.id;
    }

    // Create promo assignment
    await supabase.from("promo_assignments").insert({
      promo_code_id: promo.id,
      subscriber_id: subscriberId,
      email: email.toLowerCase().trim()
    });

    // Increment used_count
    await supabase
      .from("promo_codes")
      .update({ used_count: promo.used_count + 1 })
      .eq("id", promo.id);

    // Send email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    let emailStatus = "sent";
    let emailError: string | null = null;

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const emailHtml = generateWelcomeEmailHtml(
          promo.code,
          promo.type,
          promo.value,
          promo.min_cart_amount,
          promo.ends_at
        );

        const { error: resendError } = await resend.emails.send({
          from: "Maison Wydeline <contact@maisonwydeline.com>",
          to: [email],
          subject: "Bienvenue chez Maison Wydeline — votre avantage exclusif",
          html: emailHtml
        });

        if (resendError) {
          console.error("Resend error:", resendError);
          emailStatus = "failed";
          emailError = resendError.message || "Email sending failed";
        }
      } catch (e: unknown) {
        console.error("Email sending error:", e);
        emailStatus = "failed";
        emailError = e instanceof Error ? e.message : "Email sending failed";
      }
    } else {
      console.log("RESEND_API_KEY not configured, skipping email");
      emailStatus = "skipped";
    }

    // Update last_email_sent_at
    await supabase
      .from("newsletter_subscribers")
      .update({ last_email_sent_at: new Date().toISOString() })
      .eq("id", subscriberId);

    // Log to email_logs
    await supabase.from("email_logs").insert({
      email_type: "newsletter_welcome",
      template_key: "newsletter_welcome",
      provider: "resend",
      recipient_email: email.toLowerCase().trim(),
      subject: "Bienvenue chez Maison Wydeline — votre avantage exclusif",
      status: emailStatus,
      error_message: emailError,
      related_table: "newsletter_subscribers",
      related_id: subscriberId,
      metadata: {
        promo_code_id: promo.id,
        promo_code_masked: promo.code.substring(0, 3) + "***",
        source_path: source_path || null
      }
    });

    console.log(`Newsletter signup successful for ${email}, promo: ${promo.code}`);

    return new Response(
      JSON.stringify({
        ok: true,
        promo_code: promo.code,
        promo_type: promo.type,
        promo_value: promo.value,
        min_cart_amount: promo.min_cart_amount,
        ends_at: promo.ends_at
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Newsletter signup error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: "Erreur interne du serveur" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

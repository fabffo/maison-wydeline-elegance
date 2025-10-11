import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  user: {
    email: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AuthEmailRequest = await req.json();
    console.log("Received auth email request:", payload.email_data.email_action_type);

    const { user, email_data } = payload;
    const resetUrl = `${email_data.redirect_to}#access_token=${email_data.token}&type=recovery`;

    let subject = "";
    let htmlContent = "";

    // Gérer les différents types d'emails d'authentification
    switch (email_data.email_action_type) {
      case "recovery":
        subject = "Réinitialisation de votre mot de passe - Maison Wydeline";
        htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 30px; }
                .button { 
                  display: inline-block; 
                  background-color: #000; 
                  color: #fff !important; 
                  padding: 12px 30px; 
                  text-decoration: none; 
                  border-radius: 4px;
                  margin: 20px 0;
                }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Maison Wydeline</h1>
                </div>
                <div class="content">
                  <h2>Réinitialisation de votre mot de passe</h2>
                  <p>Bonjour,</p>
                  <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                  <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
                  </div>
                  <p>Ce lien est valable pendant 1 heure.</p>
                  <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
                  <p>Cordialement,<br>L'équipe Maison Wydeline</p>
                </div>
                <div class="footer">
                  <p>Cet email a été envoyé par Maison Wydeline</p>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      case "signup":
      case "invite":
        subject = "Confirmez votre inscription - Maison Wydeline";
        const confirmUrl = `${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}&type=signup&redirect_to=${email_data.redirect_to}`;
        htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 30px; }
                .button { 
                  display: inline-block; 
                  background-color: #000; 
                  color: #fff !important; 
                  padding: 12px 30px; 
                  text-decoration: none; 
                  border-radius: 4px;
                  margin: 20px 0;
                }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Maison Wydeline</h1>
                </div>
                <div class="content">
                  <h2>Bienvenue chez Maison Wydeline !</h2>
                  <p>Bonjour,</p>
                  <p>Merci de vous être inscrit. Pour finaliser votre inscription, veuillez confirmer votre adresse email :</p>
                  <div style="text-align: center;">
                    <a href="${confirmUrl}" class="button">Confirmer mon email</a>
                  </div>
                  <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
                  <p>Cordialement,<br>L'équipe Maison Wydeline</p>
                </div>
                <div class="footer">
                  <p>Cet email a été envoyé par Maison Wydeline</p>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      default:
        subject = "Email de Maison Wydeline";
        htmlContent = `
          <h1>Maison Wydeline</h1>
          <p>Un email vous a été envoyé depuis votre compte Maison Wydeline.</p>
        `;
    }

    const emailResponse = await resend.emails.send({
      from: "Maison Wydeline <onboarding@resend.dev>",
      to: [user.email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
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

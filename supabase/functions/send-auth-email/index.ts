// deno-lint-ignore-file no-explicit-any
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const RESEND_FROM = Deno.env.get("RESEND_FROM") || "Maison Wydeline <no-reply@wavyservices.fr>";
const RESEND_BCC = Deno.env.get("RESEND_BCC") || "";
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "https://wavyservices.fr";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type HookPayload = { 
  type: "PASSWORD_RECOVERY" | "SIGNUP" | string; 
  email: string; 
  action_link?: string; 
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, email, action_link }: HookPayload = await req.json();
    console.log(`Auth Hook received: type=${type}, email=${email}`);

    let subject = "Maison Wydeline • Notification";
    let html = "";

    if (type === "PASSWORD_RECOVERY") {
      const url = action_link || `${FRONTEND_URL}/auth/recovery`;
      subject = "Réinitialisation de votre mot de passe";
      html = `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;padding:24px">
        <h2 style="margin:0 0 12px">Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe pour <b>Maison Wydeline</b>.</p>
        <p><a href="${url}" style="display:inline-block;background:#111;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none">Choisir un nouveau mot de passe</a></p>
        <p style="color:#666;font-size:12px;margin-top:24px">Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
      </div>`;
    } else if (type === "SIGNUP") {
      const url = action_link || `${FRONTEND_URL}/auth/confirm`;
      subject = "Confirmez votre inscription";
      html = `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;padding:24px">
        <h2 style="margin:0 0 12px">Bienvenue chez Maison Wydeline</h2>
        <p>Veuillez confirmer votre adresse e-mail pour activer votre compte.</p>
        <p><a href="${url}" style="display:inline-block;background:#111;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none">Confirmer mon e-mail</a></p>
      </div>`;
    } else {
      console.log(`Unhandled auth event type: ${type}`);
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const emailPayload: any = {
      from: RESEND_FROM,
      to: [email],
      subject,
      html
    };

    if (RESEND_BCC) {
      emailPayload.bcc = [RESEND_BCC];
    }

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${RESEND_API_KEY}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(emailPayload)
    });

    if (!r.ok) {
      const errorText = await r.text();
      console.error(`Resend API error: ${r.status} - ${errorText}`);
      return new Response("resend_error", { status: 502, headers: corsHeaders });
    }

    const result = await r.json();
    console.log("Email sent successfully via Resend:", result);

    return new Response(JSON.stringify({ ok: true }), { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (error) {
    console.error("Error in send-auth-email function:", error);
    return new Response("bad_request", { status: 400, headers: corsHeaders });
  }
});

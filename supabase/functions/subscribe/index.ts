import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Note: This function intentionally allows unauthenticated access
// for public newsletter signups. Abuse prevention handled by Resend rate limiting.

interface SubscribeRequest {
  email: string;
}

// Allow unauthenticated requests (anon access is safe for a newsletter signup)
serve(async (req) => {
  // Handle CORS (must come first)
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const { email } = (await req.json()) as SubscribeRequest;

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Log subscription (in production, save to database or email service)
    console.log(`Newsletter subscription: ${email}`);

    // Optional: Send confirmation email via Resend
    if (RESEND_API_KEY) {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "noreply@th3scr1b3.art",
          to: email,
          subject: "Welcome to th3scr1b3 Updates",
          html: `<p>Thanks for subscribing! You'll get updates when new releases drop.</p>`,
        }),
      });

      if (!resendResponse.ok) {
        console.error("Resend email failed:", await resendResponse.text());
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Subscribed!" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Subscribe error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }
});

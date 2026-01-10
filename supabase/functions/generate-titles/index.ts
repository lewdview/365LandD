import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Clean up filename to create a title (matches the logic in src/services/supabase.ts)
function fileNameToTitle(fileName: string): string {
  return fileName
    .replace(/\.(mp3|wav|flac|m4a)$/i, "")
    .replace(/_/g, " ")
    .replace(/[-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { fileName, entryId } = (await req.json()) as {
      fileName?: string;
      entryId?: string;
    };

    if (!fileName) {
      return new Response(
        JSON.stringify({ error: "fileName is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const title = fileNameToTitle(fileName);
    console.log(`Generated title for ${fileName}: "${title}"`);

    return new Response(
      JSON.stringify({ success: true, title }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Generate title error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

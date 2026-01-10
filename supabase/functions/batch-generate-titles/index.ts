import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

const client = createClient(supabaseUrl, supabaseAnonKey);

function fileNameToTitle(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, "") // Remove file extension
    .replace(/[_-]/g, " ") // Replace underscores and hyphens with spaces
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim();
}

async function batchGenerateTitles(req: Request) {
  // GET: find entries with missing titles
  // POST with ?execute=true: actually update them
  if (req.method === "GET") {
    try {
      const { data, error } = await client
        .from("song_analyses")
        .select("id, title, fileName")
        .or(
          'title.is.null,title.eq."",title.ilike.%unknown%'
        )
        .limit(100);

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400 }
        );
      }

      return new Response(
        JSON.stringify({
          count: data?.length || 0,
          entries: data,
          message: "Found entries with missing/unknown titles. POST with ?execute=true to update.",
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
      });
    }
  }

  // POST: execute the title generation
  if (req.method === "POST") {
    const url = new URL(req.url);
    const execute = url.searchParams.get("execute") === "true";

    if (!execute) {
      return new Response(
        JSON.stringify({
          error: "Use ?execute=true to actually update titles",
        }),
        { status: 400 }
      );
    }

    try {
      // Get entries with missing titles
      const { data: entries, error: fetchError } = await client
        .from("song_analyses")
        .select("id, title, fileName")
        .or(
          'title.is.null,title.eq."",title.ilike.%unknown%'
        )
        .limit(100);

      if (fetchError) {
        return new Response(
          JSON.stringify({ error: fetchError.message }),
          { status: 400 }
        );
      }

      if (!entries || entries.length === 0) {
        return new Response(
          JSON.stringify({ message: "No entries with missing titles found" }),
          { status: 200 }
        );
      }

      // Generate titles and batch update
      const updates = entries.map((entry: any) => ({
        id: entry.id,
        title: fileNameToTitle(entry.fileName),
      }));

      // Supabase doesn't have batch upsert, so we'll update one by one
      const results = [];
      for (const update of updates) {
        const { error: updateError } = await client
          .from("song_analyses")
          .update({ title: update.title })
          .eq("id", update.id);

        if (updateError) {
          results.push({
            id: update.id,
            success: false,
            error: updateError.message,
          });
        } else {
          results.push({
            id: update.id,
            title: update.title,
            success: true,
          });
        }
      }

      return new Response(
        JSON.stringify({
          message: `Updated ${results.filter((r: any) => r.success).length}/${results.length} entries`,
          results,
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
      });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
  });
}

Deno.serve(batchGenerateTitles);

import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req: Request) => {
  // Simple content-type header is all we need
  const headers = { "Content-Type": "application/json" };

  try {
    // Handle GET request - fetch messages
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify(data), { headers });
    }

    // Handle POST request - add message
    if (req.method === "POST") {
      const { content } = await req.json();
      const { error } = await supabase.from("messages").insert([{ content }]);

      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, message: "Message sent!" }),
        { headers }
      );
    }

    // Handle PUT request - edit message
    if (req.method === "PUT") {
      const { id, message } = await req.json();

      const { data, error } = await supabase
        .from("messages")
        .update({ message })
        .eq("id", id)
        .select();

      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, message: `Message updated! ${data}` }),
        { headers }
      );
    }

    // Handle DELETE request - edit message
    if (req.method === "DELETE") {
      const { message } = await req.json();

      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", "4");

      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, message: `Message deleted!` }),
        { headers }
      );
    }

    // Handle unsupported methods
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers,
    });
  }
});
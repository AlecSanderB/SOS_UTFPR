import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);
serve(async (req)=>{
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing or invalid Authorization header"
      }), {
        status: 200
      });
    }
    const token = authHeader.split(" ")[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid token"
      }), {
        status: 200
      });
    }
    const { data, error } = await supabase.from("emergency_occurences").select("*").eq("user_id", user.id).order("created_at", {
      ascending: false
    });
    if (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 200
      });
    }
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      status: 200
    });
  } catch (err) {
    console.error("Unexpected error in edge function:", err);
    return new Response(JSON.stringify({
      success: false,
      error: "Unexpected error"
    }), {
      status: 200
    });
  }
});
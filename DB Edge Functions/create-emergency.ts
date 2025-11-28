import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);
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
    const { latitude, longitude, nature_of_emergency, additional_info } = await req.json();
    if (!latitude || !longitude || !nature_of_emergency) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required fields"
      }), {
        status: 200
      });
    }
    const { data, error } = await supabase.from("emergency_occurences").insert([
      {
        user_id: user.id,
        latitude,
        longitude,
        nature_of_emergency,
        additional_info: additional_info || null,
        status: "pending",
        created_at: new Date().toISOString()
      }
    ]).select().single();
    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 200
      });
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Emergency created",
      data
    }), {
      status: 200
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({
      success: false,
      error: "Unexpected error"
    }), {
      status: 200
    });
  }
});
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);
serve(async (req)=>{
  try {
    const { email, senha } = await req.json();
    if (!email || !senha) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing email or password"
      }), {
        status: 200
      });
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });
    if (error) {
      console.log(error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 200
      });
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Login successful",
      user: data.user,
      session: data.session
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
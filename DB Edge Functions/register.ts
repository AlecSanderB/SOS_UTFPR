import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req)=>{
  try {
    const { email, senha, nome, blood_type, phone } = await req.json();

    if (!email || !senha || !nome) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required fields"
      }), {
        status: 200
      });
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true
    });

    if (authError) {
      return new Response(JSON.stringify({
        success: false,
        error: authError.message
      }), {
        status: 200
      });
    }

    const userId = authData.user.id;

    const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: userId,
          name: nome,
          blood_type,
          phone
        }
      ]);

    if (profileError) {
      return new Response(JSON.stringify({
        success: false,
        error: profileError.message
      }), {
        status: 200
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "User registered successfully"
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
// deno-lint-ignore-file no-explicit-any
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

    const body = await req.json();

    const allowedFields = {
      name: "",
      blood_type: "",
      phone: "",
      date_of_birth: "",
      allergies: "",
      medications: "",
      conditions: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relationship: ""
    };

    const updateData: any = {};
    for (const key in allowedFields) {
      if (key in body) {
        updateData[key] = body[key];
      }
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Profile update error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 200
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Profile updated successfully",
      data
    }), {
      status: 200
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({
      success: false,
      error: "Unexpected server error"
    }), {
      status: 200
    });
  }
});
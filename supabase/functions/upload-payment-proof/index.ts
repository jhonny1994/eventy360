/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * Edge Function for handling payment proof uploads
 * 
 * The @ts-nocheck directive is necessary for Supabase Edge Functions deployment
 * as they run in Deno's runtime where relative imports for types can be problematic.
 */
// deno-lint-ignore ban-ts-comment
// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Standard CORS headers
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // For production, restrict to specific domains
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// Configuration constants
const BUCKET_NAME = "payment_proofs";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

Deno.serve(async (req: Request) => {
  // Handle OPTIONS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    // Parse request
    const formData = await req.formData();
    const file = formData.get("file");
    const paymentData = formData.get("paymentData");
    
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No payment proof file provided" }),
        { headers: CORS_HEADERS, status: 400 }
      );
    }

    // Validate the file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ 
          error: `File size exceeds limit. Maximum allowed: ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
        }),
        { headers: CORS_HEADERS, status: 400 }
      );
    }

    // Validate the file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}` 
        }),
        { headers: CORS_HEADERS, status: 400 }
      );
    }

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header missing" }),
        { headers: CORS_HEADERS, status: 401 }
      );
    }

    // Parse payment data
    let parsedPaymentData;
    try {
      if (typeof paymentData === 'string') {
        parsedPaymentData = JSON.parse(paymentData);
      } else {
        return new Response(
          JSON.stringify({ error: "Invalid payment data format" }),
          { headers: CORS_HEADERS, status: 400 }
        );
      }
    } catch (error) {
      console.error("Error parsing payment data:", error);
      return new Response(
        JSON.stringify({ error: "Error parsing payment data" }),
        { headers: CORS_HEADERS, status: 400 }
      );
    }

    // Validate payment data (basic validation)
    if (!parsedPaymentData.amount || !parsedPaymentData.billing_period || !parsedPaymentData.payment_method_reported) {
      return new Response(
        JSON.stringify({ error: "Missing required payment information" }),
        { headers: CORS_HEADERS, status: 400 }
      );
    }

    // Create Supabase client with the auth header
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { headers: CORS_HEADERS, status: 500 }
      );
    }
    
    // Create two clients: one with user auth for profile checks and one with service role for storage
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });
    
    // Service role client for storage operations - bypasses RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user details from auth token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error("Authentication error:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized or invalid user session" }),
        { headers: CORS_HEADERS, status: 401 }
      );
    }

    // Create unique filename with timestamp to avoid conflicts
    const timestamp = new Date().getTime();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_"); // Sanitize filename
    const fileName = `${timestamp}_${sanitizedFileName}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload file to storage bucket using service role client
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ 
          error: "Error uploading payment proof", 
          details: uploadError.message 
        }),
        { headers: CORS_HEADERS, status: 500 }
      );
    }

    // Create a payment record
    const { data: paymentRecord, error: paymentError } = await supabaseClient
      .from("payments")
      .insert([
        {
          user_id: user.id,
          amount: parsedPaymentData.amount,
          billing_period: parsedPaymentData.billing_period,
          payment_method_reported: parsedPaymentData.payment_method_reported,
          status: "pending_verification",
          proof_document_path: `${BUCKET_NAME}/${filePath}`,
          reference_number: parsedPaymentData.reference_number || null,
          payer_notes: parsedPaymentData.payer_notes || null,
        },
      ])
      .select("id")
      .single();

    if (paymentError) {
      // If payment record creation fails, attempt to delete the uploaded file to maintain consistency
      await supabaseAdmin.storage.from(BUCKET_NAME).remove([filePath]);
      
      console.error("Payment record error:", paymentError);
      return new Response(
        JSON.stringify({ 
          error: "Error creating payment record", 
          details: paymentError.message 
        }),
        { headers: CORS_HEADERS, status: 500 }
      );
    }

    // Get public URL for the uploaded file (admins will need to access this)
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment proof uploaded successfully",
        paymentId: paymentRecord.id,
        filePath: `${BUCKET_NAME}/${filePath}`,
        publicUrl: publicUrlData.publicUrl,
      }),
      { headers: CORS_HEADERS, status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: "An unexpected error occurred", 
        details: errorMessage 
      }),
      { headers: CORS_HEADERS, status: 500 }
    );
  }
}); 
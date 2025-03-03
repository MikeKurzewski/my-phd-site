import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const regularClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: { user }, error: authError } = await regularClient.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error("User not found");

    // Cleanup storage files first.
    const buckets = ['profile-images', 'profile-files', 'publications']
    for (const bucket of buckets) {
      console.log(`Checking bucket: ${bucket}`);
      const { data: files, error: listError } = await regularClient.storage.from(bucket).list(user.id)

      if (listError) {
        console.error(`Error listing files in ${bucket}:`, listError);
        continue;
      }

      console.log(`Found ${files?.length || 0} files in ${bucket}`);

      if (files?.length > 0) {
        // Just use the filenames directly
        const filePaths = files.map(file => file.name)
        console.log('Attempting to remove:', filePaths);

        const { error: removeError } = await adminClient.storage.from(bucket).remove(filePaths)
        if (removeError) {
          console.error(`Error removing files from ${bucket}:`, removeError);
        }
      }
    }

    // Delete user. This should cascade to all referenced tables.
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError

    console.log('Successfully deleted user:', user.id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error) {
    console.log('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})

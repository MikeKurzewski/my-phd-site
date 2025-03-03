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

    // Verify user
    const { data: { user }, error: authError } = await regularClient.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error("User not found");

    console.log(`Starting deletion process for user: ${user.id}`);

    // Cleanup storage files
    const buckets = ['profile-images', 'profile-files', 'publications'];
    for (const bucket of buckets) {
      console.log(`Processing bucket: ${bucket}`);
      
      // List all files in user's folder
      const { data: files, error: listError } = await adminClient.storage
        .from(bucket)
        .list(user.id);

      if (listError) {
        console.error(`Error listing files in ${bucket}:`, listError);
        continue;
      }

      if (files && files.length > 0) {
        // Include user ID in file paths
        const filePaths = files.map(file => `${user.id}/${file.name}`);
        console.log(`Deleting ${filePaths.length} files from ${bucket}`);

        const { error: removeError } = await adminClient.storage
          .from(bucket)
          .remove(filePaths);

        if (removeError) {
          console.error(`Error removing files from ${bucket}:`, removeError);
          throw new Error(`Failed to delete files from ${bucket}`);
        }
      }
    }

    // Delete database records explicitly
    const tablesToDelete = [
      'publications',
      'projects',
      'qualifications',
      'profile',
      'subscriptions'
    ];

    for (const table of tablesToDelete) {
      console.log(`Deleting records from ${table}`);
      const { error: deleteError } = await adminClient
        .from(table)
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error(`Error deleting from ${table}:`, deleteError);
        throw new Error(`Failed to delete records from ${table}`);
      }
    }

    // Finally delete the auth user
    console.log(`Deleting auth user: ${user.id}`);
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    console.log(`Successfully deleted user and all data: ${user.id}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

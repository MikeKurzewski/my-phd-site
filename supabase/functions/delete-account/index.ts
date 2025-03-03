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

    // Delete database records in proper order to respect foreign key constraints
    const tablesToDelete = [
      { name: 'publications', column: 'user_id' }, // Child tables first
      { name: 'projects', column: 'user_id' },
      { name: 'qualifications', column: 'user_id' },
      { name: 'profiles', column: 'id' },         // Profiles uses id column
      { name: 'subscriptions', column: 'user_id' } // Subscriptions reference user
    ];

    for (const table of tablesToDelete) {
      console.log(`Deleting records from ${table.name} using column ${table.column}`);
      try {
        const { error: deleteError } = await adminClient
          .from(table.name)
          .delete()
          .eq(table.column, user.id);

        if (deleteError) {
          console.error(`Error deleting from ${table}:`, deleteError);
          // Continue with other tables even if one fails
          continue;
        }
        console.log(`Successfully deleted from ${table}`);
      } catch (err) {
        console.error(`Unexpected error deleting from ${table}:`, err);
        // Continue with other tables
      }
    }

    // Delete from auth schema tables
    try {
      console.log('Deleting from auth schema tables');
      await adminClient
        .from('auth.identities')
        .delete()
        .eq('user_id', user.id);
      
      await adminClient
        .from('auth.sessions')
        .delete()
        .eq('user_id', user.id);
      
      console.log('Successfully deleted from auth schema tables');
    } catch (err) {
      console.error('Error deleting from auth schema tables:', err);
    }

    console.log(`Successfully deleted user data: ${user.id}`);

    // Finally delete the auth user - must be last operation
    console.log(`Deleting auth user: ${user.id}`);
    try {
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.error('Error deleting auth user:', deleteError);
        throw new Error(`Failed to delete auth user: ${deleteError.message}`);
      }
      console.log('Successfully deleted auth user');
    } catch (err) {
      console.error('Unexpected error deleting auth user:', err);
      throw new Error('Failed to delete auth user');
    }

    console.log(`Successfully deleted all user data and account: ${user.id}`);

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

// Debug script to check collaboration data
// Run this in the browser console to debug collaboration issues

async function debugCollaboration() {
  // Get current user
  const { data: { user } } = await window.supabase.auth.getUser();
  console.log('Current user:', user);

  if (!user) {
    console.error('No user logged in');
    return;
  }

  // Check collaboration requests
  console.log('\n=== COLLABORATION REQUESTS ===');
  const { data: requests, error: requestsError } = await window.supabase
    .from('collaboration_requests')
    .select('*')
    .eq('recipient_id', user.id);

  if (requestsError) {
    console.error('Error fetching requests:', requestsError);
  } else {
    console.log('Pending requests for current user:', requests);
  }

  // Check ideas table
  console.log('\n=== IDEAS ===');
  if (requests && requests.length > 0) {
    for (const request of requests) {
      const { data: idea, error: ideaError } = await window.supabase
        .from('ideas')
        .select('*')
        .eq('id', request.idea_id)
        .maybeSingle();

      console.log(`Idea for request ${request.id}:`, { idea, ideaError });
    }
  }

  // Check shared ideas
  console.log('\n=== SHARED IDEAS ===');
  const { data: sharedIdeas, error: sharedError } = await window.supabase
    .from('shared_ideas')
    .select('*')
    .eq('collaborator_id', user.id);

  if (sharedError) {
    console.error('Error fetching shared ideas:', sharedError);
  } else {
    console.log('Shared ideas for current user:', sharedIdeas);
  }

  // Check all ideas to see what exists
  console.log('\n=== ALL IDEAS ===');
  const { data: allIdeas, error: allIdeasError } = await window.supabase
    .from('ideas')
    .select('id, title, user_id')
    .limit(10);

  if (allIdeasError) {
    console.error('Error fetching all ideas:', allIdeasError);
  } else {
    console.log('Sample ideas in database:', allIdeas);
  }
}

// Make it available globally
window.debugCollaboration = debugCollaboration;

console.log('Debug function loaded. Run debugCollaboration() in console to debug.');

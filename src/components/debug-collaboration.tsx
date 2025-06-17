"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollaboration } from "@/hooks/use-collaboration";
import { supabase } from "@/lib/supabase";

export function DebugCollaboration() {
  const [debugData, setDebugData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { pendingRequests, acceptCollaborationRequest } = useCollaboration();

  const runDebug = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setDebugData({ error: 'No user logged in' });
        return;
      }

      // Get collaboration requests
      const { data: requests, error: requestsError } = await supabase
        .from('collaboration_requests')
        .select('*')
        .eq('recipient_id', user.id);

      // Get ideas for each request
      const requestsWithIdeas = [];
      if (requests) {
        for (const request of requests) {
          const { data: idea, error: ideaError } = await supabase
            .from('ideas')
            .select('*')
            .eq('id', request.idea_id)
            .maybeSingle();

          requestsWithIdeas.push({
            request,
            idea,
            ideaError: ideaError?.message || null
          });
        }
      }

      // Get all ideas to see what exists
      const { data: allIdeas, error: allIdeasError } = await supabase
        .from('ideas')
        .select('id, title, user_id')
        .limit(10);

      setDebugData({
        user: { id: user.id, email: user.email },
        requests,
        requestsError: requestsError?.message || null,
        requestsWithIdeas,
        allIdeas,
        allIdeasError: allIdeasError?.message || null,
        pendingRequestsFromHook: pendingRequests
      });

    } catch (error) {
      setDebugData({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const testAcceptRequest = async () => {
    if (pendingRequests.length > 0) {
      try {
        console.log('Testing accept request for:', pendingRequests[0]);
        await acceptCollaborationRequest(pendingRequests[0].id, 'read');
        console.log('Accept request successful');
      } catch (error) {
        console.error('Accept request failed:', error);
      }
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Debug Collaboration Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runDebug} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Debug Data'}
          </Button>
          <Button 
            onClick={testAcceptRequest} 
            disabled={pendingRequests.length === 0}
            variant="outline"
          >
            Test Accept First Request
          </Button>
        </div>

        {debugData && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-sm">
          <p><strong>Pending Requests from Hook:</strong> {pendingRequests.length}</p>
          {pendingRequests.map((req, i) => (
            <div key={req.id} className="ml-4">
              <p>Request {i + 1}: {req.idea_title} (ID: {req.id})</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

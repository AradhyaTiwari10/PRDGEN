import { useRealtimeCollaboration } from '@/hooks/use-realtime-collaboration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CollaborationDebugProps {
  ideaId: string;
}

export function CollaborationDebug({ ideaId }: CollaborationDebugProps) {
  const {
    collaborators,
    isConnected,
    currentUser,
    userColor,
    broadcastContentChange
  } = useRealtimeCollaboration(ideaId);

  const testBroadcast = () => {
    const testContent = `<p>Test broadcast at ${new Date().toLocaleTimeString()}</p>`;
    broadcastContentChange(testContent, 0);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">🔧 Collaboration Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span>Connection:</span>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span>Current User:</span>
          <span>{currentUser?.name || 'Not loaded'}</span>
          {userColor && (
            <div 
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: userColor }}
            />
          )}
        </div>
        
        <div>
          <span>Collaborators ({collaborators.length}):</span>
          {collaborators.length === 0 ? (
            <div className="text-muted-foreground ml-2">None</div>
          ) : (
            <div className="ml-2 space-y-1">
              {collaborators.map((collab) => (
                <div key={collab.user_id} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: collab.color }}
                  />
                  <span>{collab.user_name}</span>
                  <span className="text-muted-foreground">
                    (cursor: {collab.cursor_position})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-muted-foreground">
          Idea ID: {ideaId}
        </div>

        <div className="pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={testBroadcast}
            className="w-full"
          >
            Test Broadcast
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

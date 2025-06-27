import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBlockNoteCollaboration } from '@/hooks/use-blocknote-collaboration';
import { Users, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface CollaborationTestButtonProps {
  ideaId: string;
}

export function CollaborationTestButton({ ideaId }: CollaborationTestButtonProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const {
    collaborators,
    isConnected,
    connectionStatus,
    currentUser,
  } = useBlockNoteCollaboration(ideaId);

  return (
    <div className="p-4 space-y-4 border rounded-lg bg-muted/10">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Collaboration Test</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm ${
          connectionStatus === 'connected'
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : connectionStatus === 'connecting'
            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {connectionStatus === 'connected' ? (
            <Wifi className="w-3 h-3" />
          ) : connectionStatus === 'connecting' ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          {connectionStatus}
        </div>

        {collaborators.length > 0 && (
          <Badge variant="outline">
            <Users className="w-3 h-3 mr-1" />
            {collaborators.length} online
          </Badge>
        )}
      </div>

      {showDetails && (
        <div className="space-y-3 text-sm">
          <div>
            <strong>Current User:</strong> {currentUser?.name || 'Loading...'}
          </div>
          
          <div>
            <strong>Idea ID:</strong> {ideaId}
          </div>
          
          <div>
            <strong>WebSocket Status:</strong> {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          
          {collaborators.length > 0 && (
            <div>
              <strong>Active Collaborators:</strong>
              <ul className="ml-4 space-y-1">
                {collaborators.map((collab) => (
                  <li key={collab.id} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: collab.color }}
                    />
                    {collab.name} ({collab.email})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
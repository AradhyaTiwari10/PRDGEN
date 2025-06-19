"use client";

import { useState, useEffect } from "react";
import { Users, UserMinus, Crown, Eye, Edit, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useCollaborators } from "@/hooks/use-collaborators";
import { Idea } from "@/types";
import { CollaborationRequestModal } from "./collaboration-request-modal";

interface CollaboratorsManagementProps {
  idea: Idea;
  trigger?: React.ReactNode;
}

export function CollaboratorsManagement({ idea, trigger }: CollaboratorsManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState<string>('Loading...');

  const {
    collaborators,
    loading,
    removeCollaborator,
    updateCollaboratorPermission,
    fetchCollaborators,
    checkIsOwner
  } = useCollaborators(idea.id);

  useEffect(() => {
    if (isOpen) {
      fetchCollaborators();
      checkIsOwner(idea.id).then(setIsOwner);

      // Get the actual owner's email
      const getOwnerEmail = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Check if current user is the owner
          if (idea.user_id === user.id) {
            setOwnerEmail(`${user.email} (You)`);
          } else {
            // Get the owner's email from database
            const { data: emailData } = await supabase
              .rpc('get_user_by_email_reverse', { user_id: idea.user_id });

            if (emailData) {
              setOwnerEmail(emailData);
            } else {
              setOwnerEmail('Unknown Owner');
            }
          }
        } catch (error) {
          console.error('Failed to get owner email:', error);
          setOwnerEmail('Unknown Owner');
        }
      };

      getOwnerEmail();
    }
  }, [isOpen, idea.id, idea.user_id]);

  const handleRemoveCollaborator = async (collaboratorId: string, collaboratorEmail: string) => {
    try {
      await removeCollaborator(collaboratorId);
      toast({
        title: 'Success',
        description: `Removed ${collaboratorEmail} from collaboration`,
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleUpdatePermission = async (collaboratorId: string, newPermission: 'view' | 'edit' | 'manage') => {
    try {
      await updateCollaboratorPermission(collaboratorId, newPermission);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Users className="h-4 w-4" />
      Manage ({collaborators.length})
    </Button>
  );

  const getPermissionBadge = (permission: string) => {
    switch (permission) {
      case 'manage':
        return (
          <Badge variant="default" className="gap-1">
            <Users className="h-3 w-3" />
            Manage
          </Badge>
        );
      case 'edit':
        return (
          <Badge variant="secondary" className="gap-1">
            <Edit className="h-3 w-3" />
            Edit
          </Badge>
        );
      case 'view':
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Eye className="h-3 w-3" />
            View
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaboration Management
          </DialogTitle>
          <DialogDescription>
            Manage collaborators for "{idea.title}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Owner Section */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Owner</h4>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Crown className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="font-medium">{ownerEmail}</p>
                  <p className="text-sm text-muted-foreground">Full access to this idea</p>
                </div>
              </div>
              <Badge variant="default">Owner</Badge>
            </div>
          </div>

          <Separator />

          {/* Collaborators Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Collaborators ({collaborators.length})
              </h4>
              {isOwner && (
                <CollaborationRequestModal 
                  idea={idea}
                  trigger={
                    <Button size="sm" className="gap-2">
                      <Mail className="h-4 w-4" />
                      Invite
                    </Button>
                  }
                />
              )}
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading collaborators...
              </div>
            ) : collaborators.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No collaborators yet</p>
                <p className="text-sm">Invite others to collaborate on this idea</p>
              </div>
            ) : (
              <ScrollArea className="max-h-64">
                <div className="space-y-2">
                  {collaborators.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{collaborator.collaborator_email}</p>
                          <p className="text-sm text-muted-foreground">
                            Joined {new Date(collaborator.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getPermissionBadge(collaborator.permission_level)}
                        
                        {isOwner && (
                          <div className="flex items-center gap-1">
                            <Select
                              value={collaborator.permission_level}
                              onValueChange={(value: 'view' | 'edit' | 'manage') =>
                                handleUpdatePermission(collaborator.collaborator_id, value)
                              }
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="view">View Only</SelectItem>
                                <SelectItem value="edit">Can Edit</SelectItem>
                                <SelectItem value="manage">Can Edit + Invite</SelectItem>
                              </SelectContent>
                            </Select>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <UserMinus className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Collaborator</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {collaborator.collaborator_email} from this collaboration?
                                    They will lose access to this idea.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleRemoveCollaborator(
                                        collaborator.collaborator_id,
                                        collaborator.collaborator_email
                                      )
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

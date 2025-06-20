"use client";

import { useState } from "react";
import { Users, Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollaboration } from "@/hooks/use-collaboration";
import { Idea } from "@/types";

interface CollaborationRequestModalProps {
  idea: Idea;
  trigger?: React.ReactNode;
}

export function CollaborationRequestModal({ idea, trigger }: CollaborationRequestModalProps) {
  const { sendCollaborationRequest, cleanupCollaborationData } = useCollaboration();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [permission, setPermission] = useState<'view' | 'edit' | 'manage'>('view');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError("");
    }
  };

  const handleSendRequest = async () => {
    // Validate email
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setEmailError(""); // Clear any previous errors

    try {
      await sendCollaborationRequest(idea.id, email.trim(), message.trim() || undefined, permission);

      // Reset form and close modal on success
      setEmail("");
      setMessage("");
      setEmailError("");
      setIsOpen(false);
    } catch (error: any) {
      // If it's a duplicate key error (declined request exists), try to cleanup and retry
      if (error.message.includes('duplicate key value violates unique constraint') ||
          error.message.includes('collaboration_requests_idea_id_recipient_id_key')) {
        try {
          await cleanupCollaborationData(idea.id, email.trim());
          // Retry the request after cleanup
          await sendCollaborationRequest(idea.id, email.trim(), message.trim() || undefined, permission);

          // Reset form and close modal on success
          setEmail("");
          setMessage("");
          setEmailError("");
          setIsOpen(false);
          return;
        } catch (retryError: any) {
          setEmailError(retryError.message);
        }
      } else if (error.message.includes('already collaborating') || error.message.includes('already a collaborator')) {
        try {
          await cleanupCollaborationData(idea.id, email.trim());
          // Retry the request after cleanup
          await sendCollaborationRequest(idea.id, email.trim(), message.trim() || undefined, permission);

          // Reset form and close modal on success
          setEmail("");
          setMessage("");
          setEmailError("");
          setIsOpen(false);
          return;
        } catch (retryError: any) {
          setEmailError(retryError.message);
        }
      } else if (error.message.includes('not found') || error.message.includes('already')) {
        setEmailError(error.message);
      }
      // Other errors are already handled in the hook with toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form when closing
      setEmail("");
      setMessage("");
      setEmailError("");
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Users className="h-4 w-4" />
      Collaborate
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite Collaborator
          </DialogTitle>
          <DialogDescription>
            Send a collaboration request for "{idea.title}" to another user.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collaborator-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Collaborator Email *
            </Label>
            <Input
              id="collaborator-email"
              type="email"
              placeholder="Enter email address..."
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={emailError ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {emailError && (
              <p className="text-sm text-destructive">{emailError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              The user must have an account with this email address.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="collaboration-permission">
              Permission Level
            </Label>
            <Select value={permission} onValueChange={(value: 'view' | 'edit' | 'manage') => setPermission(value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select permission level">
                  {permission === 'view' && (
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <div className="text-left">
                        <div className="font-medium">View Only</div>
                        <div className="text-xs text-muted-foreground">Can view the idea but not edit</div>
                      </div>
                    </div>
                  )}
                  {permission === 'edit' && (
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <div className="text-left">
                        <div className="font-medium">Can Edit</div>
                        <div className="text-xs text-muted-foreground">Can view and edit the idea</div>
                      </div>
                    </div>
                  )}
                  {permission === 'manage' && (
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div className="text-left">
                        <div className="font-medium">Can Edit + Invite</div>
                        <div className="text-xs text-muted-foreground">Can edit and invite others</div>
                      </div>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value="view" className="py-3">
                  <div className="flex items-center gap-3 w-full">
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-medium">View Only</div>
                      <div className="text-xs text-muted-foreground">Can view the idea but not edit</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="edit" className="py-3">
                  <div className="flex items-center gap-3 w-full">
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-medium">Can Edit</div>
                      <div className="text-xs text-muted-foreground">Can view and edit the idea</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="manage" className="py-3">
                  <div className="flex items-center gap-3 w-full">
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-medium">Can Edit + Invite</div>
                      <div className="text-xs text-muted-foreground">Can edit and invite others</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="collaboration-message">
              Message (Optional)
            </Label>
            <Textarea
              id="collaboration-message"
              placeholder="Add a personal message to your collaboration request..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              disabled={isLoading}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/500
            </p>
          </div>
          
          <div className="bg-muted p-3 rounded-md">
            <h4 className="font-medium text-sm mb-1">Idea Details</h4>
            <p className="text-sm font-semibold">{idea.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {idea.description}
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendRequest}
            disabled={isLoading || !email.trim()}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

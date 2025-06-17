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
      await sendCollaborationRequest(idea.id, email.trim(), message.trim() || undefined);

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
          await sendCollaborationRequest(idea.id, email.trim(), message.trim() || undefined);

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
          await sendCollaborationRequest(idea.id, email.trim(), message.trim() || undefined);

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
      console.error('Failed to send collaboration request:', error);
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

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, MessageSquare, Send, Plus, Mail, MailOpen, Clock, User, Building, ArrowLeft, Archive, Search, MoreHorizontal, Star, Trash2, Reply, Forward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Navigation from "@/components/navigation";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  sender_id: string;
  sender_type: 'admin' | 'florist';
  recipient_id: string;
  recipient_type: 'admin' | 'florist';
  subject: string;
  message_body: string;
  is_read: boolean;
  created_at: string;
  sender_name: string;
  recipient_name: string;
}

interface Florist {
  id: number;
  name: string;
  email: string;
  businessName: string;
}

export default function AdminMessages() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for compose parameter to auto-open compose dialog
  const [preSelectedFloristId, setPreSelectedFloristId] = useState<string>('');
  
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const composeFloristId = urlParams.get('compose');
    if (composeFloristId) {
      setPreSelectedFloristId(composeFloristId);
      setIsComposeOpen(true);
      // Clean URL without refreshing
      window.history.replaceState({}, '', '/admin-messages');
    }
  }, []);

  // Fetch messages
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
    queryFn: async () => {
      const token = localStorage.getItem('customerToken');
      const response = await fetch('/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
  });

  // Fetch florists for compose
  const { data: florists } = useQuery<Florist[]>({
    queryKey: ['/api/messages/florists'],
    queryFn: async () => {
      const token = localStorage.getItem('customerToken');
      const response = await fetch('/api/messages/florists', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch florists');
      return response.json();
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: {
      recipientId: string;
      recipientType: string;
      subject: string;
      messageBody: string;
    }) => {
      const token = localStorage.getItem('customerToken');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setIsComposeOpen(false);
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const token = localStorage.getItem('customerToken');
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
  });

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.is_read && message.recipient_type === 'admin') {
      markAsReadMutation.mutate(message.id);
    }
  };

  const ComposeDialog = () => {
    const [recipientId, setRecipientId] = useState("");
    const [subject, setSubject] = useState("");
    const [messageBody, setMessageBody] = useState("");

    // Auto-select florist if coming from admin list
    React.useEffect(() => {
      if (preSelectedFloristId && florists && florists.length > 0) {
        const florist = florists.find(f => f.id.toString() === preSelectedFloristId);
        if (florist) {
          setRecipientId(preSelectedFloristId);
          setSubject(`Message for ${florist.businessName || florist.name}`);
          console.log('Auto-selected florist:', florist);
        }
      }
    }, [preSelectedFloristId, florists]);

    // Reset form when dialog closes
    React.useEffect(() => {
      if (!isComposeOpen) {
        setRecipientId("");
        setSubject("");
        setMessageBody("");
      }
    }, [isComposeOpen]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!recipientId || !subject || !messageBody) {
        toast({
          title: "Missing fields",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      sendMessageMutation.mutate({
        recipientId,
        recipientType: 'florist',
        subject,
        messageBody,
      });
    };

    return (
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Compose Message
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message to Florist</DialogTitle>
            <DialogDescription>
              Send a message to a florist in your network
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="recipient">Recipient</Label>
              <Select value={recipientId} onValueChange={setRecipientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a florist" />
                </SelectTrigger>
                <SelectContent>
                  {florists?.map((florist) => (
                    <SelectItem key={florist.id} value={florist.id.toString()}>
                      {florist.name} - {florist.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter message subject"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsComposeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={sendMessageMutation.isPending}>
                {sendMessageMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  if (messagesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">Communicate with florists on your platform</p>
          </div>
          <ComposeDialog />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                All Messages ({messages?.length || 0})
              </CardTitle>
              <CardDescription>
                Click on a message to view details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!messages || messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-sm text-gray-400">Start a conversation with your florists</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleSelectMessage(message)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedMessage?.id === message.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {!message.is_read && message.recipient_type === 'admin' && (
                              <Badge variant="default" className="bg-blue-600">New</Badge>
                            )}
                            {message.sender_type === 'admin' ? (
                              <User className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Building className="h-4 w-4 text-green-600" />
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {message.sender_type === 'admin' ? 'You' : message.sender_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(message.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 truncate">
                            {message.subject}
                          </h3>
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {message.message_body}
                          </p>
                        </div>
                        {message.is_read ? (
                          <MailOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Detail */}
          <Card>
            <CardHeader>
              <CardTitle>Message Details</CardTitle>
              <CardDescription>
                View the full conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedMessage ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a message to view details</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedMessage.sender_type === 'admin' ? (
                        <User className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Building className="h-5 w-5 text-green-600" />
                      )}
                      <div>
                        <p className="font-medium">
                          {selectedMessage.sender_type === 'admin' ? 'You' : selectedMessage.sender_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedMessage.sender_type === 'florist' ? 'Florist' : 'Admin'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {format(new Date(selectedMessage.created_at), 'MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(selectedMessage.created_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-lg mb-2">{selectedMessage.subject}</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-gray-700">
                        {selectedMessage.message_body}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {selectedMessage.recipient_type === 'admin' ? (
                      <span>To: You</span>
                    ) : (
                      <span>To: {selectedMessage.recipient_name}</span>
                    )}
                  </div>

                  {!selectedMessage.is_read && selectedMessage.recipient_type === 'admin' && (
                    <Alert>
                      <Mail className="h-4 w-4" />
                      <AlertDescription>
                        This message has been marked as read.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
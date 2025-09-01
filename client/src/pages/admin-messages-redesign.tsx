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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare, Send, Plus, Mail, MailOpen, Clock, User, Building, ArrowLeft, Archive, Search, MoreHorizontal, Star, Trash2, Reply, Forward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Navigation from "@/components/navigation";
import { cn } from "@/lib/utils";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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

export default function AdminMessagesRedesign() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipientSearchQuery, setRecipientSearchQuery] = useState("");
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
      window.history.replaceState({}, '', '/messages');
    }
  }, []);

  // Fetch messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/messages'],
    queryFn: async () => {
      const token = localStorage.getItem('customerToken') || localStorage.getItem('floristToken');
      const response = await fetch('/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
  });

  // Fetch florists for compose dialog
  const { data: florists = [] } = useQuery({
    queryKey: ['/api/messages/florists'],
    queryFn: async () => {
      const token = localStorage.getItem('customerToken') || localStorage.getItem('floristToken');
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
    mutationFn: async ({ recipientId, recipientType, subject, messageBody }: {
      recipientId: string;
      recipientType: string;
      subject: string;
      messageBody: string;
    }) => {
      const token = localStorage.getItem('customerToken') || localStorage.getItem('floristToken');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId,
          recipientType,
          subject,
          messageBody,
        }),
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
    onError: () => {
      toast({
        title: "Failed to send message",
        description: "There was an error sending your message.",
        variant: "destructive",
      });
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const token = localStorage.getItem('customerToken') || localStorage.getItem('floristToken');
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

  // Filter messages based on search
  const filteredMessages = messages.filter((message: Message) =>
    message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.message_body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffHours < 168) { // 7 days
      return format(date, 'EEE');
    } else {
      return format(date, 'MMM d');
    }
  };

  const ComposeDialog = () => {
    const [recipientId, setRecipientId] = useState("");
    const [subject, setSubject] = useState("");
    const [messageBody, setMessageBody] = useState("");

    // Auto-select florist if coming from admin list
    React.useEffect(() => {
      if (preSelectedFloristId && florists && florists.length > 0) {
        const florist = florists.find((f: Florist) => f.id.toString() === preSelectedFloristId);
        if (florist) {
          setRecipientId(preSelectedFloristId);
          setRecipientSearchQuery(florist.businessName || florist.name || florist.email);
          setSubject(`Message for ${florist.businessName || florist.name}`);
        }
      }
    }, [preSelectedFloristId, florists]);

    // Reset form when dialog closes
    React.useEffect(() => {
      if (!isComposeOpen) {
        setRecipientId("");
        setRecipientSearchQuery("");
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Compose Message</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-sm font-medium">To</Label>
              <div className="relative">
                <Input
                  placeholder="Search for a business to message..."
                  value={recipientSearchQuery}
                  onChange={(e) => setRecipientSearchQuery(e.target.value)}
                  className="w-full"
                />
                {recipientSearchQuery && (
                  <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                    {florists
                      ?.filter((florist: Florist) => 
                        (florist.businessName?.toLowerCase().includes(recipientSearchQuery.toLowerCase()) || 
                         florist.name?.toLowerCase().includes(recipientSearchQuery.toLowerCase()) ||
                         florist.email?.toLowerCase().includes(recipientSearchQuery.toLowerCase()))
                      )
                      .map((florist: Florist) => (
                        <div
                          key={florist.id}
                          onClick={() => {
                            setRecipientId(florist.id.toString());
                            setRecipientSearchQuery(florist.businessName || florist.name || florist.email);
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-sm">
                              {(florist.businessName?.charAt(0) || florist.name?.charAt(0) || 'F')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {florist.businessName || florist.name || 'Unnamed Business'}
                            </span>
                            <span className="text-xs text-gray-500 truncate">
                              {florist.email}
                            </span>
                            {florist.name && florist.businessName && (
                              <span className="text-xs text-gray-400">
                                Contact: {florist.name}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    }
                    {florists?.filter((florist: Florist) => 
                      (florist.businessName?.toLowerCase().includes(recipientSearchQuery.toLowerCase()) || 
                       florist.name?.toLowerCase().includes(recipientSearchQuery.toLowerCase()) ||
                       florist.email?.toLowerCase().includes(recipientSearchQuery.toLowerCase()))
                    ).length === 0 && (
                      <div className="p-3 text-sm text-gray-500 text-center">
                        No businesses found matching "{recipientSearchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject..."
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">Message</Label>
              <div className="min-h-[200px]">
                <ReactQuill
                  value={messageBody}
                  onChange={setMessageBody}
                  placeholder="Write your message..."
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link'],
                      ['clean']
                    ]
                  }}
                  formats={[
                    'header', 'bold', 'italic', 'underline',
                    'list', 'bullet', 'link'
                  ]}
                  className="bg-white"
                />
              </div>
            </div>
            <div className="flex justify-between items-center pt-4">
              <Button type="button" variant="outline" onClick={() => setIsComposeOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={sendMessageMutation.isPending} 
                className="min-w-[100px] bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 py-2 font-medium"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
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
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-500">Communicate with florists on your platform</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsComposeOpen(true)} 
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm rounded-full px-6 py-2 font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Message List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border h-full flex flex-col">
            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1">
              <div className="divide-y">
                {filteredMessages.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No messages found</p>
                  </div>
                ) : (
                  filteredMessages.map((message: Message) => (
                    <div
                      key={message.id}
                      onClick={() => handleSelectMessage(message)}
                      className={cn(
                        "p-4 cursor-pointer hover:bg-gray-50 border-l-4 border-transparent",
                        selectedMessage?.id === message.id && "bg-blue-50 border-l-blue-500",
                        !message.is_read && "bg-blue-50/30 font-medium"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {message.sender_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {message.sender_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {message.sender_type === 'florist' ? 'Florist' : 'Admin'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!message.is_read && (
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          )}
                          <span className="text-xs text-gray-400">
                            {formatDate(message.created_at)}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
                        {message.subject}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {message.message_body}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border h-full flex flex-col">
            {selectedMessage ? (
              <>
                {/* Message Header */}
                <div className="p-6 border-b">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {selectedMessage.sender_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {selectedMessage.subject}
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <span className="font-medium">{selectedMessage.sender_name}</span>
                          <span>•</span>
                          <span>{format(new Date(selectedMessage.created_at), 'MMM d, yyyy at h:mm a')}</span>
                          <span>•</span>
                          <Badge variant="secondary" className="text-xs">
                            {selectedMessage.sender_type === 'florist' ? 'From Florist' : 'From Admin'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Reply className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Forward className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <ScrollArea className="flex-1 p-6">
                  <div className="prose max-w-none">
                    <div 
                      className="text-gray-900 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selectedMessage.message_body }}
                    />
                  </div>
                </ScrollArea>

                {/* Reply Section */}
                <div className="border-t p-4">
                  <Button 
                    variant="outline" 
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-full font-medium" 
                    onClick={() => setIsComposeOpen(true)}
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Mail className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No message selected</h3>
                  <p className="text-sm">Choose a message from the list to view its contents</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ComposeDialog />
    </div>
  );
}
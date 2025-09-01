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
import ComposeMessage from './compose-message';

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
  phone: string;
}

export default function AdminMessagesRedesign() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
  const { data: messages = [], isLoading: messagesLoading, error: messagesError } = useQuery({
    queryKey: ['/api/messages'],
    queryFn: async () => {
      const token = localStorage.getItem('customerToken') || localStorage.getItem('floristToken');
      
      if (!token) {
        console.log('No authentication token found');
        throw new Error('Authentication required');
      }
      
      console.log('Fetching messages with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch('/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Messages fetch failed:', response.status, errorText);
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Messages fetched successfully:', data.length, 'messages');
      return data;
    },
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error.message.includes('401') || error.message.includes('Authentication')) {
        return false;
      }
      return failureCount < 2;
    },
    enabled: true, // Always try to fetch when component mounts
  });

  // Fetch florists for compose dialog
  const { data: florists = [], isLoading: floristsLoading, error: floristsError } = useQuery({
    queryKey: ['/api/messages/florists'],
    queryFn: async () => {
      const token = localStorage.getItem('customerToken') || localStorage.getItem('floristToken');
      const response = await fetch('/api/messages/florists', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        if (response.status === 403) {
          throw new Error('Admin access required');
        }
        throw new Error('Failed to fetch florists');
      }
      return response.json();
    },
    retry: 1,
    enabled: true, // Always try to fetch when component mounts
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
                {messagesLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-500">Loading messages...</p>
                  </div>
                ) : messagesError ? (
                  <div className="p-8 text-center text-red-500">
                    <Mail className="h-12 w-12 mx-auto mb-4 text-red-300" />
                    <p className="text-sm">Authentication Required</p>
                    <p className="text-xs text-gray-500 mt-2">Please log in as admin to access messages</p>
                    <Button 
                      onClick={() => window.location.href = '/admin/login'} 
                      className="mt-3 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Go to Admin Login
                    </Button>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No messages found</p>
                    {searchQuery && <p className="text-xs mt-2">Try adjusting your search terms</p>}
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

      <ComposeMessage
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        florists={florists}
        preSelectedFloristId={preSelectedFloristId}
        isLoading={floristsLoading}
        error={floristsError}
      />
    </div>
  );
}
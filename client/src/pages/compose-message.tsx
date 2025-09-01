import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Florist {
  id: number;
  name: string;
  email: string;
  businessName: string;
  phone: string;
}

interface ComposeMessageProps {
  isOpen: boolean;
  onClose: () => void;
  florists: Florist[];
  preSelectedFloristId?: string;
  isLoading?: boolean;
  error?: Error | null;
}

export default function ComposeMessage({ isOpen, onClose, florists, preSelectedFloristId, isLoading = false, error = null }: ComposeMessageProps) {
  const [selectedFlorist, setSelectedFlorist] = useState<Florist | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [subject, setSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter florists based on search - show all if no search term, filter if search term exists
  const filteredFlorists = React.useMemo(() => {
    if (!florists || florists.length === 0) return [];
    
    // If no search term, show all florists when dropdown is open
    if (!searchTerm || searchTerm.length < 1) {
      return showResults ? florists : [];
    }
    
    const term = searchTerm.toLowerCase();
    return florists.filter((florist: Florist) => {
      const businessName = florist.businessName?.toLowerCase() || "";
      const name = florist.name?.toLowerCase() || "";
      const email = florist.email?.toLowerCase() || "";
      const phone = florist.phone?.toLowerCase() || "";
      
      return businessName.includes(term) || 
             name.includes(term) || 
             email.includes(term) || 
             phone.includes(term);
    });
  }, [florists, searchTerm, showResults]);

  // Pre-select florist if coming from admin list
  useEffect(() => {
    if (preSelectedFloristId && florists && florists.length > 0) {
      const florist = florists.find((f: Florist) => f.id.toString() === preSelectedFloristId);
      if (florist) {
        setSelectedFlorist(florist);
        setSearchTerm("");
        setShowResults(false);
        setSubject(`Message for ${florist.businessName || florist.name}`);
      }
    }
  }, [preSelectedFloristId, florists]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFlorist(null);
      setSearchTerm("");
      setShowResults(false);
      setSubject("");
      setMessageBody("");
    }
  }, [isOpen]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFlorist) throw new Error("No recipient selected");
      
      const token = localStorage.getItem('customerToken') || localStorage.getItem('floristToken');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: selectedFlorist.id.toString(),
          recipientType: 'florist',
          subject,
          messageBody,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      onClose();
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

  const handleFloristSelect = (florist: Florist) => {
    setSelectedFlorist(florist);
    setSearchTerm("");
    setShowResults(false);
    setSubject(`Message for ${florist.businessName || florist.name}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowResults(true); // Always show results when typing
    if (!value) {
      setSelectedFlorist(null);
    }
  };

  const toggleDropdown = () => {
    setShowResults(!showResults);
    if (!showResults) {
      setSearchTerm(""); // Clear search when opening dropdown
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlorist || !subject || !messageBody) {
      toast({
        title: "Missing fields",
        description: "Please select a recipient, enter subject and message",
        variant: "destructive",
      });
      return;
    }
    sendMessageMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compose Message</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipient Selection */}
          <div className="space-y-2">
            <Label>To</Label>
            
            {!selectedFlorist && (
              <div className="relative">
                <div className="relative">
                  <Input
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search by business name, email, phone, or contact name..."
                    className="w-full pr-10"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleDropdown}
                    className="absolute right-0 top-0 h-full px-3 hover:bg-gray-100"
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${showResults ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
                
                {showResults && filteredFlorists.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredFlorists.slice(0, searchTerm ? 10 : 20).map((florist: Florist) => (
                      <div
                        key={florist.id}
                        onClick={() => handleFloristSelect(florist)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {(florist.businessName || florist.name)?.charAt(0)?.toUpperCase() || 'F'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {florist.businessName || `${florist.name}'s Florist`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {florist.email}
                          </div>
                          {florist.phone && (
                            <div className="text-xs text-gray-500">
                              {florist.phone}
                            </div>
                          )}
                          {florist.name && florist.businessName && (
                            <div className="text-xs text-gray-400">
                              Contact: {florist.name}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Error state */}
                {error && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-red-200 rounded-md shadow-lg p-4">
                    <div className="text-sm text-red-600">
                      {error.message === 'Admin access required' 
                        ? 'You need admin access to send messages to florists.' 
                        : 'Failed to load florists. Please try refreshing the page.'}
                    </div>
                  </div>
                )}
                
                {/* Loading state */}
                {isLoading && showResults && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading florists...
                    </div>
                  </div>
                )}
                
                {/* No results found */}
                {showResults && searchTerm && filteredFlorists.length === 0 && !isLoading && !error && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4">
                    <div className="text-center text-gray-500">
                      <p>No florists found for "{searchTerm}"</p>
                      <p className="text-xs mt-1">Try searching by business name, email, or phone number</p>
                    </div>
                  </div>
                )}
                
                {showResults && filteredFlorists.length === 0 && searchTerm && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
                    <div className="text-sm text-gray-500 text-center">
                      No businesses found matching "{searchTerm}"
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedFlorist && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      {(selectedFlorist.businessName || selectedFlorist.name)?.charAt(0)?.toUpperCase() || 'F'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-blue-900">
                    {selectedFlorist.businessName || `${selectedFlorist.name}'s Florist`}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFlorist(null);
                    setSearchTerm("");
                    setShowResults(false);
                  }}
                  className="text-blue-600 hover:text-blue-800 h-auto p-1"
                >
                  ✕
                </Button>
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject..."
            />
          </div>

          {/* Message Body */}
          <div className="space-y-2">
            <Label>Message</Label>
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

          {/* Actions */}
          <div className="flex justify-between items-center pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={sendMessageMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sendMessageMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
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
}
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, FileText, Calendar, MapPin, Users, DollarSign, Phone, Mail, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { EVENT_TYPES, STYLES, COLOR_PALETTES, ARRANGEMENT_TYPES, FLOWERS } from "@/lib/quote-constants";

interface QuoteRequest {
  id: number;
  event_type: string;
  event_date: string;
  event_time?: string;
  city: string;
  venue?: string;
  guest_count: number;
  arrangements: Array<{type: string; count: number}>;
  style: string;
  color_palette: string;
  preferred_flowers: string[];
  moodboard_url?: string;
  delivery_required: boolean;
  setup_required: boolean;
  teardown_required: boolean;
  pickup_option: boolean;
  add_ons: string[];
  allergies?: string;
  eco_friendly: boolean;
  min_budget: number;
  max_budget: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  additional_notes?: string;
  status: string;
  admin_notes?: string;
  quoted_price?: number;
  quoted_at?: string;
  reviewed_by?: string;
  assigned_florist_id?: number;
  created_at: string;
  updated_at: string;
}

export default function AdminQuoteRequests() {
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [adminNotes, setAdminNotes] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [assignedFloristId, setAssignedFloristId] = useState<number | null>(null);
  
  // Edit mode state
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editForm, setEditForm] = useState<Partial<QuoteRequest>>({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quoteRequests, isLoading } = useQuery<QuoteRequest[]>({
    queryKey: ['/api/quote-requests', statusFilter],
    queryFn: async () => {
      const token = localStorage.getItem('customerToken');
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await fetch(`/api/quote-requests${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch quote requests');
      return response.json();
    },
  });

  const { data: florists } = useQuery({
    queryKey: ['/api/florists'],
    queryFn: async () => {
      const token = localStorage.getItem('customerToken');
      const response = await fetch('/api/florists', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch florists');
      return response.json();
    },
  });

  const updateQuoteMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const token = localStorage.getItem('customerToken');
      const response = await fetch(`/api/quote-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update quote request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quote-requests'] });
      toast({
        title: "Quote request updated successfully",
      });
      setSelectedQuote(null);
      setAdminNotes("");
      setQuotedPrice("");
      setNewStatus("");
      setAssignedFloristId(null);
    },
    onError: () => {
      toast({
        title: "Error updating quote request",
        variant: "destructive"
      });
    }
  });

  // Edit mode functions - now covers ALL fields
  const startEditingDetails = (quote: QuoteRequest) => {
    setEditForm({
      // Customer information
      customer_name: quote.customer_name,
      customer_email: quote.customer_email,
      customer_phone: quote.customer_phone,
      
      // Event details
      event_type: quote.event_type,
      event_date: quote.event_date,
      event_time: quote.event_time,
      city: quote.city,
      venue: quote.venue,
      guest_count: quote.guest_count,
      
      // Style & theme
      style: quote.style,
      color_palette: quote.color_palette,
      preferred_flowers: quote.preferred_flowers,
      
      // Budget
      min_budget: quote.min_budget,
      max_budget: quote.max_budget,
      
      // Services
      delivery_required: quote.delivery_required,
      setup_required: quote.setup_required,
      teardown_required: quote.teardown_required,
      pickup_option: quote.pickup_option,
      eco_friendly: quote.eco_friendly,
      
      // Additional information
      additional_notes: quote.additional_notes,
      allergies: quote.allergies,
      
      // Admin fields
      status: quote.status,
      admin_notes: quote.admin_notes,
      quoted_price: quote.quoted_price,
      assigned_florist_id: quote.assigned_florist_id,
      
      // Arrangements
      arrangements: quote.arrangements,
      add_ons: quote.add_ons,
    });
    setIsEditingDetails(true);
  };

  const cancelEditingDetails = () => {
    setIsEditingDetails(false);
    setEditForm({});
  };

  const saveEventDetails = () => {
    if (!selectedQuote) return;
    
    updateQuoteMutation.mutate({
      id: selectedQuote.id,
      updates: editForm
    });
    setIsEditingDetails(false);
    setEditForm({});
  };

  const handleUpdateQuote = () => {
    if (!selectedQuote) return;
    
    const updates: any = {};
    if (newStatus) updates.status = newStatus;
    if (adminNotes.trim()) updates.adminNotes = adminNotes.trim();
    if (quotedPrice && !isNaN(parseFloat(quotedPrice))) {
      updates.quotedPrice = Math.round(parseFloat(quotedPrice) * 100); // Convert to cents
    }
    if (assignedFloristId !== null) {
      updates.assignedFloristId = assignedFloristId;
    }
    
    if (Object.keys(updates).length === 0) {
      toast({
        title: "No changes to save",
        variant: "destructive"
      });
      return;
    }
    
    updateQuoteMutation.mutate({ id: selectedQuote.id, updates });
  };

  const openQuoteDetail = (quote: QuoteRequest) => {
    setSelectedQuote(quote);
    setAdminNotes(quote.admin_notes || "");
    setQuotedPrice(quote.quoted_price ? (quote.quoted_price / 100).toFixed(2) : "");
    setNewStatus(quote.status);
    setAssignedFloristId(quote.assigned_florist_id || null);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'in-progress': return 'secondary';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-red-600';
      case 'in-progress': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'cancelled': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getEventTypeLabel = (type: string) => {
    return EVENT_TYPES.find(t => t.value === type)?.label || type;
  };

  const getStyleLabel = (style: string) => {
    return STYLES.find(s => s.value === style)?.label || style;
  };

  const getColorPaletteLabel = (palette: string) => {
    return COLOR_PALETTES.find(p => p.value === palette)?.label || palette;
  };

  const getArrangementLabel = (type: string) => {
    return ARRANGEMENT_TYPES.find(a => a.value === type)?.label || type;
  };

  const getFlowerName = (flowerValue: string) => {
    const flower = FLOWERS.find(f => f.value === flowerValue);
    return flower ? flower.label : flowerValue;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading quote requests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quote Requests</h1>
          <p className="text-gray-600">Manage custom event quote requests from customers.</p>
        </div>

        {/* Filter Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label htmlFor="statusFilter">Filter by Status:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-500">
                Total: {quoteRequests?.length || 0} requests
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quote Requests Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quoteRequests?.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{quote.customer_name}</div>
                        <div className="text-sm text-gray-500">{quote.customer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getEventTypeLabel(quote.event_type)}</div>
                        <div className="text-sm text-gray-500">{quote.guest_count} guests</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {format(new Date(quote.event_date), 'MMM d, yyyy')}
                          {quote.event_time && (
                            <span className="text-gray-500 ml-1">{quote.event_time}</span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{quote.city}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          ${(quote.min_budget / 100).toFixed(0)} - ${(quote.max_budget / 100).toFixed(0)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(quote.status)} className={getStatusColor(quote.status)}>
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {format(new Date(quote.created_at), 'MMM d, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => openQuoteDetail(quote)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quote Detail Modal */}
        <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Quote Request #{selectedQuote?.id}
                  </DialogTitle>
                  <DialogDescription>
                    Review and update this quote request
                  </DialogDescription>
                </div>
                {!isEditingDetails && (
                  <Button 
                    onClick={() => selectedQuote && startEditingDetails(selectedQuote)}
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-0"
                  >
                    Edit All Fields
                  </Button>
                )}
                {isEditingDetails && (
                  <div className="flex gap-3">
                    <Button 
                      onClick={saveEventDetails} 
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-0"
                    >
                      Save All Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={cancelEditingDetails} 
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-6 py-2 rounded-lg transition-all duration-200 hover:border-gray-400"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </DialogHeader>

            {selectedQuote && (
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Event Details</TabsTrigger>
                  <TabsTrigger value="arrangements">Arrangements</TabsTrigger>
                  <TabsTrigger value="admin">Admin Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Customer Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {!isEditingDetails ? (
                          <>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span>{selectedQuote.customer_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span>{selectedQuote.customer_email}</span>
                            </div>
                            {selectedQuote.customer_phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span>{selectedQuote.customer_phone}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <Label>Customer Name</Label>
                              <Input 
                                value={editForm.customer_name || ''} 
                                onChange={(e) => setEditForm({...editForm, customer_name: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Email</Label>
                              <Input 
                                type="email"
                                value={editForm.customer_email || ''} 
                                onChange={(e) => setEditForm({...editForm, customer_email: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Phone (Optional)</Label>
                              <Input 
                                value={editForm.customer_phone || ''} 
                                onChange={(e) => setEditForm({...editForm, customer_phone: e.target.value})}
                              />
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    {/* Event Basic Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Event Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {!isEditingDetails ? (
                          <>
                            <div>
                              <Label className="text-sm text-gray-500">Event Type</Label>
                              <div>{getEventTypeLabel(selectedQuote.event_type)}</div>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Date & Time</Label>
                              <div>
                                {format(new Date(selectedQuote.event_date), 'PPPP')}
                                {selectedQuote.event_time && (
                                  <span className="ml-2 text-gray-600">at {selectedQuote.event_time}</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Location</Label>
                              <div>
                                {selectedQuote.city}
                                {selectedQuote.venue && (
                                  <span className="text-gray-600"> • {selectedQuote.venue}</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Guest Count</Label>
                              <div>{selectedQuote.guest_count} guests</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <Label>Event Type</Label>
                              <Select 
                                value={editForm.event_type} 
                                onValueChange={(value) => setEditForm({...editForm, event_type: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {EVENT_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-2">
                                <Label>Event Date</Label>
                                <Input 
                                  type="date" 
                                  value={editForm.event_date ? editForm.event_date.split('T')[0] : ''} 
                                  onChange={(e) => setEditForm({...editForm, event_date: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Event Time</Label>
                                <Input 
                                  type="time" 
                                  value={editForm.event_time || ''} 
                                  onChange={(e) => setEditForm({...editForm, event_time: e.target.value})}
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-2">
                                <Label>City</Label>
                                <Input 
                                  value={editForm.city || ''} 
                                  onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Venue (Optional)</Label>
                                <Input 
                                  value={editForm.venue || ''} 
                                  onChange={(e) => setEditForm({...editForm, venue: e.target.value})}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Guest Count</Label>
                              <Input 
                                type="number" 
                                value={editForm.guest_count || ''} 
                                onChange={(e) => setEditForm({...editForm, guest_count: parseInt(e.target.value) || 0})}
                              />
                            </div>
                            
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Style & Theme */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Style & Theme</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!isEditingDetails ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm text-gray-500">Style</Label>
                              <div>{getStyleLabel(selectedQuote.style)}</div>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Color Palette</Label>
                              <div>{getColorPaletteLabel(selectedQuote.color_palette)}</div>
                            </div>
                          </div>
                          
                          {selectedQuote.preferred_flowers.length > 0 && (
                            <div>
                              <Label className="text-sm text-gray-500">Preferred Flowers</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {selectedQuote.preferred_flowers.map(flower => (
                                  <Badge key={flower} variant="secondary">
                                    {getFlowerName(flower)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedQuote.moodboard_url && (
                            <div>
                              <Label className="text-sm text-gray-500">Moodboard</Label>
                              <div>
                                <a 
                                  href={selectedQuote.moodboard_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View Moodboard
                                </a>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Style</Label>
                              <Select 
                                value={editForm.style} 
                                onValueChange={(value) => setEditForm({...editForm, style: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STYLES.map(style => (
                                    <SelectItem key={style.value} value={style.value}>
                                      {style.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Color Palette</Label>
                              <Select 
                                value={editForm.color_palette} 
                                onValueChange={(value) => setEditForm({...editForm, color_palette: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {COLOR_PALETTES.map(palette => (
                                    <SelectItem key={palette.value} value={palette.value}>
                                      {palette.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Moodboard URL (Optional)</Label>
                            <Input 
                              type="url"
                              value={editForm.moodboard_url || ''} 
                              onChange={(e) => setEditForm({...editForm, moodboard_url: e.target.value})}
                              placeholder="https://..."
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Budget & Services */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Budget Range</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {!isEditingDetails ? (
                          <div className="text-2xl font-bold">
                            ${(selectedQuote.min_budget / 100).toFixed(0)} - ${(selectedQuote.max_budget / 100).toFixed(0)}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-2">
                                <Label>Minimum Budget ($)</Label>
                                <Input 
                                  type="number"
                                  value={editForm.min_budget ? (editForm.min_budget / 100).toString() : ''} 
                                  onChange={(e) => setEditForm({...editForm, min_budget: parseInt(e.target.value || '0') * 100})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Maximum Budget ($)</Label>
                                <Input 
                                  type="number"
                                  value={editForm.max_budget ? (editForm.max_budget / 100).toString() : ''} 
                                  onChange={(e) => setEditForm({...editForm, max_budget: parseInt(e.target.value || '0') * 100})}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Services Needed</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {!isEditingDetails ? (
                          <div className="grid grid-cols-2 gap-2">
                            {selectedQuote.delivery_required && (
                              <Badge variant="secondary">Delivery</Badge>
                            )}
                            {selectedQuote.setup_required && (
                              <Badge variant="secondary">Setup</Badge>
                            )}
                            {selectedQuote.teardown_required && (
                              <Badge variant="secondary">Teardown</Badge>
                            )}
                            {selectedQuote.pickup_option && (
                              <Badge variant="secondary">Pickup Available</Badge>
                            )}
                            {selectedQuote.eco_friendly && (
                              <Badge variant="secondary">Eco-Friendly</Badge>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="delivery_required"
                                checked={editForm.delivery_required || false}
                                onChange={(e) => setEditForm({...editForm, delivery_required: e.target.checked})}
                              />
                              <Label htmlFor="delivery_required">Delivery Required</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="setup_required"
                                checked={editForm.setup_required || false}
                                onChange={(e) => setEditForm({...editForm, setup_required: e.target.checked})}
                              />
                              <Label htmlFor="setup_required">Setup Required</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="teardown_required"
                                checked={editForm.teardown_required || false}
                                onChange={(e) => setEditForm({...editForm, teardown_required: e.target.checked})}
                              />
                              <Label htmlFor="teardown_required">Teardown Required</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="pickup_option"
                                checked={editForm.pickup_option || false}
                                onChange={(e) => setEditForm({...editForm, pickup_option: e.target.checked})}
                              />
                              <Label htmlFor="pickup_option">Pickup Available</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="eco_friendly"
                                checked={editForm.eco_friendly || false}
                                onChange={(e) => setEditForm({...editForm, eco_friendly: e.target.checked})}
                              />
                              <Label htmlFor="eco_friendly">Eco-Friendly</Label>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Additional Notes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!isEditingDetails ? (
                        <>
                          {selectedQuote.allergies && (
                            <div>
                              <Label className="text-sm text-gray-500">Allergies / Special Considerations</Label>
                              <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-md text-sm">
                                {selectedQuote.allergies}
                              </div>
                            </div>
                          )}
                          {selectedQuote.additional_notes && (
                            <div>
                              <Label className="text-sm text-gray-500">Additional Notes</Label>
                              <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
                                {selectedQuote.additional_notes}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label>Allergies / Special Considerations</Label>
                            <Textarea 
                              value={editForm.allergies || ''} 
                              onChange={(e) => setEditForm({...editForm, allergies: e.target.value})}
                              placeholder="Any allergies or special considerations..."
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Additional Notes</Label>
                            <Textarea 
                              value={editForm.additional_notes || ''} 
                              onChange={(e) => setEditForm({...editForm, additional_notes: e.target.value})}
                              placeholder="Any additional notes or requirements..."
                              rows={3}
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="arrangements" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Requested Arrangements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedQuote.arrangements.map((arrangement, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium">
                              {getArrangementLabel(arrangement.type)}
                            </div>
                            <Badge variant="secondary">
                              {arrangement.count} {arrangement.count === 1 ? 'piece' : 'pieces'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      
                      {selectedQuote.add_ons.length > 0 && (
                        <div className="mt-6">
                          <Label className="text-sm text-gray-500">Add-ons Requested</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedQuote.add_ons.map(addon => (
                              <Badge key={addon} variant="outline">
                                {addon.charAt(0).toUpperCase() + addon.slice(1).replace('-', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="admin" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Status & Pricing</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {!isEditingDetails ? (
                          <>
                            <div className="flex items-center gap-2">
                              <Label>Status:</Label>
                              <Badge variant={getStatusBadgeVariant(selectedQuote.status)}>
                                {selectedQuote.status}
                              </Badge>
                            </div>
                            
                            {selectedQuote.quoted_price && (
                              <div>
                                <Label className="text-sm text-gray-500">Current Quote</Label>
                                <div className="text-xl font-bold text-green-600">
                                  ${(selectedQuote.quoted_price / 100).toFixed(2)}
                                </div>
                                {selectedQuote.quoted_at && (
                                  <div className="text-sm text-gray-500">
                                    Quoted on {format(new Date(selectedQuote.quoted_at), 'PPp')}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {selectedQuote.assigned_florist_id && (
                              <div>
                                <Label className="text-sm text-gray-500">Assigned Florist</Label>
                                <div>
                                  {florists?.find((f: any) => f.id === selectedQuote.assigned_florist_id)?.firstName} {florists?.find((f: any) => f.id === selectedQuote.assigned_florist_id)?.lastName}
                                  {florists?.find((f: any) => f.id === selectedQuote.assigned_florist_id)?.businessName && (
                                    <span className="text-gray-500"> - {florists?.find((f: any) => f.id === selectedQuote.assigned_florist_id)?.businessName}</span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {selectedQuote.reviewed_by && (
                              <div>
                                <Label className="text-sm text-gray-500">Last Reviewed By</Label>
                                <div>{selectedQuote.reviewed_by}</div>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <Label>Status</Label>
                              <Select 
                                value={editForm.status} 
                                onValueChange={(value) => setEditForm({...editForm, status: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Quote Price ($)</Label>
                              <Input 
                                type="number"
                                step="0.01"
                                value={editForm.quoted_price ? (editForm.quoted_price / 100).toFixed(2) : ''} 
                                onChange={(e) => setEditForm({...editForm, quoted_price: Math.round(parseFloat(e.target.value || '0') * 100)})}
                                placeholder="Enter quoted price"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Assigned Florist</Label>
                              <Select 
                                value={editForm.assigned_florist_id ? editForm.assigned_florist_id.toString() : ''} 
                                onValueChange={(value) => setEditForm({...editForm, assigned_florist_id: parseInt(value) || null})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a florist" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">No florist assigned</SelectItem>
                                  {florists?.map((florist: any) => (
                                    <SelectItem key={florist.id} value={florist.id.toString()}>
                                      {florist.firstName} {florist.lastName} - {florist.businessName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    {/* Admin Notes */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Admin Notes</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {!isEditingDetails ? (
                          <>
                            {selectedQuote.admin_notes ? (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                                {selectedQuote.admin_notes}
                              </div>
                            ) : (
                              <div className="text-gray-500 text-sm">No admin notes yet</div>
                            )}
                          </>
                        ) : (
                          <div className="space-y-2">
                            <Label>Admin Notes</Label>
                            <Textarea
                              value={editForm.admin_notes || ''}
                              onChange={(e) => setEditForm({...editForm, admin_notes: e.target.value})}
                              placeholder="Add notes for internal use..."
                              rows={4}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            
            {/* Save buttons at bottom of form */}
            {isEditingDetails && (
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                <Button 
                  variant="outline" 
                  onClick={cancelEditingDetails} 
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-6 py-2.5 rounded-lg transition-all duration-200 hover:border-gray-400"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveEventDetails} 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-0"
                >
                  Save All Changes
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
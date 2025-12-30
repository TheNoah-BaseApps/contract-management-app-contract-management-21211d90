'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Users,
  Calendar,
  TrendingUp
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ContractNegotiationsPage() {
  const router = useRouter();
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNegotiation, setSelectedNegotiation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    negotiation_id: '',
    contract_id: '',
    negotiation_start_date: '',
    negotiation_end_date: '',
    negotiation_status: '',
    internal_stakeholders: '',
    external_parties: '',
    major_changes_made: '',
    negotiation_mode: ''
  });

  useEffect(() => {
    fetchNegotiations();
  }, []);

  async function fetchNegotiations() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/contract-negotiations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNegotiations(data.data);
      } else {
        toast.error('Failed to fetch negotiations');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error loading negotiations');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/contract-negotiations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Negotiation created successfully');
        setIsAddModalOpen(false);
        resetForm();
        fetchNegotiations();
      } else {
        toast.error(data.error || 'Failed to create negotiation');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error creating negotiation');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!selectedNegotiation) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/contract-negotiations/${selectedNegotiation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Negotiation updated successfully');
        setIsEditModalOpen(false);
        setSelectedNegotiation(null);
        resetForm();
        fetchNegotiations();
      } else {
        toast.error(data.error || 'Failed to update negotiation');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error updating negotiation');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this negotiation?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/contract-negotiations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Negotiation deleted successfully');
        fetchNegotiations();
      } else {
        toast.error(data.error || 'Failed to delete negotiation');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error deleting negotiation');
    }
  }

  function resetForm() {
    setFormData({
      negotiation_id: '',
      contract_id: '',
      negotiation_start_date: '',
      negotiation_end_date: '',
      negotiation_status: '',
      internal_stakeholders: '',
      external_parties: '',
      major_changes_made: '',
      negotiation_mode: ''
    });
  }

  function openEditModal(negotiation) {
    setSelectedNegotiation(negotiation);
    setFormData({
      negotiation_id: negotiation.negotiation_id || '',
      contract_id: negotiation.contract_id || '',
      negotiation_start_date: negotiation.negotiation_start_date?.split('T')[0] || '',
      negotiation_end_date: negotiation.negotiation_end_date?.split('T')[0] || '',
      negotiation_status: negotiation.negotiation_status || '',
      internal_stakeholders: negotiation.internal_stakeholders || '',
      external_parties: negotiation.external_parties || '',
      major_changes_made: negotiation.major_changes_made || '',
      negotiation_mode: negotiation.negotiation_mode || ''
    });
    setIsEditModalOpen(true);
  }

  const filteredNegotiations = negotiations.filter(neg =>
    neg.negotiation_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    neg.contract_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    neg.negotiation_status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: negotiations.length,
    active: negotiations.filter(n => n.negotiation_status === 'Active').length,
    completed: negotiations.filter(n => n.negotiation_status === 'Completed').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contract Negotiations</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and track contract negotiation processes</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Negotiation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Negotiations</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Negotiations</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by negotiation ID, contract ID, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredNegotiations.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No negotiations found</p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Negotiation
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Negotiation ID</TableHead>
                  <TableHead>Contract ID</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNegotiations.map((negotiation) => (
                  <TableRow key={negotiation.id}>
                    <TableCell className="font-medium">{negotiation.negotiation_id}</TableCell>
                    <TableCell>{negotiation.contract_id}</TableCell>
                    <TableCell>{new Date(negotiation.negotiation_start_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {negotiation.negotiation_end_date 
                        ? new Date(negotiation.negotiation_end_date).toLocaleDateString() 
                        : 'Ongoing'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={negotiation.negotiation_status === 'Active' ? 'default' : 'secondary'}>
                        {negotiation.negotiation_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{negotiation.negotiation_mode || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(negotiation)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(negotiation.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Negotiation</DialogTitle>
            <DialogDescription>Create a new contract negotiation record</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="negotiation_id">Negotiation ID *</Label>
                <Input
                  id="negotiation_id"
                  value={formData.negotiation_id}
                  onChange={(e) => setFormData({ ...formData, negotiation_id: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contract_id">Contract ID *</Label>
                <Input
                  id="contract_id"
                  value={formData.contract_id}
                  onChange={(e) => setFormData({ ...formData, contract_id: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="negotiation_start_date">Start Date *</Label>
                <Input
                  id="negotiation_start_date"
                  type="date"
                  value={formData.negotiation_start_date}
                  onChange={(e) => setFormData({ ...formData, negotiation_start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="negotiation_end_date">End Date</Label>
                <Input
                  id="negotiation_end_date"
                  type="date"
                  value={formData.negotiation_end_date}
                  onChange={(e) => setFormData({ ...formData, negotiation_end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="negotiation_status">Status *</Label>
                <Input
                  id="negotiation_status"
                  value={formData.negotiation_status}
                  onChange={(e) => setFormData({ ...formData, negotiation_status: e.target.value })}
                  placeholder="e.g., Active, Completed, On Hold"
                  required
                />
              </div>
              <div>
                <Label htmlFor="negotiation_mode">Negotiation Mode</Label>
                <Input
                  id="negotiation_mode"
                  value={formData.negotiation_mode}
                  onChange={(e) => setFormData({ ...formData, negotiation_mode: e.target.value })}
                  placeholder="e.g., In-person, Virtual, Hybrid"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="internal_stakeholders">Internal Stakeholders</Label>
              <Textarea
                id="internal_stakeholders"
                value={formData.internal_stakeholders}
                onChange={(e) => setFormData({ ...formData, internal_stakeholders: e.target.value })}
                placeholder="List internal stakeholders..."
              />
            </div>
            <div>
              <Label htmlFor="external_parties">External Parties</Label>
              <Textarea
                id="external_parties"
                value={formData.external_parties}
                onChange={(e) => setFormData({ ...formData, external_parties: e.target.value })}
                placeholder="List external parties..."
              />
            </div>
            <div>
              <Label htmlFor="major_changes_made">Major Changes Made</Label>
              <Textarea
                id="major_changes_made"
                value={formData.major_changes_made}
                onChange={(e) => setFormData({ ...formData, major_changes_made: e.target.value })}
                placeholder="Describe major changes..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setIsAddModalOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Create Negotiation</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Negotiation</DialogTitle>
            <DialogDescription>Update negotiation details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_negotiation_id">Negotiation ID *</Label>
                <Input
                  id="edit_negotiation_id"
                  value={formData.negotiation_id}
                  onChange={(e) => setFormData({ ...formData, negotiation_id: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_contract_id">Contract ID *</Label>
                <Input
                  id="edit_contract_id"
                  value={formData.contract_id}
                  onChange={(e) => setFormData({ ...formData, contract_id: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_negotiation_start_date">Start Date *</Label>
                <Input
                  id="edit_negotiation_start_date"
                  type="date"
                  value={formData.negotiation_start_date}
                  onChange={(e) => setFormData({ ...formData, negotiation_start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_negotiation_end_date">End Date</Label>
                <Input
                  id="edit_negotiation_end_date"
                  type="date"
                  value={formData.negotiation_end_date}
                  onChange={(e) => setFormData({ ...formData, negotiation_end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_negotiation_status">Status *</Label>
                <Input
                  id="edit_negotiation_status"
                  value={formData.negotiation_status}
                  onChange={(e) => setFormData({ ...formData, negotiation_status: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_negotiation_mode">Negotiation Mode</Label>
                <Input
                  id="edit_negotiation_mode"
                  value={formData.negotiation_mode}
                  onChange={(e) => setFormData({ ...formData, negotiation_mode: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_internal_stakeholders">Internal Stakeholders</Label>
              <Textarea
                id="edit_internal_stakeholders"
                value={formData.internal_stakeholders}
                onChange={(e) => setFormData({ ...formData, internal_stakeholders: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_external_parties">External Parties</Label>
              <Textarea
                id="edit_external_parties"
                value={formData.external_parties}
                onChange={(e) => setFormData({ ...formData, external_parties: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_major_changes_made">Major Changes Made</Label>
              <Textarea
                id="edit_major_changes_made"
                value={formData.major_changes_made}
                onChange={(e) => setFormData({ ...formData, major_changes_made: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); setSelectedNegotiation(null); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update Negotiation</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
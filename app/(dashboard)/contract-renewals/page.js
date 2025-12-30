'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ContractRenewalsPage() {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRenewal, setSelectedRenewal] = useState(null);
  const [formData, setFormData] = useState({
    renewal_id: '',
    contract_id: '',
    renewal_date: '',
    renewed_by: '',
    new_end_date: '',
    terms_modified: '',
    renewal_status: '',
    renewal_type: '',
    renewal_approval_ref: ''
  });

  useEffect(() => {
    fetchRenewals();
  }, []);

  const fetchRenewals = async () => {
    try {
      const res = await fetch('/api/contract-renewals');
      const data = await res.json();
      if (data.success) {
        setRenewals(data.data);
      }
    } catch (error) {
      console.error('Error fetching renewals:', error);
      toast.error('Failed to load renewals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedRenewal 
        ? `/api/contract-renewals/${selectedRenewal.id}`
        : '/api/contract-renewals';
      const method = selectedRenewal ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(selectedRenewal ? 'Renewal updated successfully' : 'Renewal created successfully');
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        fetchRenewals();
      } else {
        toast.error(data.error || 'Failed to save renewal');
      }
    } catch (error) {
      console.error('Error saving renewal:', error);
      toast.error('Failed to save renewal');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this renewal?')) return;

    try {
      const res = await fetch(`/api/contract-renewals/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Renewal deleted successfully');
        fetchRenewals();
      } else {
        toast.error(data.error || 'Failed to delete renewal');
      }
    } catch (error) {
      console.error('Error deleting renewal:', error);
      toast.error('Failed to delete renewal');
    }
  };

  const handleEdit = (renewal) => {
    setSelectedRenewal(renewal);
    setFormData({
      renewal_id: renewal.renewal_id,
      contract_id: renewal.contract_id,
      renewal_date: renewal.renewal_date ? renewal.renewal_date.split('T')[0] : '',
      renewed_by: renewal.renewed_by,
      new_end_date: renewal.new_end_date ? renewal.new_end_date.split('T')[0] : '',
      terms_modified: renewal.terms_modified || '',
      renewal_status: renewal.renewal_status,
      renewal_type: renewal.renewal_type,
      renewal_approval_ref: renewal.renewal_approval_ref || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      renewal_id: '',
      contract_id: '',
      renewal_date: '',
      renewed_by: '',
      new_end_date: '',
      terms_modified: '',
      renewal_status: '',
      renewal_type: '',
      renewal_approval_ref: ''
    });
    setSelectedRenewal(null);
  };

  const handleAddClick = () => {
    resetForm();
    setShowAddModal(true);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Completed': 'bg-blue-100 text-blue-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contract Renewals</h1>
          <p className="text-gray-600 mt-1">Manage contract renewal requests and tracking</p>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Renewal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Renewals</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{renewals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {renewals.filter(r => r.renewal_status === 'Pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {renewals.filter(r => r.renewal_status === 'Approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {renewals.filter(r => r.renewal_status === 'Completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Renewal Records</CardTitle>
        </CardHeader>
        <CardContent>
          {renewals.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No renewals</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new renewal record.</p>
              <div className="mt-6">
                <Button onClick={handleAddClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Renewal
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Renewal ID</TableHead>
                  <TableHead>Contract ID</TableHead>
                  <TableHead>Renewed By</TableHead>
                  <TableHead>Renewal Date</TableHead>
                  <TableHead>New End Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renewals.map((renewal) => (
                  <TableRow key={renewal.id}>
                    <TableCell className="font-medium">{renewal.renewal_id}</TableCell>
                    <TableCell>{renewal.contract_id}</TableCell>
                    <TableCell>{renewal.renewed_by}</TableCell>
                    <TableCell>{new Date(renewal.renewal_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(renewal.new_end_date).toLocaleDateString()}</TableCell>
                    <TableCell>{renewal.renewal_type}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(renewal.renewal_status)}`}>
                        {renewal.renewal_status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(renewal)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(renewal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setShowEditModal(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRenewal ? 'Edit Renewal' : 'Add New Renewal'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="renewal_id">Renewal ID *</Label>
                <Input
                  id="renewal_id"
                  value={formData.renewal_id}
                  onChange={(e) => setFormData({ ...formData, renewal_id: e.target.value })}
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
              <div>
                <Label htmlFor="renewed_by">Renewed By *</Label>
                <Input
                  id="renewed_by"
                  value={formData.renewed_by}
                  onChange={(e) => setFormData({ ...formData, renewed_by: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="renewal_date">Renewal Date *</Label>
                <Input
                  id="renewal_date"
                  type="date"
                  value={formData.renewal_date}
                  onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="new_end_date">New End Date *</Label>
                <Input
                  id="new_end_date"
                  type="date"
                  value={formData.new_end_date}
                  onChange={(e) => setFormData({ ...formData, new_end_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="renewal_type">Renewal Type *</Label>
                <Select
                  value={formData.renewal_type}
                  onValueChange={(value) => setFormData({ ...formData, renewal_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Negotiated">Negotiated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="renewal_status">Status *</Label>
                <Select
                  value={formData.renewal_status}
                  onValueChange={(value) => setFormData({ ...formData, renewal_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="renewal_approval_ref">Approval Reference</Label>
                <Input
                  id="renewal_approval_ref"
                  value={formData.renewal_approval_ref}
                  onChange={(e) => setFormData({ ...formData, renewal_approval_ref: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="terms_modified">Terms Modified</Label>
              <Textarea
                id="terms_modified"
                value={formData.terms_modified}
                onChange={(e) => setFormData({ ...formData, terms_modified: e.target.value })}
                rows={4}
                placeholder="Describe any changes to contract terms..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedRenewal ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
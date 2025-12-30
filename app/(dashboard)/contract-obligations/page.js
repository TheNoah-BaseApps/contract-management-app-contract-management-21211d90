'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ClipboardList, Plus, Edit, Trash2, Calendar, AlertCircle } from 'lucide-react';

export default function ContractObligationsPage() {
  const [obligations, setObligations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedObligation, setSelectedObligation] = useState(null);
  const [formData, setFormData] = useState({
    obligation_id: '',
    contract_id: '',
    obligation_title: '',
    obligation_details: '',
    responsible_party: '',
    due_date: '',
    fulfillment_status: 'Pending',
    fulfillment_date: '',
    remarks: ''
  });

  useEffect(() => {
    fetchObligations();
  }, []);

  const fetchObligations = async () => {
    try {
      const res = await fetch('/api/contract-obligations');
      const data = await res.json();
      if (data.success) {
        setObligations(data.data);
      }
    } catch (error) {
      console.error('Error fetching obligations:', error);
      toast.error('Failed to load obligations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/contract-obligations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Obligation created successfully');
        setShowAddModal(false);
        resetForm();
        fetchObligations();
      } else {
        toast.error(data.error || 'Failed to create obligation');
      }
    } catch (error) {
      console.error('Error creating obligation:', error);
      toast.error('Failed to create obligation');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/contract-obligations/${selectedObligation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Obligation updated successfully');
        setShowEditModal(false);
        resetForm();
        fetchObligations();
      } else {
        toast.error(data.error || 'Failed to update obligation');
      }
    } catch (error) {
      console.error('Error updating obligation:', error);
      toast.error('Failed to update obligation');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this obligation?')) return;
    try {
      const res = await fetch(`/api/contract-obligations/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Obligation deleted successfully');
        fetchObligations();
      } else {
        toast.error(data.error || 'Failed to delete obligation');
      }
    } catch (error) {
      console.error('Error deleting obligation:', error);
      toast.error('Failed to delete obligation');
    }
  };

  const openEditModal = (obligation) => {
    setSelectedObligation(obligation);
    setFormData({
      obligation_id: obligation.obligation_id,
      contract_id: obligation.contract_id,
      obligation_title: obligation.obligation_title,
      obligation_details: obligation.obligation_details || '',
      responsible_party: obligation.responsible_party,
      due_date: obligation.due_date ? new Date(obligation.due_date).toISOString().split('T')[0] : '',
      fulfillment_status: obligation.fulfillment_status,
      fulfillment_date: obligation.fulfillment_date ? new Date(obligation.fulfillment_date).toISOString().split('T')[0] : '',
      remarks: obligation.remarks || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      obligation_id: '',
      contract_id: '',
      obligation_title: '',
      obligation_details: '',
      responsible_party: '',
      due_date: '',
      fulfillment_status: 'Pending',
      fulfillment_date: '',
      remarks: ''
    });
    setSelectedObligation(null);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'fulfilled': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Stats
  const totalObligations = obligations.length;
  const pendingObligations = obligations.filter(o => o.fulfillment_status.toLowerCase() === 'pending').length;
  const fulfilledObligations = obligations.filter(o => o.fulfillment_status.toLowerCase() === 'fulfilled').length;
  const overdueObligations = obligations.filter(o => o.fulfillment_status.toLowerCase() === 'overdue').length;

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contract Obligations</h1>
          <p className="text-gray-600 mt-1">Track and manage contract obligations</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Obligation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Obligations</CardDescription>
            <CardTitle className="text-3xl">{totalObligations}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <ClipboardList className="h-4 w-4 mr-2" />
              All obligations
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl">{pendingObligations}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-yellow-600">
              <Calendar className="h-4 w-4 mr-2" />
              Awaiting fulfillment
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Fulfilled</CardDescription>
            <CardTitle className="text-3xl">{fulfilledObligations}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <ClipboardList className="h-4 w-4 mr-2" />
              Completed
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Overdue</CardDescription>
            <CardTitle className="text-3xl">{overdueObligations}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mr-2" />
              Requires attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Obligations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Obligations</CardTitle>
          <CardDescription>View and manage all contract obligations</CardDescription>
        </CardHeader>
        <CardContent>
          {obligations.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No obligations yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first obligation</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Obligation
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Obligation ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Contract ID</TableHead>
                  <TableHead>Responsible Party</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {obligations.map((obligation) => (
                  <TableRow key={obligation.id}>
                    <TableCell className="font-medium">{obligation.obligation_id}</TableCell>
                    <TableCell>{obligation.obligation_title}</TableCell>
                    <TableCell>{obligation.contract_id}</TableCell>
                    <TableCell>{obligation.responsible_party}</TableCell>
                    <TableCell>{new Date(obligation.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(obligation.fulfillment_status)}>
                        {obligation.fulfillment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(obligation)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(obligation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Contract Obligation</DialogTitle>
            <DialogDescription>Create a new contract obligation record</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="obligation_id">Obligation ID *</Label>
                <Input
                  id="obligation_id"
                  value={formData.obligation_id}
                  onChange={(e) => setFormData({ ...formData, obligation_id: e.target.value })}
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
            <div>
              <Label htmlFor="obligation_title">Obligation Title *</Label>
              <Input
                id="obligation_title"
                value={formData.obligation_title}
                onChange={(e) => setFormData({ ...formData, obligation_title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="obligation_details">Obligation Details</Label>
              <Textarea
                id="obligation_details"
                value={formData.obligation_details}
                onChange={(e) => setFormData({ ...formData, obligation_details: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responsible_party">Responsible Party *</Label>
                <Input
                  id="responsible_party"
                  value={formData.responsible_party}
                  onChange={(e) => setFormData({ ...formData, responsible_party: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fulfillment_status">Fulfillment Status *</Label>
                <select
                  id="fulfillment_status"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={formData.fulfillment_status}
                  onChange={(e) => setFormData({ ...formData, fulfillment_status: e.target.value })}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Fulfilled">Fulfilled</option>
                  <option value="Overdue">Overdue</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </div>
              <div>
                <Label htmlFor="fulfillment_date">Fulfillment Date</Label>
                <Input
                  id="fulfillment_date"
                  type="date"
                  value={formData.fulfillment_date}
                  onChange={(e) => setFormData({ ...formData, fulfillment_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Create Obligation</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contract Obligation</DialogTitle>
            <DialogDescription>Update obligation details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_obligation_id">Obligation ID *</Label>
                <Input
                  id="edit_obligation_id"
                  value={formData.obligation_id}
                  onChange={(e) => setFormData({ ...formData, obligation_id: e.target.value })}
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
            <div>
              <Label htmlFor="edit_obligation_title">Obligation Title *</Label>
              <Input
                id="edit_obligation_title"
                value={formData.obligation_title}
                onChange={(e) => setFormData({ ...formData, obligation_title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_obligation_details">Obligation Details</Label>
              <Textarea
                id="edit_obligation_details"
                value={formData.obligation_details}
                onChange={(e) => setFormData({ ...formData, obligation_details: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_responsible_party">Responsible Party *</Label>
                <Input
                  id="edit_responsible_party"
                  value={formData.responsible_party}
                  onChange={(e) => setFormData({ ...formData, responsible_party: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_due_date">Due Date *</Label>
                <Input
                  id="edit_due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_fulfillment_status">Fulfillment Status *</Label>
                <select
                  id="edit_fulfillment_status"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={formData.fulfillment_status}
                  onChange={(e) => setFormData({ ...formData, fulfillment_status: e.target.value })}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Fulfilled">Fulfilled</option>
                  <option value="Overdue">Overdue</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit_fulfillment_date">Fulfillment Date</Label>
                <Input
                  id="edit_fulfillment_date"
                  type="date"
                  value={formData.fulfillment_date}
                  onChange={(e) => setFormData({ ...formData, fulfillment_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_remarks">Remarks</Label>
              <Textarea
                id="edit_remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update Obligation</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
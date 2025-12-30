'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, XCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ContractTerminationsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    termination_id: '',
    contract_id: '',
    termination_date: '',
    termination_reason: '',
    terminated_by: '',
    termination_status: 'Pending',
    counterparty_notified: false,
    exit_clause_reference: '',
    settlement_details: ''
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    try {
      const res = await fetch('/api/contract-terminations');
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
      } else {
        toast.error('Failed to fetch contract termination records');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('Error loading contract termination records');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/contract-terminations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Contract termination record created successfully');
        setShowAddModal(false);
        resetForm();
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to create record');
      }
    } catch (error) {
      console.error('Error creating record:', error);
      toast.error('Error creating contract termination record');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/contract-terminations/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Contract termination record updated successfully');
        setShowEditModal(false);
        setSelectedRecord(null);
        resetForm();
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to update record');
      }
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Error updating contract termination record');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      const res = await fetch(`/api/contract-terminations/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Contract termination record deleted successfully');
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Error deleting contract termination record');
    }
  }

  function openEditModal(record) {
    setSelectedRecord(record);
    setFormData({
      termination_id: record.termination_id,
      contract_id: record.contract_id,
      termination_date: record.termination_date?.split('T')[0] || '',
      termination_reason: record.termination_reason,
      terminated_by: record.terminated_by,
      termination_status: record.termination_status,
      counterparty_notified: record.counterparty_notified,
      exit_clause_reference: record.exit_clause_reference || '',
      settlement_details: record.settlement_details || ''
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      termination_id: '',
      contract_id: '',
      termination_date: '',
      termination_reason: '',
      terminated_by: '',
      termination_status: 'Pending',
      counterparty_notified: false,
      exit_clause_reference: '',
      settlement_details: ''
    });
  }

  function getStatusBadge(status) {
    const statusConfig = {
      'Pending': { variant: 'secondary', icon: AlertTriangle },
      'Processing': { variant: 'default', icon: AlertTriangle },
      'Completed': { variant: 'default', icon: CheckCircle },
      'Cancelled': { variant: 'destructive', icon: XCircle }
    };
    const config = statusConfig[status] || statusConfig['Pending'];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Contract Terminations</h1>
          <p className="text-sm text-gray-600 mt-1">Manage contract termination records</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Termination
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Terminations</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter(r => r.termination_status === 'Pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter(r => r.termination_status === 'Completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Termination Records</CardTitle>
          <CardDescription>A list of all contract termination records</CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12">
              <XCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No termination records</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new termination record.</p>
              <div className="mt-6">
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Termination
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Termination ID</TableHead>
                  <TableHead>Contract ID</TableHead>
                  <TableHead>Termination Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Terminated By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.termination_id}</TableCell>
                    <TableCell>{record.contract_id}</TableCell>
                    <TableCell>{new Date(record.termination_date).toLocaleDateString()}</TableCell>
                    <TableCell>{record.termination_reason}</TableCell>
                    <TableCell>{record.terminated_by}</TableCell>
                    <TableCell>{getStatusBadge(record.termination_status)}</TableCell>
                    <TableCell>
                      {record.counterparty_notified ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">Yes</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(record)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
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
            <DialogTitle>Add Termination Record</DialogTitle>
            <DialogDescription>Create a new contract termination record</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="termination_id">Termination ID *</Label>
                  <Input
                    id="termination_id"
                    value={formData.termination_id}
                    onChange={(e) => setFormData({ ...formData, termination_id: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label htmlFor="termination_date">Termination Date *</Label>
                  <Input
                    id="termination_date"
                    type="date"
                    value={formData.termination_date}
                    onChange={(e) => setFormData({ ...formData, termination_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="terminated_by">Terminated By *</Label>
                  <Input
                    id="terminated_by"
                    value={formData.terminated_by}
                    onChange={(e) => setFormData({ ...formData, terminated_by: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="termination_reason">Termination Reason *</Label>
                <Textarea
                  id="termination_reason"
                  value={formData.termination_reason}
                  onChange={(e) => setFormData({ ...formData, termination_reason: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="termination_status">Status *</Label>
                  <select
                    id="termination_status"
                    value={formData.termination_status}
                    onChange={(e) => setFormData({ ...formData, termination_status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exit_clause_reference">Exit Clause Reference</Label>
                  <Input
                    id="exit_clause_reference"
                    value={formData.exit_clause_reference}
                    onChange={(e) => setFormData({ ...formData, exit_clause_reference: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="settlement_details">Settlement Details</Label>
                <Textarea
                  id="settlement_details"
                  value={formData.settlement_details}
                  onChange={(e) => setFormData({ ...formData, settlement_details: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="counterparty_notified"
                  checked={formData.counterparty_notified}
                  onCheckedChange={(checked) => setFormData({ ...formData, counterparty_notified: checked })}
                />
                <Label htmlFor="counterparty_notified" className="cursor-pointer">
                  Counterparty Notified
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Create Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Termination Record</DialogTitle>
            <DialogDescription>Update contract termination record details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_termination_id">Termination ID *</Label>
                  <Input
                    id="edit_termination_id"
                    value={formData.termination_id}
                    onChange={(e) => setFormData({ ...formData, termination_id: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label htmlFor="edit_termination_date">Termination Date *</Label>
                  <Input
                    id="edit_termination_date"
                    type="date"
                    value={formData.termination_date}
                    onChange={(e) => setFormData({ ...formData, termination_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_terminated_by">Terminated By *</Label>
                  <Input
                    id="edit_terminated_by"
                    value={formData.terminated_by}
                    onChange={(e) => setFormData({ ...formData, terminated_by: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_termination_reason">Termination Reason *</Label>
                <Textarea
                  id="edit_termination_reason"
                  value={formData.termination_reason}
                  onChange={(e) => setFormData({ ...formData, termination_reason: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_termination_status">Status *</Label>
                  <select
                    id="edit_termination_status"
                    value={formData.termination_status}
                    onChange={(e) => setFormData({ ...formData, termination_status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_exit_clause_reference">Exit Clause Reference</Label>
                  <Input
                    id="edit_exit_clause_reference"
                    value={formData.exit_clause_reference}
                    onChange={(e) => setFormData({ ...formData, exit_clause_reference: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_settlement_details">Settlement Details</Label>
                <Textarea
                  id="edit_settlement_details"
                  value={formData.settlement_details}
                  onChange={(e) => setFormData({ ...formData, settlement_details: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_counterparty_notified"
                  checked={formData.counterparty_notified}
                  onCheckedChange={(checked) => setFormData({ ...formData, counterparty_notified: checked })}
                />
                <Label htmlFor="edit_counterparty_notified" className="cursor-pointer">
                  Counterparty Notified
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setSelectedRecord(null); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
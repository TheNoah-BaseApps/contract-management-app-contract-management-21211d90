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
import { Plus, Pencil, Trash2, FileEdit, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ContractAmendmentsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    amendment_id: '',
    contract_id: '',
    amendment_date: '',
    amended_by: '',
    amendment_reason: '',
    clauses_amended: '',
    amendment_status: 'Draft',
    legal_review_required: false,
    amendment_document_ref: ''
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    try {
      const res = await fetch('/api/contract-amendments');
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
      } else {
        toast.error('Failed to fetch contract amendment records');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('Error loading contract amendment records');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/contract-amendments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Contract amendment record created successfully');
        setShowAddModal(false);
        resetForm();
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to create record');
      }
    } catch (error) {
      console.error('Error creating record:', error);
      toast.error('Error creating contract amendment record');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/contract-amendments/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Contract amendment record updated successfully');
        setShowEditModal(false);
        setSelectedRecord(null);
        resetForm();
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to update record');
      }
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Error updating contract amendment record');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      const res = await fetch(`/api/contract-amendments/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Contract amendment record deleted successfully');
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Error deleting contract amendment record');
    }
  }

  function openEditModal(record) {
    setSelectedRecord(record);
    setFormData({
      amendment_id: record.amendment_id,
      contract_id: record.contract_id,
      amendment_date: record.amendment_date?.split('T')[0] || '',
      amended_by: record.amended_by,
      amendment_reason: record.amendment_reason,
      clauses_amended: record.clauses_amended || '',
      amendment_status: record.amendment_status,
      legal_review_required: record.legal_review_required,
      amendment_document_ref: record.amendment_document_ref || ''
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      amendment_id: '',
      contract_id: '',
      amendment_date: '',
      amended_by: '',
      amendment_reason: '',
      clauses_amended: '',
      amendment_status: 'Draft',
      legal_review_required: false,
      amendment_document_ref: ''
    });
  }

  function getStatusBadge(status) {
    const statusConfig = {
      'Draft': { variant: 'secondary', icon: FileEdit },
      'Pending Review': { variant: 'default', icon: AlertCircle },
      'Approved': { variant: 'default', icon: CheckCircle },
      'Rejected': { variant: 'destructive', icon: AlertCircle }
    };
    const config = statusConfig[status] || statusConfig['Draft'];
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
          <h1 className="text-2xl font-bold text-gray-900">Contract Amendments</h1>
          <p className="text-sm text-gray-600 mt-1">Manage contract amendment records</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Amendment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amendments</CardTitle>
            <FileEdit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter(r => r.amendment_status === 'Pending Review').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter(r => r.amendment_status === 'Approved').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Amendment Records</CardTitle>
          <CardDescription>A list of all contract amendment records</CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12">
              <FileEdit className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No amendment records</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new amendment record.</p>
              <div className="mt-6">
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Amendment
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amendment ID</TableHead>
                  <TableHead>Contract ID</TableHead>
                  <TableHead>Amendment Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Amended By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Legal Review</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.amendment_id}</TableCell>
                    <TableCell>{record.contract_id}</TableCell>
                    <TableCell>{new Date(record.amendment_date).toLocaleDateString()}</TableCell>
                    <TableCell>{record.amendment_reason}</TableCell>
                    <TableCell>{record.amended_by}</TableCell>
                    <TableCell>{getStatusBadge(record.amendment_status)}</TableCell>
                    <TableCell>
                      {record.legal_review_required ? (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Required</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700">Not Required</Badge>
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
            <DialogTitle>Add Amendment Record</DialogTitle>
            <DialogDescription>Create a new contract amendment record</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amendment_id">Amendment ID *</Label>
                  <Input
                    id="amendment_id"
                    value={formData.amendment_id}
                    onChange={(e) => setFormData({ ...formData, amendment_id: e.target.value })}
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
                  <Label htmlFor="amendment_date">Amendment Date *</Label>
                  <Input
                    id="amendment_date"
                    type="date"
                    value={formData.amendment_date}
                    onChange={(e) => setFormData({ ...formData, amendment_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amended_by">Amended By *</Label>
                  <Input
                    id="amended_by"
                    value={formData.amended_by}
                    onChange={(e) => setFormData({ ...formData, amended_by: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amendment_reason">Amendment Reason *</Label>
                <Textarea
                  id="amendment_reason"
                  value={formData.amendment_reason}
                  onChange={(e) => setFormData({ ...formData, amendment_reason: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clauses_amended">Clauses Amended</Label>
                <Textarea
                  id="clauses_amended"
                  value={formData.clauses_amended}
                  onChange={(e) => setFormData({ ...formData, clauses_amended: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amendment_status">Status *</Label>
                  <select
                    id="amendment_status"
                    value={formData.amendment_status}
                    onChange={(e) => setFormData({ ...formData, amendment_status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amendment_document_ref">Document Reference</Label>
                  <Input
                    id="amendment_document_ref"
                    value={formData.amendment_document_ref}
                    onChange={(e) => setFormData({ ...formData, amendment_document_ref: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="legal_review_required"
                  checked={formData.legal_review_required}
                  onCheckedChange={(checked) => setFormData({ ...formData, legal_review_required: checked })}
                />
                <Label htmlFor="legal_review_required" className="cursor-pointer">
                  Legal Review Required
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
            <DialogTitle>Edit Amendment Record</DialogTitle>
            <DialogDescription>Update contract amendment record details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_amendment_id">Amendment ID *</Label>
                  <Input
                    id="edit_amendment_id"
                    value={formData.amendment_id}
                    onChange={(e) => setFormData({ ...formData, amendment_id: e.target.value })}
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
                  <Label htmlFor="edit_amendment_date">Amendment Date *</Label>
                  <Input
                    id="edit_amendment_date"
                    type="date"
                    value={formData.amendment_date}
                    onChange={(e) => setFormData({ ...formData, amendment_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_amended_by">Amended By *</Label>
                  <Input
                    id="edit_amended_by"
                    value={formData.amended_by}
                    onChange={(e) => setFormData({ ...formData, amended_by: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_amendment_reason">Amendment Reason *</Label>
                <Textarea
                  id="edit_amendment_reason"
                  value={formData.amendment_reason}
                  onChange={(e) => setFormData({ ...formData, amendment_reason: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_clauses_amended">Clauses Amended</Label>
                <Textarea
                  id="edit_clauses_amended"
                  value={formData.clauses_amended}
                  onChange={(e) => setFormData({ ...formData, clauses_amended: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_amendment_status">Status *</Label>
                  <select
                    id="edit_amendment_status"
                    value={formData.amendment_status}
                    onChange={(e) => setFormData({ ...formData, amendment_status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_amendment_document_ref">Document Reference</Label>
                  <Input
                    id="edit_amendment_document_ref"
                    value={formData.amendment_document_ref}
                    onChange={(e) => setFormData({ ...formData, amendment_document_ref: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_legal_review_required"
                  checked={formData.legal_review_required}
                  onCheckedChange={(checked) => setFormData({ ...formData, legal_review_required: checked })}
                />
                <Label htmlFor="edit_legal_review_required" className="cursor-pointer">
                  Legal Review Required
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
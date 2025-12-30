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
  FileCheck,
  DollarSign,
  Calendar
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ContractExecutionsPage() {
  const router = useRouter();
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    contract_id: '',
    contract_title: '',
    contract_type: '',
    contract_parties: '',
    contract_owner_id: '',
    initiating_department: '',
    effective_date: '',
    expiry_date: '',
    contract_value: '',
    payment_terms: '',
    status: '',
    signing_date: '',
    execution_date: '',
    signed_by_internal: '',
    signed_by_external: '',
    contract_documents: '',
    contract_terms: '',
    obligations_summary: '',
    renewal_clause: '',
    termination_clause: '',
    compliance_requirements: '',
    confidentiality_level: '',
    audit_trail: '',
    remarks: ''
  });

  useEffect(() => {
    fetchExecutions();
  }, []);

  async function fetchExecutions() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/contract-executions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setExecutions(data.data);
      } else {
        toast.error('Failed to fetch executions');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error loading executions');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/contract-executions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Contract execution created successfully');
        setIsAddModalOpen(false);
        resetForm();
        fetchExecutions();
      } else {
        toast.error(data.error || 'Failed to create execution');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error creating execution');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!selectedExecution) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/contract-executions/${selectedExecution.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Contract execution updated successfully');
        setIsEditModalOpen(false);
        setSelectedExecution(null);
        resetForm();
        fetchExecutions();
      } else {
        toast.error(data.error || 'Failed to update execution');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error updating execution');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this execution?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/contract-executions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Contract execution deleted successfully');
        fetchExecutions();
      } else {
        toast.error(data.error || 'Failed to delete execution');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error deleting execution');
    }
  }

  function resetForm() {
    setFormData({
      contract_id: '',
      contract_title: '',
      contract_type: '',
      contract_parties: '',
      contract_owner_id: '',
      initiating_department: '',
      effective_date: '',
      expiry_date: '',
      contract_value: '',
      payment_terms: '',
      status: '',
      signing_date: '',
      execution_date: '',
      signed_by_internal: '',
      signed_by_external: '',
      contract_documents: '',
      contract_terms: '',
      obligations_summary: '',
      renewal_clause: '',
      termination_clause: '',
      compliance_requirements: '',
      confidentiality_level: '',
      audit_trail: '',
      remarks: ''
    });
  }

  function openEditModal(execution) {
    setSelectedExecution(execution);
    setFormData({
      contract_id: execution.contract_id || '',
      contract_title: execution.contract_title || '',
      contract_type: execution.contract_type || '',
      contract_parties: execution.contract_parties || '',
      contract_owner_id: execution.contract_owner_id || '',
      initiating_department: execution.initiating_department || '',
      effective_date: execution.effective_date?.split('T')[0] || '',
      expiry_date: execution.expiry_date?.split('T')[0] || '',
      contract_value: execution.contract_value || '',
      payment_terms: execution.payment_terms || '',
      status: execution.status || '',
      signing_date: execution.signing_date?.split('T')[0] || '',
      execution_date: execution.execution_date?.split('T')[0] || '',
      signed_by_internal: execution.signed_by_internal || '',
      signed_by_external: execution.signed_by_external || '',
      contract_documents: execution.contract_documents || '',
      contract_terms: execution.contract_terms || '',
      obligations_summary: execution.obligations_summary || '',
      renewal_clause: execution.renewal_clause || '',
      termination_clause: execution.termination_clause || '',
      compliance_requirements: execution.compliance_requirements || '',
      confidentiality_level: execution.confidentiality_level || '',
      audit_trail: execution.audit_trail || '',
      remarks: execution.remarks || ''
    });
    setIsEditModalOpen(true);
  }

  const filteredExecutions = executions.filter(exec =>
    exec.contract_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exec.contract_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exec.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: executions.length,
    executed: executions.filter(e => e.status === 'Executed').length,
    pending: executions.filter(e => e.status === 'Pending').length
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
          <h1 className="text-2xl font-bold text-gray-900">Contract Executions</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and track contract execution processes</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Execution
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <FileCheck className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Executed</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.executed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by contract ID, title, or status..."
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
          {filteredExecutions.length === 0 ? (
            <div className="text-center py-12">
              <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No contract executions found</p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Execution
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExecutions.map((execution) => (
                  <TableRow key={execution.id}>
                    <TableCell className="font-medium">{execution.contract_id}</TableCell>
                    <TableCell>{execution.contract_title}</TableCell>
                    <TableCell>{execution.contract_type}</TableCell>
                    <TableCell>{new Date(execution.effective_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={execution.status === 'Executed' ? 'default' : 'secondary'}>
                        {execution.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{execution.contract_value || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(execution)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(execution.id)}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Contract Execution</DialogTitle>
            <DialogDescription>Create a new contract execution record</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="contract_title">Contract Title *</Label>
                <Input
                  id="contract_title"
                  value={formData.contract_title}
                  onChange={(e) => setFormData({ ...formData, contract_title: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contract_type">Contract Type *</Label>
                <Input
                  id="contract_type"
                  value={formData.contract_type}
                  onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="initiating_department">Initiating Department *</Label>
                <Input
                  id="initiating_department"
                  value={formData.initiating_department}
                  onChange={(e) => setFormData({ ...formData, initiating_department: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="effective_date">Effective Date *</Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status *</Label>
                <Input
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  placeholder="e.g., Executed, Pending, Active"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contract_value">Contract Value</Label>
                <Input
                  id="contract_value"
                  value={formData.contract_value}
                  onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })}
                  placeholder="e.g., $100,000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="signing_date">Signing Date</Label>
                <Input
                  id="signing_date"
                  type="date"
                  value={formData.signing_date}
                  onChange={(e) => setFormData({ ...formData, signing_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="execution_date">Execution Date</Label>
                <Input
                  id="execution_date"
                  type="date"
                  value={formData.execution_date}
                  onChange={(e) => setFormData({ ...formData, execution_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="contract_parties">Contract Parties</Label>
              <Textarea
                id="contract_parties"
                value={formData.contract_parties}
                onChange={(e) => setFormData({ ...formData, contract_parties: e.target.value })}
                placeholder="List all contract parties..."
              />
            </div>
            <div>
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Textarea
                id="payment_terms"
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                placeholder="Describe payment terms..."
              />
            </div>
            <div>
              <Label htmlFor="contract_terms">Contract Terms</Label>
              <Textarea
                id="contract_terms"
                value={formData.contract_terms}
                onChange={(e) => setFormData({ ...formData, contract_terms: e.target.value })}
                placeholder="Key contract terms..."
              />
            </div>
            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setIsAddModalOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Create Execution</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal - Similar structure to Add Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contract Execution</DialogTitle>
            <DialogDescription>Update execution details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Same form fields as Add Modal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_contract_id">Contract ID *</Label>
                <Input
                  id="edit_contract_id"
                  value={formData.contract_id}
                  onChange={(e) => setFormData({ ...formData, contract_id: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_contract_title">Contract Title *</Label>
                <Input
                  id="edit_contract_title"
                  value={formData.contract_title}
                  onChange={(e) => setFormData({ ...formData, contract_title: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_status">Status *</Label>
                <Input
                  id="edit_status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_contract_value">Contract Value</Label>
                <Input
                  id="edit_contract_value"
                  value={formData.contract_value}
                  onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); setSelectedExecution(null); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update Execution</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Plus, Edit, Trash2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';

export default function ContractApprovalsPage() {
  const router = useRouter();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingApproval, setEditingApproval] = useState(null);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });

  const [formData, setFormData] = useState({
    approval_id: '',
    contract_id: '',
    approver_name: '',
    approval_level: '',
    approval_date: '',
    approval_status: 'Pending',
    comments: '',
    approval_document_ref: '',
    escalation_required: false
  });

  useEffect(() => {
    fetchApprovals();
  }, []);

  async function fetchApprovals() {
    try {
      setLoading(true);
      const res = await fetch('/api/contract-approvals');
      const data = await res.json();
      
      if (data.success) {
        setApprovals(data.data);
        calculateStats(data.data);
      } else {
        toast.error('Failed to load contract approvals');
      }
    } catch (error) {
      console.error('Error fetching approvals:', error);
      toast.error('Error loading contract approvals');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(data) {
    const total = data.length;
    const approved = data.filter(a => a.approval_status === 'Approved').length;
    const pending = data.filter(a => a.approval_status === 'Pending').length;
    const rejected = data.filter(a => a.approval_status === 'Rejected').length;
    setStats({ total, approved, pending, rejected });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/contract-approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success('Contract approval created successfully');
        setShowAddModal(false);
        resetForm();
        fetchApprovals();
      } else {
        toast.error(data.error || 'Failed to create contract approval');
      }
    } catch (error) {
      console.error('Error creating approval:', error);
      toast.error('Error creating contract approval');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/contract-approvals/${editingApproval.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success('Contract approval updated successfully');
        setShowEditModal(false);
        setEditingApproval(null);
        resetForm();
        fetchApprovals();
      } else {
        toast.error(data.error || 'Failed to update contract approval');
      }
    } catch (error) {
      console.error('Error updating approval:', error);
      toast.error('Error updating contract approval');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this contract approval?')) return;
    
    try {
      const res = await fetch(`/api/contract-approvals/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success('Contract approval deleted successfully');
        fetchApprovals();
      } else {
        toast.error(data.error || 'Failed to delete contract approval');
      }
    } catch (error) {
      console.error('Error deleting approval:', error);
      toast.error('Error deleting contract approval');
    }
  }

  function handleEdit(approval) {
    setEditingApproval(approval);
    setFormData({
      approval_id: approval.approval_id,
      contract_id: approval.contract_id,
      approver_name: approval.approver_name,
      approval_level: approval.approval_level,
      approval_date: approval.approval_date?.split('T')[0] || '',
      approval_status: approval.approval_status,
      comments: approval.comments || '',
      approval_document_ref: approval.approval_document_ref || '',
      escalation_required: approval.escalation_required
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      approval_id: '',
      contract_id: '',
      approver_name: '',
      approval_level: '',
      approval_date: '',
      approval_status: 'Pending',
      comments: '',
      approval_document_ref: '',
      escalation_required: false
    });
  }

  function getStatusBadge(status) {
    const variants = {
      'Pending': { icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
      'Approved': { icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      'Rejected': { icon: XCircle, className: 'bg-red-100 text-red-800' },
      'Under Review': { icon: AlertTriangle, className: 'bg-blue-100 text-blue-800' }
    };
    
    const variant = variants[status] || variants['Pending'];
    const Icon = variant.icon;
    
    return (
      <Badge className={variant.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contract Approvals</h1>
          <p className="text-sm text-gray-600 mt-1">Manage contract approval workflow</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Approval
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Approvals Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Contract Approvals</CardTitle>
          <CardDescription>View and manage contract approvals</CardDescription>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contract approvals yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first approval record.</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Approval
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Approval ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Contract ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Approver</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Level</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Escalation</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvals.map((approval) => (
                    <tr key={approval.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{approval.approval_id}</td>
                      <td className="py-3 px-4">{approval.contract_id}</td>
                      <td className="py-3 px-4">{approval.approver_name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{approval.approval_level}</Badge>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(approval.approval_status)}</td>
                      <td className="py-3 px-4">
                        {approval.escalation_required ? (
                          <Badge variant="destructive">Required</Badge>
                        ) : (
                          <span className="text-gray-500 text-sm">No</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {approval.approval_date ? new Date(approval.approval_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(approval)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(approval.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Contract Approval</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="approval_id">Approval ID *</Label>
                <Input
                  id="approval_id"
                  value={formData.approval_id}
                  onChange={(e) => setFormData({ ...formData, approval_id: e.target.value })}
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
                <Label htmlFor="approver_name">Approver Name *</Label>
                <Input
                  id="approver_name"
                  value={formData.approver_name}
                  onChange={(e) => setFormData({ ...formData, approver_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="approval_level">Approval Level *</Label>
                <Input
                  id="approval_level"
                  value={formData.approval_level}
                  onChange={(e) => setFormData({ ...formData, approval_level: e.target.value })}
                  placeholder="e.g., Manager, Director, Executive"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="approval_status">Approval Status *</Label>
                <Select
                  value={formData.approval_status}
                  onValueChange={(value) => setFormData({ ...formData, approval_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="approval_date">Approval Date</Label>
                <Input
                  id="approval_date"
                  type="date"
                  value={formData.approval_date}
                  onChange={(e) => setFormData({ ...formData, approval_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="approval_document_ref">Approval Document Reference</Label>
              <Input
                id="approval_document_ref"
                value={formData.approval_document_ref}
                onChange={(e) => setFormData({ ...formData, approval_document_ref: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div>
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                rows={3}
                placeholder="Optional notes or comments"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="escalation_required"
                checked={formData.escalation_required}
                onCheckedChange={(checked) => setFormData({ ...formData, escalation_required: checked })}
              />
              <Label htmlFor="escalation_required" className="text-sm font-normal cursor-pointer">
                Escalation Required
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">Create Approval</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contract Approval</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_approval_id">Approval ID *</Label>
                <Input
                  id="edit_approval_id"
                  value={formData.approval_id}
                  onChange={(e) => setFormData({ ...formData, approval_id: e.target.value })}
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
                <Label htmlFor="edit_approver_name">Approver Name *</Label>
                <Input
                  id="edit_approver_name"
                  value={formData.approver_name}
                  onChange={(e) => setFormData({ ...formData, approver_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_approval_level">Approval Level *</Label>
                <Input
                  id="edit_approval_level"
                  value={formData.approval_level}
                  onChange={(e) => setFormData({ ...formData, approval_level: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_approval_status">Approval Status *</Label>
                <Select
                  value={formData.approval_status}
                  onValueChange={(value) => setFormData({ ...formData, approval_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_approval_date">Approval Date</Label>
                <Input
                  id="edit_approval_date"
                  type="date"
                  value={formData.approval_date}
                  onChange={(e) => setFormData({ ...formData, approval_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_approval_document_ref">Approval Document Reference</Label>
              <Input
                id="edit_approval_document_ref"
                value={formData.approval_document_ref}
                onChange={(e) => setFormData({ ...formData, approval_document_ref: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div>
              <Label htmlFor="edit_comments">Comments</Label>
              <Textarea
                id="edit_comments"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                rows={3}
                placeholder="Optional notes or comments"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit_escalation_required"
                checked={formData.escalation_required}
                onCheckedChange={(checked) => setFormData({ ...formData, escalation_required: checked })}
              />
              <Label htmlFor="edit_escalation_required" className="text-sm font-normal cursor-pointer">
                Escalation Required
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setShowEditModal(false);
                setEditingApproval(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">Update Approval</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
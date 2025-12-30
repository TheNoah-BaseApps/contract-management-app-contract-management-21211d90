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
import { FileText, Plus, Edit, Trash2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';

export default function ContractRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  const [formData, setFormData] = useState({
    request_id: '',
    requester_name: '',
    contract_type: '',
    purpose_description: '',
    expected_start_date: '',
    expected_end_date: '',
    priority_level: 'Medium',
    budget_estimate: '',
    department_name: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      setLoading(true);
      const res = await fetch('/api/contract-requests');
      const data = await res.json();
      
      if (data.success) {
        setRequests(data.data);
        calculateStats(data.data);
      } else {
        toast.error('Failed to load contract requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Error loading contract requests');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(data) {
    const total = data.length;
    const pending = data.filter(r => r.status === 'Pending').length;
    const approved = data.filter(r => r.status === 'Approved').length;
    const rejected = data.filter(r => r.status === 'Rejected').length;
    setStats({ total, pending, approved, rejected });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/contract-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success('Contract request created successfully');
        setShowAddModal(false);
        resetForm();
        fetchRequests();
      } else {
        toast.error(data.error || 'Failed to create contract request');
      }
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Error creating contract request');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/contract-requests/${editingRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success('Contract request updated successfully');
        setShowEditModal(false);
        setEditingRequest(null);
        resetForm();
        fetchRequests();
      } else {
        toast.error(data.error || 'Failed to update contract request');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Error updating contract request');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this contract request?')) return;
    
    try {
      const res = await fetch(`/api/contract-requests/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success('Contract request deleted successfully');
        fetchRequests();
      } else {
        toast.error(data.error || 'Failed to delete contract request');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Error deleting contract request');
    }
  }

  function handleEdit(request) {
    setEditingRequest(request);
    setFormData({
      request_id: request.request_id,
      requester_name: request.requester_name,
      contract_type: request.contract_type,
      purpose_description: request.purpose_description,
      expected_start_date: request.expected_start_date?.split('T')[0] || '',
      expected_end_date: request.expected_end_date?.split('T')[0] || '',
      priority_level: request.priority_level,
      budget_estimate: request.budget_estimate || '',
      department_name: request.department_name
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      request_id: '',
      requester_name: '',
      contract_type: '',
      purpose_description: '',
      expected_start_date: '',
      expected_end_date: '',
      priority_level: 'Medium',
      budget_estimate: '',
      department_name: ''
    });
  }

  function getStatusBadge(status) {
    const variants = {
      'Pending': { icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
      'Approved': { icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      'Rejected': { icon: XCircle, className: 'bg-red-100 text-red-800' },
      'In Review': { icon: AlertCircle, className: 'bg-blue-100 text-blue-800' }
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
          <h1 className="text-2xl font-bold text-gray-900">Contract Requests</h1>
          <p className="text-sm text-gray-600 mt-1">Submit and track contract requests</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
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
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
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

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Contract Requests</CardTitle>
          <CardDescription>View and manage contract requests</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contract requests yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first contract request.</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Request ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Requester</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{request.request_id}</td>
                      <td className="py-3 px-4">{request.requester_name}</td>
                      <td className="py-3 px-4">{request.contract_type}</td>
                      <td className="py-3 px-4">{request.department_name}</td>
                      <td className="py-3 px-4">
                        <Badge variant={request.priority_level === 'High' ? 'destructive' : 'secondary'}>
                          {request.priority_level}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(request.status)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(request)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(request.id)}
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
            <DialogTitle>New Contract Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="request_id">Request ID *</Label>
                <Input
                  id="request_id"
                  value={formData.request_id}
                  onChange={(e) => setFormData({ ...formData, request_id: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="requester_name">Requester Name *</Label>
                <Input
                  id="requester_name"
                  value={formData.requester_name}
                  onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
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
                <Label htmlFor="department_name">Department *</Label>
                <Input
                  id="department_name"
                  value={formData.department_name}
                  onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="purpose_description">Purpose Description *</Label>
              <Textarea
                id="purpose_description"
                value={formData.purpose_description}
                onChange={(e) => setFormData({ ...formData, purpose_description: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expected_start_date">Expected Start Date *</Label>
                <Input
                  id="expected_start_date"
                  type="date"
                  value={formData.expected_start_date}
                  onChange={(e) => setFormData({ ...formData, expected_start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="expected_end_date">Expected End Date *</Label>
                <Input
                  id="expected_end_date"
                  type="date"
                  value={formData.expected_end_date}
                  onChange={(e) => setFormData({ ...formData, expected_end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority_level">Priority Level *</Label>
                <Select
                  value={formData.priority_level}
                  onValueChange={(value) => setFormData({ ...formData, priority_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budget_estimate">Budget Estimate</Label>
                <Input
                  id="budget_estimate"
                  value={formData.budget_estimate}
                  onChange={(e) => setFormData({ ...formData, budget_estimate: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">Create Request</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contract Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_request_id">Request ID *</Label>
                <Input
                  id="edit_request_id"
                  value={formData.request_id}
                  onChange={(e) => setFormData({ ...formData, request_id: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_requester_name">Requester Name *</Label>
                <Input
                  id="edit_requester_name"
                  value={formData.requester_name}
                  onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_contract_type">Contract Type *</Label>
                <Input
                  id="edit_contract_type"
                  value={formData.contract_type}
                  onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_department_name">Department *</Label>
                <Input
                  id="edit_department_name"
                  value={formData.department_name}
                  onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_purpose_description">Purpose Description *</Label>
              <Textarea
                id="edit_purpose_description"
                value={formData.purpose_description}
                onChange={(e) => setFormData({ ...formData, purpose_description: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_expected_start_date">Expected Start Date *</Label>
                <Input
                  id="edit_expected_start_date"
                  type="date"
                  value={formData.expected_start_date}
                  onChange={(e) => setFormData({ ...formData, expected_start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_expected_end_date">Expected End Date *</Label>
                <Input
                  id="edit_expected_end_date"
                  type="date"
                  value={formData.expected_end_date}
                  onChange={(e) => setFormData({ ...formData, expected_end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_priority_level">Priority Level *</Label>
                <Select
                  value={formData.priority_level}
                  onValueChange={(value) => setFormData({ ...formData, priority_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_budget_estimate">Budget Estimate</Label>
                <Input
                  id="edit_budget_estimate"
                  value={formData.budget_estimate}
                  onChange={(e) => setFormData({ ...formData, budget_estimate: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setShowEditModal(false);
                setEditingRequest(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">Update Request</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
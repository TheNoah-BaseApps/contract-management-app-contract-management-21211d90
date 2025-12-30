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
import { Shield, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function ContractCompliancePage() {
  const [complianceRecords, setComplianceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    compliance_id: '',
    contract_id: '',
    compliance_check_date: '',
    compliance_officer: '',
    compliance_result: 'Compliant',
    non_compliance_issues: '',
    corrective_actions: '',
    follow_up_date: '',
    audit_trail_ref: ''
  });

  useEffect(() => {
    fetchComplianceRecords();
  }, []);

  const fetchComplianceRecords = async () => {
    try {
      const res = await fetch('/api/contract-compliance');
      const data = await res.json();
      if (data.success) {
        setComplianceRecords(data.data);
      }
    } catch (error) {
      console.error('Error fetching compliance records:', error);
      toast.error('Failed to load compliance records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/contract-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Compliance record created successfully');
        setShowAddModal(false);
        resetForm();
        fetchComplianceRecords();
      } else {
        toast.error(data.error || 'Failed to create compliance record');
      }
    } catch (error) {
      console.error('Error creating compliance record:', error);
      toast.error('Failed to create compliance record');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/contract-compliance/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Compliance record updated successfully');
        setShowEditModal(false);
        resetForm();
        fetchComplianceRecords();
      } else {
        toast.error(data.error || 'Failed to update compliance record');
      }
    } catch (error) {
      console.error('Error updating compliance record:', error);
      toast.error('Failed to update compliance record');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this compliance record?')) return;
    try {
      const res = await fetch(`/api/contract-compliance/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Compliance record deleted successfully');
        fetchComplianceRecords();
      } else {
        toast.error(data.error || 'Failed to delete compliance record');
      }
    } catch (error) {
      console.error('Error deleting compliance record:', error);
      toast.error('Failed to delete compliance record');
    }
  };

  const openEditModal = (record) => {
    setSelectedRecord(record);
    setFormData({
      compliance_id: record.compliance_id,
      contract_id: record.contract_id,
      compliance_check_date: record.compliance_check_date ? new Date(record.compliance_check_date).toISOString().split('T')[0] : '',
      compliance_officer: record.compliance_officer,
      compliance_result: record.compliance_result,
      non_compliance_issues: record.non_compliance_issues || '',
      corrective_actions: record.corrective_actions || '',
      follow_up_date: record.follow_up_date ? new Date(record.follow_up_date).toISOString().split('T')[0] : '',
      audit_trail_ref: record.audit_trail_ref || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      compliance_id: '',
      contract_id: '',
      compliance_check_date: '',
      compliance_officer: '',
      compliance_result: 'Compliant',
      non_compliance_issues: '',
      corrective_actions: '',
      follow_up_date: '',
      audit_trail_ref: ''
    });
    setSelectedRecord(null);
  };

  const getStatusColor = (result) => {
    switch (result.toLowerCase()) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (result) => {
    switch (result.toLowerCase()) {
      case 'compliant': return <CheckCircle className="h-4 w-4" />;
      case 'non-compliant': return <XCircle className="h-4 w-4" />;
      case 'partial': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  // Stats
  const totalRecords = complianceRecords.length;
  const compliantRecords = complianceRecords.filter(r => r.compliance_result.toLowerCase() === 'compliant').length;
  const nonCompliantRecords = complianceRecords.filter(r => r.compliance_result.toLowerCase() === 'non-compliant').length;
  const partialRecords = complianceRecords.filter(r => r.compliance_result.toLowerCase() === 'partial').length;

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contract Compliance</h1>
          <p className="text-gray-600 mt-1">Monitor and manage contract compliance checks</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Compliance Check
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Checks</CardDescription>
            <CardTitle className="text-3xl">{totalRecords}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="h-4 w-4 mr-2" />
              All compliance checks
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Compliant</CardDescription>
            <CardTitle className="text-3xl">{compliantRecords}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Fully compliant
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Non-Compliant</CardDescription>
            <CardTitle className="text-3xl">{nonCompliantRecords}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-red-600">
              <XCircle className="h-4 w-4 mr-2" />
              Action required
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Partial</CardDescription>
            <CardTitle className="text-3xl">{partialRecords}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-yellow-600">
              <AlertCircle className="h-4 w-4 mr-2" />
              Needs attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Checks</CardTitle>
          <CardDescription>View and manage all compliance check records</CardDescription>
        </CardHeader>
        <CardContent>
          {complianceRecords.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No compliance checks yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first compliance check</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Compliance Check
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Compliance ID</TableHead>
                  <TableHead>Contract ID</TableHead>
                  <TableHead>Check Date</TableHead>
                  <TableHead>Officer</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complianceRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.compliance_id}</TableCell>
                    <TableCell>{record.contract_id}</TableCell>
                    <TableCell>{new Date(record.compliance_check_date).toLocaleDateString()}</TableCell>
                    <TableCell>{record.compliance_officer}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.compliance_result)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(record.compliance_result)}
                          {record.compliance_result}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
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
            <DialogTitle>Add Compliance Check</DialogTitle>
            <DialogDescription>Create a new contract compliance check record</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="compliance_id">Compliance ID *</Label>
                <Input
                  id="compliance_id"
                  value={formData.compliance_id}
                  onChange={(e) => setFormData({ ...formData, compliance_id: e.target.value })}
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
                <Label htmlFor="compliance_check_date">Check Date *</Label>
                <Input
                  id="compliance_check_date"
                  type="date"
                  value={formData.compliance_check_date}
                  onChange={(e) => setFormData({ ...formData, compliance_check_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="compliance_officer">Compliance Officer *</Label>
                <Input
                  id="compliance_officer"
                  value={formData.compliance_officer}
                  onChange={(e) => setFormData({ ...formData, compliance_officer: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="compliance_result">Compliance Result *</Label>
              <select
                id="compliance_result"
                className="w-full border border-gray-300 rounded-md p-2"
                value={formData.compliance_result}
                onChange={(e) => setFormData({ ...formData, compliance_result: e.target.value })}
                required
              >
                <option value="Compliant">Compliant</option>
                <option value="Non-Compliant">Non-Compliant</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
            <div>
              <Label htmlFor="non_compliance_issues">Non-Compliance Issues</Label>
              <Textarea
                id="non_compliance_issues"
                value={formData.non_compliance_issues}
                onChange={(e) => setFormData({ ...formData, non_compliance_issues: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="corrective_actions">Corrective Actions</Label>
              <Textarea
                id="corrective_actions"
                value={formData.corrective_actions}
                onChange={(e) => setFormData({ ...formData, corrective_actions: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="follow_up_date">Follow-up Date</Label>
                <Input
                  id="follow_up_date"
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="audit_trail_ref">Audit Trail Reference</Label>
                <Input
                  id="audit_trail_ref"
                  value={formData.audit_trail_ref}
                  onChange={(e) => setFormData({ ...formData, audit_trail_ref: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Create Check</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Compliance Check</DialogTitle>
            <DialogDescription>Update compliance check details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_compliance_id">Compliance ID *</Label>
                <Input
                  id="edit_compliance_id"
                  value={formData.compliance_id}
                  onChange={(e) => setFormData({ ...formData, compliance_id: e.target.value })}
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
                <Label htmlFor="edit_compliance_check_date">Check Date *</Label>
                <Input
                  id="edit_compliance_check_date"
                  type="date"
                  value={formData.compliance_check_date}
                  onChange={(e) => setFormData({ ...formData, compliance_check_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_compliance_officer">Compliance Officer *</Label>
                <Input
                  id="edit_compliance_officer"
                  value={formData.compliance_officer}
                  onChange={(e) => setFormData({ ...formData, compliance_officer: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_compliance_result">Compliance Result *</Label>
              <select
                id="edit_compliance_result"
                className="w-full border border-gray-300 rounded-md p-2"
                value={formData.compliance_result}
                onChange={(e) => setFormData({ ...formData, compliance_result: e.target.value })}
                required
              >
                <option value="Compliant">Compliant</option>
                <option value="Non-Compliant">Non-Compliant</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
            <div>
              <Label htmlFor="edit_non_compliance_issues">Non-Compliance Issues</Label>
              <Textarea
                id="edit_non_compliance_issues"
                value={formData.non_compliance_issues}
                onChange={(e) => setFormData({ ...formData, non_compliance_issues: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit_corrective_actions">Corrective Actions</Label>
              <Textarea
                id="edit_corrective_actions"
                value={formData.corrective_actions}
                onChange={(e) => setFormData({ ...formData, corrective_actions: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_follow_up_date">Follow-up Date</Label>
                <Input
                  id="edit_follow_up_date"
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_audit_trail_ref">Audit Trail Reference</Label>
                <Input
                  id="edit_audit_trail_ref"
                  value={formData.audit_trail_ref}
                  onChange={(e) => setFormData({ ...formData, audit_trail_ref: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update Check</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
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
import { ClipboardCheck, Plus, Pencil, Trash2, FileText } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ContractAuditsPage() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [formData, setFormData] = useState({
    audit_id: '',
    contract_id: '',
    auditor_name: '',
    audit_date: '',
    audit_scope: '',
    compliance_findings: '',
    discrepancies_found: '',
    corrective_actions_taken: '',
    audit_report_ref: ''
  });

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const res = await fetch('/api/contract-audits');
      const data = await res.json();
      if (data.success) {
        setAudits(data.data);
      }
    } catch (error) {
      console.error('Error fetching audits:', error);
      toast.error('Failed to load audits');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedAudit 
        ? `/api/contract-audits/${selectedAudit.id}`
        : '/api/contract-audits';
      const method = selectedAudit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(selectedAudit ? 'Audit updated successfully' : 'Audit created successfully');
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        fetchAudits();
      } else {
        toast.error(data.error || 'Failed to save audit');
      }
    } catch (error) {
      console.error('Error saving audit:', error);
      toast.error('Failed to save audit');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this audit?')) return;

    try {
      const res = await fetch(`/api/contract-audits/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Audit deleted successfully');
        fetchAudits();
      } else {
        toast.error(data.error || 'Failed to delete audit');
      }
    } catch (error) {
      console.error('Error deleting audit:', error);
      toast.error('Failed to delete audit');
    }
  };

  const handleEdit = (audit) => {
    setSelectedAudit(audit);
    setFormData({
      audit_id: audit.audit_id,
      contract_id: audit.contract_id,
      auditor_name: audit.auditor_name,
      audit_date: audit.audit_date ? audit.audit_date.split('T')[0] : '',
      audit_scope: audit.audit_scope || '',
      compliance_findings: audit.compliance_findings || '',
      discrepancies_found: audit.discrepancies_found || '',
      corrective_actions_taken: audit.corrective_actions_taken || '',
      audit_report_ref: audit.audit_report_ref || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      audit_id: '',
      contract_id: '',
      auditor_name: '',
      audit_date: '',
      audit_scope: '',
      compliance_findings: '',
      discrepancies_found: '',
      corrective_actions_taken: '',
      audit_report_ref: ''
    });
    setSelectedAudit(null);
  };

  const handleAddClick = () => {
    resetForm();
    setShowAddModal(true);
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
          <h1 className="text-2xl font-bold text-gray-900">Contract Audits</h1>
          <p className="text-gray-600 mt-1">Manage contract audit records and compliance findings</p>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Audit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{audits.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Issues</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {audits.filter(a => a.discrepancies_found).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Audits</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {audits.filter(a => {
                const auditDate = new Date(a.audit_date);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return auditDate >= thirtyDaysAgo;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Records</CardTitle>
        </CardHeader>
        <CardContent>
          {audits.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No audits</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new audit record.</p>
              <div className="mt-6">
                <Button onClick={handleAddClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Audit
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Audit ID</TableHead>
                  <TableHead>Contract ID</TableHead>
                  <TableHead>Auditor</TableHead>
                  <TableHead>Audit Date</TableHead>
                  <TableHead>Findings</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audits.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell className="font-medium">{audit.audit_id}</TableCell>
                    <TableCell>{audit.contract_id}</TableCell>
                    <TableCell>{audit.auditor_name}</TableCell>
                    <TableCell>{new Date(audit.audit_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {audit.discrepancies_found ? (
                        <span className="text-red-600">Issues Found</span>
                      ) : (
                        <span className="text-green-600">Compliant</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(audit)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(audit.id)}
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
            <DialogTitle>{selectedAudit ? 'Edit Audit' : 'Add New Audit'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="audit_id">Audit ID *</Label>
                <Input
                  id="audit_id"
                  value={formData.audit_id}
                  onChange={(e) => setFormData({ ...formData, audit_id: e.target.value })}
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
                <Label htmlFor="auditor_name">Auditor Name *</Label>
                <Input
                  id="auditor_name"
                  value={formData.auditor_name}
                  onChange={(e) => setFormData({ ...formData, auditor_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="audit_date">Audit Date *</Label>
                <Input
                  id="audit_date"
                  type="date"
                  value={formData.audit_date}
                  onChange={(e) => setFormData({ ...formData, audit_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="audit_scope">Audit Scope</Label>
              <Textarea
                id="audit_scope"
                value={formData.audit_scope}
                onChange={(e) => setFormData({ ...formData, audit_scope: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="compliance_findings">Compliance Findings</Label>
              <Textarea
                id="compliance_findings"
                value={formData.compliance_findings}
                onChange={(e) => setFormData({ ...formData, compliance_findings: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="discrepancies_found">Discrepancies Found</Label>
              <Textarea
                id="discrepancies_found"
                value={formData.discrepancies_found}
                onChange={(e) => setFormData({ ...formData, discrepancies_found: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="corrective_actions_taken">Corrective Actions Taken</Label>
              <Textarea
                id="corrective_actions_taken"
                value={formData.corrective_actions_taken}
                onChange={(e) => setFormData({ ...formData, corrective_actions_taken: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="audit_report_ref">Audit Report Reference</Label>
              <Input
                id="audit_report_ref"
                value={formData.audit_report_ref}
                onChange={(e) => setFormData({ ...formData, audit_report_ref: e.target.value })}
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
                {selectedAudit ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
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
import { Plus, Pencil, Trash2, HardDrive, Database, Archive } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ContractStoragePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    storage_id: '',
    contract_id: '',
    storage_location: '',
    storage_date: '',
    stored_by: '',
    access_permissions: '',
    document_format: '',
    backup_location: '',
    archival_policy: ''
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    try {
      const res = await fetch('/api/contract-storage');
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
      } else {
        toast.error('Failed to fetch contract storage records');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('Error loading contract storage records');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/contract-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Contract storage record created successfully');
        setShowAddModal(false);
        resetForm();
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to create record');
      }
    } catch (error) {
      console.error('Error creating record:', error);
      toast.error('Error creating contract storage record');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/contract-storage/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Contract storage record updated successfully');
        setShowEditModal(false);
        setSelectedRecord(null);
        resetForm();
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to update record');
      }
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Error updating contract storage record');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      const res = await fetch(`/api/contract-storage/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Contract storage record deleted successfully');
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Error deleting contract storage record');
    }
  }

  function openEditModal(record) {
    setSelectedRecord(record);
    setFormData({
      storage_id: record.storage_id,
      contract_id: record.contract_id,
      storage_location: record.storage_location,
      storage_date: record.storage_date?.split('T')[0] || '',
      stored_by: record.stored_by,
      access_permissions: record.access_permissions || '',
      document_format: record.document_format || '',
      backup_location: record.backup_location || '',
      archival_policy: record.archival_policy || ''
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      storage_id: '',
      contract_id: '',
      storage_location: '',
      storage_date: '',
      stored_by: '',
      access_permissions: '',
      document_format: '',
      backup_location: '',
      archival_policy: ''
    });
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
          <h1 className="text-2xl font-bold text-gray-900">Contract Storage</h1>
          <p className="text-sm text-gray-600 mt-1">Manage contract storage and archival records</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Storage Record
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Physical Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter(r => r.storage_location?.toLowerCase().includes('physical')).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Digital Storage</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter(r => r.storage_location?.toLowerCase().includes('digital') || r.storage_location?.toLowerCase().includes('cloud')).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Records</CardTitle>
          <CardDescription>A list of all contract storage records</CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12">
              <Database className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No storage records</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new storage record.</p>
              <div className="mt-6">
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Storage Record
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Storage ID</TableHead>
                  <TableHead>Contract ID</TableHead>
                  <TableHead>Storage Location</TableHead>
                  <TableHead>Storage Date</TableHead>
                  <TableHead>Stored By</TableHead>
                  <TableHead>Document Format</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.storage_id}</TableCell>
                    <TableCell>{record.contract_id}</TableCell>
                    <TableCell>{record.storage_location}</TableCell>
                    <TableCell>{new Date(record.storage_date).toLocaleDateString()}</TableCell>
                    <TableCell>{record.stored_by}</TableCell>
                    <TableCell>
                      {record.document_format ? (
                        <Badge variant="outline">{record.document_format}</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
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
            <DialogTitle>Add Storage Record</DialogTitle>
            <DialogDescription>Create a new contract storage record</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storage_id">Storage ID *</Label>
                  <Input
                    id="storage_id"
                    value={formData.storage_id}
                    onChange={(e) => setFormData({ ...formData, storage_id: e.target.value })}
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
              <div className="space-y-2">
                <Label htmlFor="storage_location">Storage Location *</Label>
                <Input
                  id="storage_location"
                  value={formData.storage_location}
                  onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storage_date">Storage Date *</Label>
                  <Input
                    id="storage_date"
                    type="date"
                    value={formData.storage_date}
                    onChange={(e) => setFormData({ ...formData, storage_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stored_by">Stored By *</Label>
                  <Input
                    id="stored_by"
                    value={formData.stored_by}
                    onChange={(e) => setFormData({ ...formData, stored_by: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="access_permissions">Access Permissions</Label>
                <Textarea
                  id="access_permissions"
                  value={formData.access_permissions}
                  onChange={(e) => setFormData({ ...formData, access_permissions: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="document_format">Document Format</Label>
                  <Input
                    id="document_format"
                    value={formData.document_format}
                    onChange={(e) => setFormData({ ...formData, document_format: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup_location">Backup Location</Label>
                  <Input
                    id="backup_location"
                    value={formData.backup_location}
                    onChange={(e) => setFormData({ ...formData, backup_location: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="archival_policy">Archival Policy</Label>
                <Textarea
                  id="archival_policy"
                  value={formData.archival_policy}
                  onChange={(e) => setFormData({ ...formData, archival_policy: e.target.value })}
                />
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
            <DialogTitle>Edit Storage Record</DialogTitle>
            <DialogDescription>Update contract storage record details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_storage_id">Storage ID *</Label>
                  <Input
                    id="edit_storage_id"
                    value={formData.storage_id}
                    onChange={(e) => setFormData({ ...formData, storage_id: e.target.value })}
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
              <div className="space-y-2">
                <Label htmlFor="edit_storage_location">Storage Location *</Label>
                <Input
                  id="edit_storage_location"
                  value={formData.storage_location}
                  onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_storage_date">Storage Date *</Label>
                  <Input
                    id="edit_storage_date"
                    type="date"
                    value={formData.storage_date}
                    onChange={(e) => setFormData({ ...formData, storage_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_stored_by">Stored By *</Label>
                  <Input
                    id="edit_stored_by"
                    value={formData.stored_by}
                    onChange={(e) => setFormData({ ...formData, stored_by: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_access_permissions">Access Permissions</Label>
                <Textarea
                  id="edit_access_permissions"
                  value={formData.access_permissions}
                  onChange={(e) => setFormData({ ...formData, access_permissions: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_document_format">Document Format</Label>
                  <Input
                    id="edit_document_format"
                    value={formData.document_format}
                    onChange={(e) => setFormData({ ...formData, document_format: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_backup_location">Backup Location</Label>
                  <Input
                    id="edit_backup_location"
                    value={formData.backup_location}
                    onChange={(e) => setFormData({ ...formData, backup_location: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_archival_policy">Archival Policy</Label>
                <Textarea
                  id="edit_archival_policy"
                  value={formData.archival_policy}
                  onChange={(e) => setFormData({ ...formData, archival_policy: e.target.value })}
                />
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
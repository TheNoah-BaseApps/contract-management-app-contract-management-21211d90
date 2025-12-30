'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DatePicker from '@/components/ui/DatePicker';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function MonitoringForm({ record, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contracts, setContracts] = useState([]);
  const [formData, setFormData] = useState({
    monitoring_id: '',
    contract_id: '',
    monitoring_date: new Date().toISOString().split('T')[0],
    compliance_status: '',
    performance_metrics: '',
    issues_identified: '',
    next_review_date: '',
    monitoring_notes: ''
  });

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/contracts?status=Active', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setContracts(data.data || []);
        }
      } catch (err) {
        console.error('Fetch contracts error:', err);
      }
    };

    fetchContracts();

    if (record) {
      setFormData({
        monitoring_id: record.monitoring_id || '',
        contract_id: record.contract_id || '',
        monitoring_date: record.monitoring_date?.split('T')[0] || '',
        compliance_status: record.compliance_status || '',
        performance_metrics: record.performance_metrics || '',
        issues_identified: record.issues_identified || '',
        next_review_date: record.next_review_date || '',
        monitoring_notes: record.monitoring_notes || ''
      });
    }
  }, [record]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = record ? `/api/contract-monitoring/${record.id}` : '/api/contract-monitoring';
      const method = record ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save monitoring record');
      }

      if (data.success) {
        toast.success(record ? 'Record updated successfully' : 'Record created successfully');
        if (onSuccess) onSuccess(data.data);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{record ? 'Edit Monitoring Record' : 'New Monitoring Record'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monitoring_id">Monitoring ID *</Label>
              <Input
                id="monitoring_id"
                value={formData.monitoring_id}
                onChange={(e) => setFormData({ ...formData, monitoring_id: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_id">Contract *</Label>
              <Select
                value={formData.contract_id}
                onValueChange={(value) => setFormData({ ...formData, contract_id: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contract" />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map((contract) => (
                    <SelectItem key={contract.id} value={contract.id}>
                      {contract.contract_number} - {contract.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monitoring_date">Monitoring Date *</Label>
              <DatePicker
                value={formData.monitoring_date}
                onChange={(date) => setFormData({ ...formData, monitoring_date: date })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="compliance_status">Compliance Status *</Label>
              <Select
                value={formData.compliance_status}
                onValueChange={(value) => setFormData({ ...formData, compliance_status: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Compliant">Compliant</SelectItem>
                  <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                  <SelectItem value="Pending Review">Pending Review</SelectItem>
                  <SelectItem value="At Risk">At Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_review_date">Next Review Date *</Label>
              <DatePicker
                value={formData.next_review_date}
                onChange={(date) => setFormData({ ...formData, next_review_date: date })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="performance_metrics">Performance Metrics</Label>
              <Textarea
                id="performance_metrics"
                rows={4}
                value={formData.performance_metrics}
                onChange={(e) => setFormData({ ...formData, performance_metrics: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="issues_identified">Issues Identified</Label>
              <Textarea
                id="issues_identified"
                rows={4}
                value={formData.issues_identified}
                onChange={(e) => setFormData({ ...formData, issues_identified: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="monitoring_notes">Monitoring Notes</Label>
              <Textarea
                id="monitoring_notes"
                rows={4}
                value={formData.monitoring_notes}
                onChange={(e) => setFormData({ ...formData, monitoring_notes: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : record ? 'Update Record' : 'Create Record'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
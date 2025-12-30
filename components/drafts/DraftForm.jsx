'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DraftForm({ draft, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contracts, setContracts] = useState([]);
  const [formData, setFormData] = useState({
    draft_id: '',
    contract_id: '',
    draft_version: '',
    terms_and_conditions: '',
    clauses_included: '',
    review_required: false,
    status: 'Draft'
  });

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/contracts', {
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

    if (draft) {
      setFormData({
        draft_id: draft.draft_id || '',
        contract_id: draft.contract_id || '',
        draft_version: draft.draft_version || '',
        terms_and_conditions: draft.terms_and_conditions || '',
        clauses_included: draft.clauses_included || '',
        review_required: draft.review_required || false,
        status: draft.status || 'Draft'
      });
    }
  }, [draft]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = draft ? `/api/contract-drafts/${draft.id}` : '/api/contract-drafts';
      const method = draft ? 'PUT' : 'POST';

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
        throw new Error(data.error || 'Failed to save draft');
      }

      if (data.success) {
        toast.success(draft ? 'Draft updated successfully' : 'Draft created successfully');
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
        <CardTitle>{draft ? 'Edit Draft' : 'New Draft'}</CardTitle>
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
              <Label htmlFor="draft_id">Draft ID *</Label>
              <Input
                id="draft_id"
                value={formData.draft_id}
                onChange={(e) => setFormData({ ...formData, draft_id: e.target.value })}
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
              <Label htmlFor="draft_version">Version *</Label>
              <Input
                id="draft_version"
                value={formData.draft_version}
                onChange={(e) => setFormData({ ...formData, draft_version: e.target.value })}
                placeholder="v1.0"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="terms_and_conditions">Terms and Conditions *</Label>
              <Textarea
                id="terms_and_conditions"
                rows={6}
                value={formData.terms_and_conditions}
                onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="clauses_included">Clauses Included</Label>
              <Textarea
                id="clauses_included"
                rows={4}
                value={formData.clauses_included}
                onChange={(e) => setFormData({ ...formData, clauses_included: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="flex items-center space-x-2 md:col-span-2">
              <Switch
                id="review_required"
                checked={formData.review_required}
                onCheckedChange={(checked) => setFormData({ ...formData, review_required: checked })}
                disabled={loading}
              />
              <Label htmlFor="review_required">Legal Review Required</Label>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : draft ? 'Update Draft' : 'Create Draft'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
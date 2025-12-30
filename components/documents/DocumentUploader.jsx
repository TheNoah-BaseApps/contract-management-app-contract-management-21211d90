'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentUploader({ contracts, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    contract_id: '',
    document_type: '',
    file: null
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!validTypes.includes(file.type)) {
        setError('Only PDF, DOCX, and XLSX files are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFormData({ ...formData, file });
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('contract_id', formData.contract_id);
      formDataToSend.append('document_type', formData.document_type);
      formDataToSend.append('file', formData.file);

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload document');
      }

      if (data.success) {
        toast.success('Document uploaded successfully');
        setFormData({ contract_id: '', document_type: '', file: null });
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
        <Label htmlFor="document_type">Document Type *</Label>
        <Select
          value={formData.document_type}
          onValueChange={(value) => setFormData({ ...formData, document_type: value })}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Contract">Contract</SelectItem>
            <SelectItem value="Amendment">Amendment</SelectItem>
            <SelectItem value="Supporting Document">Supporting Document</SelectItem>
            <SelectItem value="Certificate">Certificate</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">File (PDF, DOCX, XLSX) *</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf,.docx,.xlsx"
          onChange={handleFileChange}
          disabled={loading}
          required
        />
      </div>

      <Button type="submit" disabled={loading || !formData.file}>
        <Upload className="mr-2 h-4 w-4" />
        {loading ? 'Uploading...' : 'Upload Document'}
      </Button>
    </form>
  );
}
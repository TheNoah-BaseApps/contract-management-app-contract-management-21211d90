'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import DraftsTable from '@/components/drafts/DraftsTable';
import SearchBar from '@/components/ui/SearchBar';
import FilterPanel from '@/components/ui/FilterPanel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function DraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    reviewRequired: ''
  });

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.status) params.append('status', filters.status);
      if (filters.reviewRequired) params.append('reviewRequired', filters.reviewRequired);

      const res = await fetch(`/api/contract-drafts?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch drafts');

      const data = await res.json();
      if (data.success) {
        setDrafts(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to load drafts');
      }
    } catch (err) {
      console.error('Fetch drafts error:', err);
      setError(err.message);
      toast.error('Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [searchTerm, filters]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/contract-drafts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete draft');

      toast.success('Draft deleted successfully');
      fetchDrafts();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete draft');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contract Drafts</h1>
          <p className="text-gray-500 mt-1">Manage contract drafts and versions</p>
        </div>
        <Button onClick={() => router.push('/drafts/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Draft
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search drafts by ID, drafter, or version..."
          />
        </div>
        <div>
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            options={{
              status: ['Draft', 'Under Review', 'Approved', 'Rejected'],
              reviewRequired: ['true', 'false']
            }}
          />
        </div>
      </div>

      <DraftsTable
        drafts={drafts}
        onDelete={handleDelete}
        onView={(id) => router.push(`/drafts/${id}`)}
      />
    </div>
  );
}
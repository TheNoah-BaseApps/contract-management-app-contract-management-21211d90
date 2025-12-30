'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ContractsTable from '@/components/contracts/ContractsTable';
import SearchBar from '@/components/ui/SearchBar';
import FilterPanel from '@/components/ui/FilterPanel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    startDate: '',
    endDate: ''
  });

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await fetch(`/api/contracts?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch contracts');

      const data = await res.json();
      if (data.success) {
        setContracts(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to load contracts');
      }
    } catch (err) {
      console.error('Fetch contracts error:', err);
      setError(err.message);
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [searchTerm, filters]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete contract');

      toast.success('Contract deleted successfully');
      fetchContracts();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete contract');
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
          <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-500 mt-1">Manage and monitor all contracts</p>
        </div>
        <Button onClick={() => router.push('/contracts/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Contract
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
            placeholder="Search contracts by number, title, or counterparty..."
          />
        </div>
        <div>
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            options={{
              status: ['Draft', 'Under Review', 'Approved', 'Active', 'Expired', 'Terminated'],
              type: ['Service Agreement', 'Sales Contract', 'NDA', 'Partnership', 'Employment', 'Lease']
            }}
          />
        </div>
      </div>

      <ContractsTable
        contracts={contracts}
        onDelete={handleDelete}
        onView={(id) => router.push(`/contracts/${id}`)}
      />
    </div>
  );
}
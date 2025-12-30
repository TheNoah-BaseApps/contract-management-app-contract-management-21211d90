'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import MonitoringTable from '@/components/monitoring/MonitoringTable';
import SearchBar from '@/components/ui/SearchBar';
import FilterPanel from '@/components/ui/FilterPanel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function MonitoringPage() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    complianceStatus: '',
    startDate: '',
    endDate: ''
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.complianceStatus) params.append('complianceStatus', filters.complianceStatus);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await fetch(`/api/contract-monitoring?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch monitoring records');

      const data = await res.json();
      if (data.success) {
        setRecords(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to load monitoring records');
      }
    } catch (err) {
      console.error('Fetch monitoring error:', err);
      setError(err.message);
      toast.error('Failed to load monitoring records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [searchTerm, filters]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/contract-monitoring/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete monitoring record');

      toast.success('Monitoring record deleted successfully');
      fetchRecords();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete monitoring record');
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
          <h1 className="text-3xl font-bold text-gray-900">Contract Monitoring</h1>
          <p className="text-gray-500 mt-1">Track compliance and performance</p>
        </div>
        <Button onClick={() => router.push('/monitoring/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Monitoring Record
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
            placeholder="Search monitoring records..."
          />
        </div>
        <div>
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            options={{
              complianceStatus: ['Compliant', 'Non-Compliant', 'Pending Review', 'At Risk']
            }}
          />
        </div>
      </div>

      <MonitoringTable
        records={records}
        onDelete={handleDelete}
        onView={(id) => router.push(`/monitoring/${id}`)}
      />
    </div>
  );
}
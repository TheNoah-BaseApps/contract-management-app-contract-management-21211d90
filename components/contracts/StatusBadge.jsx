'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function StatusBadge({ status, type = 'contract' }) {
  const getVariant = () => {
    if (type === 'role') {
      const roleColors = {
        admin: 'bg-purple-100 text-purple-800',
        contract_manager: 'bg-blue-100 text-blue-800',
        legal_reviewer: 'bg-green-100 text-green-800',
        viewer: 'bg-gray-100 text-gray-800'
      };
      return roleColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      'under review': 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      expired: 'bg-red-100 text-red-800',
      terminated: 'bg-red-100 text-red-800',
      compliant: 'bg-green-100 text-green-800',
      'non-compliant': 'bg-red-100 text-red-800',
      'pending review': 'bg-yellow-100 text-yellow-800',
      'at risk': 'bg-orange-100 text-orange-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Badge className={cn('capitalize', getVariant())} variant="secondary">
      {status}
    </Badge>
  );
}
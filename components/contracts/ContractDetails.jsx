'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/contracts/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FileText, Calendar, DollarSign, Users } from 'lucide-react';

export default function ContractDetails({ contract }) {
  const details = [
    { label: 'Contract Number', value: contract.contract_number, icon: FileText },
    { label: 'Title', value: contract.title, icon: FileText },
    { label: 'Counterparty', value: contract.counterparty_name, icon: Users },
    { label: 'Type', value: contract.contract_type, icon: FileText },
    { label: 'Status', value: <StatusBadge status={contract.status} />, icon: FileText },
    { label: 'Value', value: formatCurrency(contract.value), icon: DollarSign },
    { label: 'Start Date', value: formatDate(contract.start_date), icon: Calendar },
    { label: 'End Date', value: formatDate(contract.end_date), icon: Calendar },
    { label: 'Created At', value: formatDate(contract.created_at), icon: Calendar },
    { label: 'Updated At', value: formatDate(contract.updated_at), icon: Calendar }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {details.map((detail, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <detail.icon className="h-4 w-4" />
                {detail.label}
              </div>
              <div className="font-medium">
                {detail.value || 'N/A'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
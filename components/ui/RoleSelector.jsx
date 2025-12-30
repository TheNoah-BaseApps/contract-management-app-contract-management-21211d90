'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const roles = [
  { value: 'admin', label: 'Admin', description: 'Full system access' },
  { value: 'contract_manager', label: 'Contract Manager', description: 'Create and edit contracts' },
  { value: 'legal_reviewer', label: 'Legal Reviewer', description: 'Review and approve contracts' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' }
];

export default function RoleSelector({ value, onChange, disabled = false }) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role.value} value={role.value}>
            <div>
              <div className="font-medium">{role.label}</div>
              <div className="text-xs text-gray-500">{role.description}</div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
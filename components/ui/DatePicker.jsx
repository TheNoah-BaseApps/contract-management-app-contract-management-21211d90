'use client';

import { Input } from '@/components/ui/input';

export default function DatePicker({ value, onChange, disabled = false }) {
  return (
    <Input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  );
}
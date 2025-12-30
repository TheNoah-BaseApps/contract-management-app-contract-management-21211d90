'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';

export default function FilterPanel({ filters, onChange, options }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {Object.keys(options).map((key) => (
          <div key={key}>
            <DropdownMenuLabel className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {options[key].map((option) => (
              <DropdownMenuCheckboxItem
                key={option}
                checked={filters[key] === option}
                onCheckedChange={(checked) => {
                  onChange({ ...filters, [key]: checked ? option : '' });
                }}
              >
                {option}
              </DropdownMenuCheckboxItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
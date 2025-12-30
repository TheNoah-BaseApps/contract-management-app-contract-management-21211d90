'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export default function AlertNotification({ type = 'info', title, message }) {
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle
  };

  const variants = {
    info: 'default',
    success: 'default',
    warning: 'default',
    error: 'destructive'
  };

  const Icon = icons[type];

  return (
    <Alert variant={variants[type]}>
      <Icon className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
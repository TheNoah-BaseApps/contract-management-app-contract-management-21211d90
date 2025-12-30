'use client';

import { formatDate } from '@/lib/utils';
import { FileText, Edit, Trash2, CheckCircle } from 'lucide-react';

const iconMap = {
  Create: FileText,
  Update: Edit,
  Delete: Trash2,
  Approve: CheckCircle
};

export default function RecentActivities({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent activities
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = iconMap[activity.action] || FileText;
        return (
          <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{activity.description}</div>
              <div className="text-sm text-gray-500">
                {activity.user_name} • {formatDate(activity.timestamp)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
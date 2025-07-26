import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UsersPageSimple() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  if (user.role !== 'admin') {
    return <div>Access Denied - Admin Only</div>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Users Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Users management interface</p>
          <p>Current user: {user.username} (Role: {user.role})</p>
        </CardContent>
      </Card>
    </div>
  );
} 
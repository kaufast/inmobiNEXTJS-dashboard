/**
 * Debug component to test UploadCare access
 */

import React from "react";
import { useAuth } from "@/hooks/use-auth";

export default function UploadCareTestDebug() {
  const { user, isLoading } = useAuth();
  
  console.log('[UploadCareTestDebug] Component loaded');
  console.log('[UploadCareTestDebug] Auth state:', { isLoading, user });
  
  if (isLoading) {
    return <div>Loading auth...</div>;
  }
  
  if (!user) {
    return <div>No user - please login</div>;
  }
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>UploadCare Test Debug</h1>
      <p>User: {user.email}</p>
      <p>Role: {user.role}</p>
      <p>Status: {user.role === 'agent' || user.role === 'admin' ? 'Authorized' : 'Not Authorized'}</p>
    </div>
  );
}
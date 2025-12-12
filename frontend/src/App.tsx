import React from 'react';
import { AuthProvider } from '@app/providers';
import AppRoutes from '@app/routers/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir="auto">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
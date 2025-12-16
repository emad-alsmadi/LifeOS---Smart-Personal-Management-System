import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './guards/ProtectedRoute';
import AdminRoute from './guards/AdminRoute';
import { useAuth } from '@app/providers';

import Visitor from 'pages/Visitor';
import Register from 'pages/Register';
import Login from 'pages/Login';
import Dashboard from 'pages/Dashboard/Dashboard';
import GoalsPage from 'pages/goals/GoalsPage';
import ObjectivesPage from 'pages/objectives/ObjectivesPage';
import ProjectsPage from 'pages/projects/ProjectsPage';
import TasksPage from 'pages/tasks/TasksPage';
import HabitsPage from 'pages/habits/HabitsPage';
import CalendarPage from 'pages/calendar/CalendarPage';
import NotesPage from 'pages/notes/NotesPage';
import AdminDashboard from 'pages/admin/AdminDashboard';
import DynamicLevelPage from 'pages/structures/DynamicLevelPage';
import StructureHomePage from 'pages/structures/StructureHomePage';
import StructureCalendarPage from 'pages/structures/calendar/StructureCalendarPage';
import StructureHabitsPage from 'pages/structures/habits/StructureHabitsPage';
import StructureNotesPage from 'pages/structures/notes/StructureNotesPage';
import SettingsPage from 'pages/settings/SettingsPage';
import Unauthorized from 'pages/Unauthorized';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path='/'
        element={<Visitor />}
      />
      <Route
        path='/register'
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path='/login'
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path='/goals'
        element={
          <ProtectedRoute>
            <GoalsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/objectives'
        element={
          <ProtectedRoute>
            <ObjectivesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/projects'
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/tasks'
        element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/habits'
        element={
          <ProtectedRoute>
            <HabitsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/calendar'
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/notes'
        element={
          <ProtectedRoute>
            <NotesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/settings'
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path='/admin-dashboard'
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Dynamic */}
      <Route
        path='/structures/:structureId'
        element={
          <ProtectedRoute>
            <StructureHomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/structures/:structureId/calendar'
        element={
          <ProtectedRoute>
            <StructureCalendarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/structures/:structureId/habits'
        element={
          <ProtectedRoute>
            <StructureHabitsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/structures/:structureId/notes'
        element={
          <ProtectedRoute>
            <StructureNotesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/structures/:structureId/:levelSlug'
        element={
          <ProtectedRoute>
            <DynamicLevelPage />
          </ProtectedRoute>
        }
      />

      {/* Unauthorized */}
      <Route
        path='/unauthorized'
        element={<Unauthorized />}
      />

      {/* Fallback */}
      <Route
        path='*'
        element={
          <Navigate
            to='/dashboard'
            replace
          />
        }
      />
    </Routes>
  );
}

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lightweight public route used only here; redirects if already auth
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading)
    return (
      <div className='layout-corporate flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500'></div>
      </div>
    );
  if (isAuthenticated)
    return (
      <Navigate
        to='/dashboard'
        replace
      />
    );
  return <>{children}</>;
};

export default AppRoutes;

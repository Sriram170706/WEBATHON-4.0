import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Freelancer pages
import FreelancerDashboard from './pages/FreelancerDashboard';
import Performance from './pages/Performance';
import AvailableTasks from './pages/AvailableTasks';
import FreelancerMyTasks from './pages/FreelancerMyTasks';
import TaskDetail from './pages/TaskDetail';
import AddDomain from './pages/AddDomain';

// Client pages
import ClientDashboard from './pages/ClientDashboard';
import CreateTask from './pages/CreateTask';
import ViewApplicants from './pages/ViewApplicants';
import RateTask from './pages/RateTask';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Freelancer Routes ── */}
          <Route path="/dashboard" element={
            <ProtectedRoute requireFreelancer>
              <FreelancerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/performance" element={
            <ProtectedRoute requireFreelancer>
              <Performance />
            </ProtectedRoute>
          } />
          <Route path="/tasks/individual" element={
            <ProtectedRoute requireFreelancer>
              <AvailableTasks segment="Individual" />
            </ProtectedRoute>
          } />
          <Route path="/tasks/company" element={
            <ProtectedRoute requireFreelancer>
              <AvailableTasks segment="Company" />
            </ProtectedRoute>
          } />
          <Route path="/my-tasks" element={
            <ProtectedRoute requireFreelancer>
              <FreelancerMyTasks />
            </ProtectedRoute>
          } />
          <Route path="/tasks/:id" element={
            <ProtectedRoute>
              <TaskDetail />
            </ProtectedRoute>
          } />
          <Route path="/add-domain" element={
            <ProtectedRoute requireFreelancer>
              <AddDomain />
            </ProtectedRoute>
          } />

          {/* ── Client Routes ── */}
          <Route path="/client/dashboard" element={
            <ProtectedRoute requireClient>
              <ClientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/client/create-task" element={
            <ProtectedRoute requireClient>
              <CreateTask />
            </ProtectedRoute>
          } />
          <Route path="/client/my-tasks" element={
            <ProtectedRoute requireClient>
              <ClientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/client/task/:id/applicants" element={
            <ProtectedRoute requireClient>
              <ViewApplicants />
            </ProtectedRoute>
          } />
          <Route path="/client/task/:id/rate" element={
            <ProtectedRoute requireClient>
              <RateTask />
            </ProtectedRoute>
          } />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Login from './pages/Login';
import Register from './pages/Register';

function PrivateRoute({ children }) {
  const { token } = useSelector((state) => state.auth);
  return token ? (
    <div className="min-h-screen bg-surface text-slate-100 flex flex-col relative">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto">{children}</main>
      <Chatbot />
    </div>
  ) : (
    <Navigate to="/login" replace />
  );
}

function GuestRoute({ children }) {
  const { token } = useSelector((state) => state.auth);
  return !token ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <PrivateRoute>
              <Transactions />
            </PrivateRoute>
          }
        />

        {/* Guest-only routes */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

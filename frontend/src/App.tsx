import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { FormsListPage } from './pages/FormsListPage';
import { BuilderPage } from './pages/BuilderPage';

function App() {
  return (
    <Routes>
      <Route path="/login"       element={<LoginPage />} />
      <Route path="/register"    element={<RegisterPage />} />
      <Route path="/forms"       element={<FormsListPage />} />
      <Route path="/forms/:id"   element={<BuilderPage />} />
      <Route path="/"            element={<Navigate to="/forms" replace />} />
    </Routes>
  );
}

export default App;

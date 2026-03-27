import { Routes, Route, Navigate } from 'react-router-dom';

// Pages — Claude Code will implement these using scaffold-feature skill
// import LoginPage from './pages/LoginPage';
// import BuilderPage from './pages/BuilderPage';
// import FormsListPage from './pages/FormsListPage';

function PlaceholderPage({ name }: { name: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', fontFamily: 'system-ui', fontSize: 18, color: '#676879',
    }}>
      {name} — scaffold this page using: <br/>
      <code style={{ marginLeft: 8, color: '#0073EA' }}>
        /scaffold-feature {name.toLowerCase().replace(' ', '-')}
      </code>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login"   element={<PlaceholderPage name="Login Page" />} />
      <Route path="/builder" element={<PlaceholderPage name="Form Builder" />} />
      <Route path="/forms"   element={<PlaceholderPage name="Forms List" />} />
      <Route path="/"        element={<Navigate to="/builder" replace />} />
    </Routes>
  );
}

export default App;

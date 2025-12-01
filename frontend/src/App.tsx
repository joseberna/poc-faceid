import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VideoPlayer from './pages/VideoPlayer';
import Rewards from './pages/Rewards';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/watch/:id" element={<VideoPlayer />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

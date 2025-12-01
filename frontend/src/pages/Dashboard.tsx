import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, Trophy, Gift, LogOut, User } from 'lucide-react';

interface Video {
  _id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string | null;
  duration: number;
  points: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchVideos(token);
  }, [navigate]);

  const fetchVideos = async (token: string) => {
    try {
      const response = await axios.get(import.meta.env.VITE_API_URL + '/api/videos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            FaceVerify Platform
          </h1>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-yellow-500">{user?.points || 0} pts</span>
            </div>
            
            <button
              onClick={() => navigate('/rewards')}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg transition"
            >
              <Gift className="w-5 h-5" />
              Rewards
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h2>
          <p className="text-slate-400">Watch videos and earn points to redeem rewards</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-all transform hover:scale-[1.02] cursor-pointer"
                onClick={() => navigate(`/watch/${video._id}`)}
              >
                <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    <Play className="w-16 h-16 text-slate-600" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                    <Play className="w-16 h-16 text-white" />
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{video.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{video.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{formatDuration(video.duration)}</span>
                    <div className="flex items-center gap-1 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-1">
                      <Trophy className="w-4 h-4 text-green-500" />
                      <span className="font-bold text-green-500">{video.points}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && videos.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No videos available at the moment</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Gift, Trophy, ArrowLeft, Loader2, Check } from 'lucide-react';

interface Reward {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  cost: number;
  active: boolean;
}

const Rewards = () => {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchRewards(token);
  }, [navigate]);

  const fetchRewards = async (token: string) => {
    try {
      const response = await axios.get('http://localhost:3000/api/rewards', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRewards(response.data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId: string, cost: number) => {
    if (user.points < cost) {
      alert('Insufficient points!');
      return;
    }

    if (!confirm('Are you sure you want to redeem this reward?')) {
      return;
    }

    setRedeeming(rewardId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/rewards/${rewardId}/redeem`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(response.data.message);
      
      // Update user points
      const updatedUser = { ...user, points: response.data.remainingPoints };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error: any) {
      console.error('Error redeeming reward:', error);
      alert(error.response?.data?.error || 'Error redeeming reward');
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-yellow-500">{user?.points || 0} pts</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Gift className="w-8 h-8 text-purple-500" />
            Rewards Catalog
          </h2>
          <p className="text-slate-400">Redeem your points for amazing rewards</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => {
              const canAfford = user && user.points >= reward.cost;
              const isRedeeming = redeeming === reward.id;

              return (
                <div
                  key={reward.id}
                  className={`bg-slate-800/50 rounded-xl overflow-hidden border transition-all ${
                    canAfford ? 'border-slate-700 hover:border-purple-500' : 'border-slate-800 opacity-60'
                  }`}
                >
                  <div className="aspect-square bg-slate-900 flex items-center justify-center relative overflow-hidden">
                    {reward.imageUrl ? (
                      <img src={reward.imageUrl} alt={reward.name} className="w-full h-full object-cover" />
                    ) : (
                      <Gift className="w-24 h-24 text-slate-700" />
                    )}
                    {!canAfford && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Locked</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{reward.name}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{reward.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-1">
                        <Trophy className="w-4 h-4 text-purple-500" />
                        <span className="font-bold text-purple-500">{reward.cost} pts</span>
                      </div>
                      
                      <button
                        onClick={() => handleRedeem(reward.id, reward.cost)}
                        disabled={!canAfford || isRedeeming}
                        className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                          canAfford
                            ? 'bg-purple-600 hover:bg-purple-500 text-white'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isRedeeming ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Redeem
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && rewards.length === 0 && (
          <div className="text-center py-20">
            <Gift className="w-16 h-16 mx-auto text-slate-700 mb-4" />
            <p className="text-slate-400 text-lg">No rewards available at the moment</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Rewards;

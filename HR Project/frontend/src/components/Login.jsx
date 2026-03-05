import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const API_BASE = '/api';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('hr');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            formData.append('role', role);

            const res = await axios.post(`${API_BASE}/login`, formData);
            if (res.data.user) {
                toast.success('Welcome back!');
                localStorage.setItem('user', JSON.stringify(res.data.user));
                if (res.data.user.role === 'hr') {
                    navigate(`/hr_dashboard/${res.data.user.id}`);
                } else {
                    navigate(`/candidate_dashboard/${res.data.user.id}`);
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a1c29] via-[#2d213f] to-[#1a1c29]">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-screen filter blur-[100px]"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                        className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl mb-5 shadow-lg shadow-pink-500/30"
                    >
                        <Briefcase className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Peramatrix</h1>
                    <p className="text-gray-300 mt-2 font-medium">Enterprise HR Platform</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all outline-none placeholder-gray-400"
                            placeholder="Enter your username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all outline-none placeholder-gray-400"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-3">Role</label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`cursor-pointer border rounded-xl p-3 text-center transition-all ${role === 'hr' ? 'bg-pink-500/20 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'bg-white/5 border-white/10 hover:border-pink-400/50 hover:bg-white/10'}`}>
                                <input type="radio" name="role" value="hr" className="sr-only" checked={role === 'hr'} onChange={() => setRole('hr')} />
                                <span className={`font-medium ${role === 'hr' ? 'text-pink-300' : 'text-gray-300'}`}>HR Manager</span>
                            </label>
                            <label className={`cursor-pointer border rounded-xl p-3 text-center transition-all ${role === 'candidate' ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-white/5 border-white/10 hover:border-blue-400/50 hover:bg-white/10'}`}>
                                <input type="radio" name="role" value="candidate" className="sr-only" checked={role === 'candidate'} onChange={() => setRole('candidate')} />
                                <span className={`font-medium ${role === 'candidate' ? 'text-blue-300' : 'text-gray-300'}`}>Candidate</span>
                            </label>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-4 mt-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : 'Access Portal'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}

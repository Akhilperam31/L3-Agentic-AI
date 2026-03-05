import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, Building, MapPin, ChevronRight, FileText, CheckCircle, XCircle, Clock, Download, ArrowRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const API_BASE = '/api';

export default function CandidateDashboard() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState({ user: null, jobs: [], applications: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        try {
            const res = await axios.get(`${API_BASE}/candidate_dashboard/${userId}`);
            setData(res.data);
        } catch (error) {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
        toast.success("Successfully logged out");
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
            />
        </div>
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen font-sans text-slate-800 pb-12">
            <header className="bg-white px-8 py-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Briefcase className="w-6 h-6 text-blue-500" />
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Peramatrix <span className="text-gray-400 text-sm font-medium">| Careers</span></h1>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {data.user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="text-slate-600 text-sm font-medium hidden sm:block">Welcome, <span className="text-slate-800 font-bold">{data.user?.username}</span></span>
                    </div>
                    <button onClick={handleLogout} className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">Logout</button>
                </div>
            </header>

            <motion.main
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-6xl"
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Column - Applications Tracking */}
                    <div className="lg:col-span-5 space-y-6">
                        <motion.h2 variants={itemVariants} className="text-xl font-extrabold text-slate-800 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-indigo-500" /> My Applications
                        </motion.h2>

                        <div className="space-y-4">
                            <AnimatePresence>
                                {data.applications.length === 0 ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100">
                                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Briefcase className="w-8 h-8 text-indigo-300" />
                                        </div>
                                        <h3 className="text-slate-800 font-bold mb-2">No active applications</h3>
                                        <p className="text-slate-500 text-sm">Explore our open roles and find your next opportunity.</p>
                                    </motion.div>
                                ) : (
                                    data.applications.map(app => (
                                        <motion.div variants={itemVariants} key={app.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                                            {/* Decorative Top Border */}
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                                            <div className="flex justify-between items-start mb-5 pb-5 border-b border-slate-50">
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-lg mb-1.5">{app.job_title}</h3>
                                                    <p className="text-xs font-semibold text-slate-500 flex items-center tracking-wide uppercase">
                                                        <Building className="w-3.5 h-3.5 mr-1" /> Peramatrix
                                                    </p>
                                                </div>
                                                <div className="p-2 bg-slate-50 rounded-lg">
                                                    <Briefcase className="w-5 h-5 text-indigo-400" />
                                                </div>
                                            </div>

                                            {/* Application Pipeline Timeline */}
                                            <div className="grid grid-cols-2 gap-4 relative">
                                                <div className="absolute top-1/2 left-[20%] right-[20%] h-[2px] bg-slate-100 -z-10 translate-y-[-10px]"></div>
                                                <div className="absolute top-1/2 left-[20%] right-[20%] h-[2px] bg-indigo-100 -z-10 translate-y-[-10px] w-1/2"></div>

                                                <div className="text-center bg-white">
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Screening</p>
                                                    <div className="flex justify-center mb-2">
                                                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-white shadow-sm ring-4 ring-white ${app.status === 'Shortlisted' ? 'bg-emerald-500' : app.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                                                            {app.status === 'Shortlisted' ? <CheckCircle className="w-3 h-3" /> : app.status === 'Rejected' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                        </span>
                                                    </div>
                                                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${app.status === 'Shortlisted' ? 'bg-emerald-50 text-emerald-700' : app.status === 'Rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                                                        {app.status}
                                                    </span>
                                                </div>

                                                <div className="text-center bg-white">
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Final Stage</p>
                                                    <div className="flex justify-center mb-2">
                                                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-white shadow-sm ring-4 ring-white ${app.interview_status === 'Selected' ? 'bg-blue-500' : app.interview_status === 'Rejected' ? 'bg-slate-400' : app.interview_status === 'Pending' ? 'bg-amber-500' : 'bg-slate-200'}`}>
                                                            {app.interview_status === 'Selected' ? <CheckCircle className="w-3 h-3" /> : app.interview_status === 'Rejected' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                        </span>
                                                    </div>
                                                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${app.interview_status === 'Selected' ? 'bg-blue-50 text-blue-700' : app.interview_status === 'Rejected' ? 'bg-slate-100 text-slate-600' : app.interview_status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {app.interview_status || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>

                                            {app.interview_status === 'Selected' && app.offer_letter_path && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 pt-4 border-t border-slate-50">
                                                    <a href={`/api/download/${app.offer_letter_path}`} target="_blank" rel="noreferrer" className="flex w-full justify-center items-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5">
                                                        <Download className="w-4 h-4 mr-2" /> Download Offer Letter
                                                    </a>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Column - Open Roles Board */}
                    <div className="lg:col-span-7 space-y-6 lg:pl-4">
                        <motion.h2 variants={itemVariants} className="text-xl font-extrabold text-slate-800 flex items-center">
                            <Briefcase className="w-5 h-5 mr-2 text-pink-500" /> Open Opportunities
                        </motion.h2>

                        <div className="space-y-4">
                            <AnimatePresence>
                                {data.jobs
                                    .filter(job => !data.applications.some(app => app.job_id === job.id))
                                    .map((job, index) => (
                                        <motion.div variants={itemVariants} key={job.id}>
                                            <Link to={`/apply/${job.id}`} className="block group outline-none">
                                                <div className="bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-slate-100 group-hover:border-blue-200 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-focus-visible:ring-2 ring-blue-500 transition-all duration-300 transform group-hover:-translate-y-1 relative overflow-hidden">

                                                    {/* Card Background Decoration */}
                                                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-blue-50 to-pink-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out z-0"></div>

                                                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className="inline-flex px-2.5 py-1 rounded bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">Engineering</span>
                                                                <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">Posted recently</span>
                                                            </div>
                                                            <h3 className="font-extrabold text-slate-800 text-xl group-hover:text-blue-600 transition-colors mb-3 leading-tight">
                                                                {job.title}
                                                            </h3>

                                                            <div className="flex flex-wrap items-center text-sm text-slate-500 gap-4 mb-4">
                                                                <span className="flex items-center font-medium bg-slate-50 px-2.5 py-1 rounded-md">
                                                                    <Building className="w-4 h-4 mr-1.5 text-slate-400" /> Core Tech
                                                                </span>
                                                                <span className="flex items-center font-medium bg-slate-50 px-2.5 py-1 rounded-md">
                                                                    <MapPin className="w-4 h-4 mr-1.5 text-slate-400" /> Remote
                                                                </span>
                                                            </div>

                                                            <div>
                                                                <a
                                                                    href={`/api/download/${job.file_path}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center text-[11px] font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <FileText className="w-3.5 h-3.5 mr-1" /> PDF Description
                                                                </a>
                                                            </div>
                                                        </div>

                                                        {/* Apply Button visual cue */}
                                                        <div className="shrink-0 flex items-center sm:justify-center w-full sm:w-auto mt-2 sm:mt-0">
                                                            <div className="flex items-center justify-center w-full sm:w-12 sm:h-12 rounded-xl bg-slate-50 group-hover:bg-blue-600 text-slate-400 group-hover:text-white transition-all duration-300 py-3 sm:py-0 font-bold text-sm sm:text-base">
                                                                <span className="sm:hidden mr-2 group-hover:text-white text-slate-600">Apply Now</span>
                                                                <ArrowRight className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                {data.jobs.length === 0 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                                        <Building className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                                        <p className="text-slate-500 font-medium">We're not hiring for any roles right now.</p>
                                        <p className="text-sm text-slate-400 mt-1">Check back later for exciting opportunities!</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.main>
        </div>
    );
}

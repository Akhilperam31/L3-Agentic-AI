import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, Upload, FileText, Download, Users, PlayCircle, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const API_BASE = '/api';

export default function HRDashboard() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState({ jobs: [], applications: [] });
    const [loading, setLoading] = useState(true);

    // New Job Form State
    const [jobTitle, setJobTitle] = useState('');
    const [jobFile, setJobFile] = useState(null);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, [userId]);

    const fetchDashboardData = async () => {
        try {
            const res = await axios.get(`${API_BASE}/hr_dashboard/${userId}`);
            setData(res.data);
        } catch (error) {
            toast.error("Failed to fetch dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
        toast.success("Logged out successfully");
    };

    const handlePostJob = async (e) => {
        e.preventDefault();
        if (!jobFile) return;
        setPosting(true);
        const toastId = toast.loading('Posting new job...');

        try {
            const formData = new FormData();
            formData.append('user_id', userId);
            formData.append('title', jobTitle);
            formData.append('file', jobFile);

            await axios.post(`${API_BASE}/upload_jd/${userId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setJobTitle('');
            setJobFile(null);
            await fetchDashboardData();
            toast.success('Job posted successfully!', { id: toastId });
        } catch (error) {
            toast.error("Error posting job.", { id: toastId });
        } finally {
            setPosting(false);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job and all its applications?')) return;
        const toastId = toast.loading('Deleting job...');
        try {
            await axios.delete(`${API_BASE}/delete_job/${jobId}`);
            await fetchDashboardData();
            toast.success('Job deleted', { id: toastId });
        } catch (error) {
            toast.error("Error deleting job.", { id: toastId });
        }
    };

    const handleEvaluate = async (appId) => {
        const toastId = toast.loading('Evaluating candidate...');
        try {
            await axios.post(`${API_BASE}/evaluate/${appId}`);
            await fetchDashboardData();
            toast.success('Evaluation complete!', { id: toastId });
        } catch (error) {
            toast.error("Error evaluating candidate.", { id: toastId });
        }
    };

    const handleSelect = async (e, appId) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const decision = formData.get('decision');
        if (decision === 'Select') return;

        const toastId = toast.loading('Processing decision...');
        try {
            await axios.post(`${API_BASE}/select_candidate/${appId}`, formData);
            await fetchDashboardData();
            toast.success('Decision recorded', { id: toastId });
        } catch (error) {
            toast.error("Error processing selection.", { id: toastId });
        }
    };

    const handleDeleteApp = async (appId) => {
        if (!window.confirm('Are you sure you want to delete this application?')) return;
        const toastId = toast.loading('Removing application...');
        try {
            await axios.delete(`${API_BASE}/delete_application/${appId}`);
            await fetchDashboardData();
            toast.success('Application removed', { id: toastId });
        } catch (error) {
            toast.error('Error deleting application', { id: toastId });
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full"
            />
        </div>
    );

    const selectedCount = data.applications.filter(app => app.is_selected === 1).length;

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
                    <div className="p-2 bg-pink-50 rounded-lg">
                        <Briefcase className="w-6 h-6 text-pink-500" />
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Peramatrix <span className="text-gray-400 text-sm font-medium">| Enterprise HR</span></h1>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            HR
                        </div>
                        <span className="text-slate-600 text-sm font-medium hidden sm:block">Welcome, Admin</span>
                    </div>
                    <button onClick={handleLogout} className="text-sm font-semibold text-slate-500 hover:text-pink-600 transition-colors">Logout</button>
                </div>
            </header>

            <motion.main
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-7xl"
            >
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Active Jobs</h3>
                        <p className="text-4xl font-extrabold text-slate-800 mt-2">{data.jobs.length}</p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Applications</h3>
                        <p className="text-4xl font-extrabold text-slate-800 mt-2">{data.applications.length}</p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Hired Candidates</h3>
                        <p className="text-4xl font-extrabold text-slate-800 mt-2">{selectedCount}</p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left Column: Jobs */}
                    <motion.div variants={itemVariants} className="xl:col-span-1 space-y-8">
                        {/* Post Job Card */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center">
                                <div className="p-2 border border-slate-100 rounded-lg shadow-sm mr-3">
                                    <Upload className="w-5 h-5 text-indigo-500" />
                                </div>
                                Post New Job
                            </h2>
                            <form onSubmit={handlePostJob} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Title</label>
                                    <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none" placeholder="e.g. Senior Frontend Engineer" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Description</label>
                                    <div className="relative">
                                        <input type="file" onChange={e => setJobFile(e.target.files[0])} required className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:transition-colors file:cursor-pointer border border-slate-200 rounded-xl bg-slate-50" accept=".pdf,.docx" />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Upload PDF or DOCX format</p>
                                </div>
                                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={posting} className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-60 flex justify-center items-center">
                                    {posting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Publish Job'}
                                </motion.button>
                            </form>
                        </div>

                        {/* Posted Jobs List */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center justify-between">
                                <span>Active Listings</span>
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">{data.jobs.length}</span>
                            </h2>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                <AnimatePresence>
                                    {data.jobs.map(job => (
                                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={job.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center group hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all">
                                            <div>
                                                <h4 className="font-semibold text-slate-800">{job.title}</h4>
                                                <div className="flex items-center space-x-4 mt-2">
                                                    <a href={`${API_BASE}/download/${job.file_path}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                                                        <FileText className="w-3.5 h-3.5 mr-1" /> View JD
                                                    </a>
                                                    <button onClick={() => handleDeleteJob(job.id)} className="text-xs text-slate-400 hover:text-red-500 font-medium flex items-center transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold ring-4 ring-white">
                                                #{job.id}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {data.jobs.length === 0 && (
                                    <div className="text-center py-8 text-slate-400">
                                        <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm font-medium">No active listings</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Applications Data Table */}
                    <motion.div variants={itemVariants} className="xl:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                                    <div className="p-2 border border-slate-100 rounded-lg shadow-sm mr-3">
                                        <Users className="w-5 h-5 text-pink-500" />
                                    </div>
                                    Applicant Tracking
                                </h2>
                                <div className="text-sm text-slate-500 font-medium">
                                    Displaying {data.applications.length} candidates
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                            <th className="px-6 py-4">Candidate Profile</th>
                                            <th className="px-6 py-4">Job Role</th>
                                            <th className="px-6 py-4">Status & Stage</th>
                                            <th className="px-6 py-4 text-center">AI Score</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <AnimatePresence>
                                            {data.applications.map(app => (
                                                <motion.tr
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0, backgroundColor: "#fee2e2" }}
                                                    key={app.id}
                                                    className="hover:bg-slate-50/50 transition-colors group"
                                                >
                                                    <td className="px-6 py-5 align-top">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold mr-3 shadow-inner">
                                                                {app.candidate_name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-800">{app.candidate_name}</div>
                                                                <div className="text-xs text-slate-500 mt-0.5">{app.email}</div>
                                                                <a href={`${API_BASE}/download/${app.resume_path}`} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-pink-500 hover:text-pink-600 inline-flex items-center mt-2 bg-pink-50 px-2 py-0.5 rounded-md transition-colors">
                                                                    <FileText className="w-3 h-3 mr-1" /> View CV
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 align-top">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                                                            {app.job_title}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 align-top space-y-2">
                                                        {/* Resume Status */}
                                                        <div>
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${app.status === 'Applied' ? 'bg-amber-100 text-amber-700' : app.status === 'Shortlisted' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                                Screening: {app.status}
                                                            </span>
                                                        </div>
                                                        {/* Interview Status */}
                                                        {app.status !== 'Applied' && (
                                                            <div>
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${app.interview_status === 'Selected' ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-500/20 ring-offset-1' : app.interview_status === 'Rejected' ? 'bg-slate-100 text-slate-600' : app.interview_status === 'Pending' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                                                    Stage: {app.interview_status || 'Pending'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5 align-top text-center">
                                                        {app.score > 0 ? (
                                                            <div className="inline-flex flex-col items-center">
                                                                <span className={`text-xl font-black ${app.score >= 80 ? 'text-emerald-500' : app.score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                                    {app.score}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">/ 100</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300 font-medium">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5 align-top text-right">
                                                        <div className="flex flex-col items-end gap-2">
                                                            {app.status === 'Applied' && (
                                                                <button onClick={() => handleEvaluate(app.id)} className="w-full sm:w-auto text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 flex items-center justify-center px-4 py-2 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-slate-500/50">
                                                                    <PlayCircle className="w-3.5 h-3.5 mr-1.5" /> Run AI Eval
                                                                </button>
                                                            )}
                                                            {app.status === 'Shortlisted' && (app.interview_status === 'Pending' || !app.interview_status) && (
                                                                <form onSubmit={(e) => handleSelect(e, app.id)} className="bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-sm w-[160px]">
                                                                    <select name="decision" className="w-full text-xs border-slate-300 rounded-lg mb-2 focus:ring-pink-500 focus:border-pink-500 bg-white" required>
                                                                        <option value="Select">- Decision -</option>
                                                                        <option value="Selected">Hire Candidate</option>
                                                                        <option value="Rejected">Reject</option>
                                                                    </select>
                                                                    <input type="text" name="ctc" placeholder="CTC (e.g. 25 LPA)" className="w-full text-xs border-slate-300 rounded-lg py-1.5 px-2 mb-2 focus:ring-pink-500 focus:border-pink-500 bg-white" />
                                                                    <button type="submit" className="w-full text-xs bg-pink-500 hover:bg-pink-600 text-white font-bold px-2 py-1.5 rounded-lg transition-colors">Confirm</button>
                                                                </form>
                                                            )}
                                                            {app.interview_status === 'Selected' && app.offer_letter_path && (
                                                                <a href={`${API_BASE}/download/${app.offer_letter_path}`} target="_blank" rel="noreferrer" className="w-full sm:w-auto text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 flex items-center justify-center px-4 py-2 rounded-lg transition-colors">
                                                                    <Download className="w-3.5 h-3.5 mr-1.5" /> Offer PDF
                                                                </a>
                                                            )}

                                                            <div className="mt-2 text-right">
                                                                <button onClick={() => handleDeleteApp(app.id)} className="text-[11px] font-semibold text-slate-400 hover:text-red-500 flex items-center transition-colors ml-auto opacity-0 group-hover:opacity-100">
                                                                    <Trash2 className="w-3 h-3 mr-1" /> Remove Record
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>

                                        {data.applications.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                    <p className="text-sm font-medium">No candidate applications currently match</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.main>
        </div>
    );
}

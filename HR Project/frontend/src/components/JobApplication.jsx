import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, ArrowLeft, Send, FileCheck, Upload, CloudLightning, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const API_BASE = '/api';

export default function JobApplication() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [resume, setResume] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Auto-fill mock email if user object has username, but allow them to change it
    useEffect(() => {
        if (user.username && !email) {
            setEmail(`${user.username}@example.com`);
        }
    }, [user.username]);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await axios.get(`${API_BASE}/jobs/${jobId}`);
                setJob(res.data);
            } catch (err) {
                toast.error('Job not found or no longer available');
                navigate('/');
            }
        };
        fetchJob();
    }, [jobId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!resume) {
            toast.error("Please upload your resume.");
            return;
        }
        if (!fullName.trim()) {
            toast.error("Please enter your full name.");
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            toast.error("Please enter a valid email address.");
            return;
        }

        setSubmitting(true);
        const loadingToast = toast.loading("Submitting your application...");

        try {
            const formData = new FormData();
            formData.append('user_id', user.id);
            formData.append('full_name', fullName);
            formData.append('email', email);
            formData.append('resume', resume);

            await axios.post(`${API_BASE}/apply/${jobId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success("Application submitted successfully!", { id: loadingToast });
            navigate(`/candidate_dashboard/${user.id}`);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to submit application. Please try again.', { id: loadingToast });
            setSubmitting(false);
        }
    };

    // Drag and Drop handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (validTypes.includes(file.type) || file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
                if (file.size <= 5 * 1024 * 1024) { // 5MB limit
                    setResume(file);
                } else {
                    toast.error("File size exceeds 5MB limit.");
                }
            } else {
                toast.error("Invalid file type. Please upload a PDF or DOC/DOCX.");
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size <= 5 * 1024 * 1024) {
                setResume(file);
            } else {
                toast.error("File size exceeds 5MB limit.");
            }
        }
    };

    if (!job) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
            />
        </div>
    );

    const pageVariants = {
        initial: { opacity: 0, scale: 0.98 },
        in: { opacity: 1, scale: 1 },
        out: { opacity: 0, scale: 1.02 }
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen text-slate-800 font-sans pb-16">
            <header className="bg-white px-4 sm:px-6 py-4 shadow-sm border-b border-slate-100 z-50">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <button onClick={() => navigate(-1)} className="mr-4 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="hidden sm:flex items-center">
                            <Briefcase className="w-5 h-5 text-blue-500 mr-2" />
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Peramatrix <span className="text-gray-400 text-sm font-medium">| Careers</span></h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
                <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="grid lg:grid-cols-12 gap-8 lg:gap-12"
                >
                    {/* Job Details Section */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                            {/* Decorative element */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full opacity-60"></div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                className="inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-600 rounded-full text-sm font-bold tracking-wide uppercase mb-6 shadow-sm shadow-blue-500/5 border border-blue-100/50"
                            >
                                <CloudLightning className="w-4 h-4 mr-2" fill="currentColor" /> Hiring Now
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-6 leading-tight"
                            >
                                {job.title}
                            </motion.h1>

                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                                className="prose prose-slate prose-blue max-w-none text-slate-600 whitespace-pre-wrap mt-8"
                            >
                                {job.description}
                            </motion.div>
                        </div>
                    </div>

                    {/* Application Form Section */}
                    <div className="lg:col-span-5 xl:col-span-4">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                            className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 lg:sticky lg:top-8"
                        >
                            <h2 className="text-xl font-extrabold text-slate-800 mb-8 flex items-center border-b border-slate-100 pb-4">
                                <FileCheck className="w-5 h-5 mr-3 text-indigo-500" /> Apply for this role
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Legal Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        placeholder="e.g. Jane Doe"
                                        className="w-full px-5 py-3.5 bg-slate-50 font-medium text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all outline-none shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="jane.doe@example.com"
                                        className="w-full px-5 py-3.5 bg-slate-50 font-medium text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all outline-none shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Resume / CV Document</label>

                                    {/* Drag and Drop Zone */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        className={`mt-1 flex flex-col justify-center items-center px-6 py-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${isDragging
                                            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]'
                                            : resume
                                                ? 'border-emerald-300 bg-emerald-50'
                                                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                                            }`}
                                    >
                                        <AnimatePresence mode="wait">
                                            {resume ? (
                                                <motion.div
                                                    key="has-file"
                                                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                                                    className="space-y-3 text-center w-full"
                                                >
                                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                                                        <CheckCircle className="h-6 w-6 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800 truncate px-4">{resume.name}</p>
                                                        <p className="text-xs text-emerald-600 font-medium mt-1">Ready to submit! Click to change.</p>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="no-file"
                                                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                                                    className="space-y-4 text-center pointer-events-none"
                                                >
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-white shadow-sm transition-colors border border-slate-100">
                                                        <Upload className={`h-8 w-8 transition-colors ${isDragging ? 'text-indigo-500' : 'text-slate-400'}`} />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-indigo-600 block mb-1">Upload a file or drag and drop</span>
                                                        <span className="text-xs text-slate-500 font-medium">PDF, DOC, DOCX up to 5MB</span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full mt-8 py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black rounded-xl shadow-[0_8px_20px_rgba(79,70,229,0.25)] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                >
                                    {submitting ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-lg">
                                            Submit Application <Send className="w-5 h-5 ml-2" />
                                        </span>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

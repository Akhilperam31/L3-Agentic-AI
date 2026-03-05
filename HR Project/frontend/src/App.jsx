import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import HRDashboard from './components/HRDashboard';
import CandidateDashboard from './components/CandidateDashboard';
import JobApplication from './components/JobApplication';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
                <Toaster position="top-right" toastOptions={{
                    duration: 3000,
                    style: { background: '#333', color: '#fff', padding: '16px', borderRadius: '8px' }
                }} />
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/hr_dashboard/:userId" element={<HRDashboard />} />
                    <Route path="/candidate_dashboard/:userId" element={<CandidateDashboard />} />
                    <Route path="/apply/:jobId" element={<JobApplication />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;

import React, { useEffect, useState } from 'react';
import { getIngestionJobs, getDataSources } from '../api';
import { FileUp, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import UploadModal from './UploadModal';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [dataSources, setDataSources] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [jobsRes, sourcesRes] = await Promise.all([
        getIngestionJobs(),
        getDataSources()
      ]);
      setJobs(jobsRes.data);
      setDataSources(sourcesRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="text-emerald-500" size={18} />;
      case 'FAILED': return <XCircle className="text-red-500" size={18} />;
      case 'PROCESSING': return <Clock className="text-blue-500" size={18} />;
      default: return <AlertTriangle className="text-amber-500" size={18} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED': return 'badge-success';
      case 'FAILED': return 'badge-danger';
      case 'PROCESSING': return 'badge-info';
      default: return 'badge-pending';
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>ESG Data Ingestion</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Overview of recent data uploads and integrations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <FileUp size={18} /> Upload Data
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2>Recent Jobs</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Source</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td>#{job.id}</td>
                  <td>{job.data_source_name}</td>
                  <td><span className="badge badge-info">{job.source_type}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getStatusIcon(job.status)}
                      <span className={`badge ${getStatusBadge(job.status)}`}>{job.status}</span>
                    </div>
                  </td>
                  <td>{new Date(job.started_at).toLocaleString()}</td>
                  <td>{job.summary_notes || '-'}</td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No ingestion jobs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <UploadModal 
          onClose={() => setIsModalOpen(false)} 
          dataSources={dataSources} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

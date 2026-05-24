import React, { useState } from 'react';
import { uploadData } from '../api';
import { X, UploadCloud } from 'lucide-react';

export default function UploadModal({ onClose, dataSources, onSuccess }) {
  const [sourceId, setSourceId] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sourceId || !file) {
      setError("Please select a data source and file.");
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    try {
      await uploadData(sourceId, file);
      onSuccess();
    } catch (err) {
      setError("Upload failed. " + (err.response?.data?.error || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Upload Data</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        
        {error && <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Data Source</label>
            <select 
              className="form-select" 
              value={sourceId} 
              onChange={(e) => setSourceId(e.target.value)}
            >
              <option value="">Select a source...</option>
              {dataSources.map(ds => (
                <option key={ds.id} value={ds.id}>{ds.name} ({ds.source_type})</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">File</label>
            <input 
              type="file" 
              className="form-input" 
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn" onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isUploading}>
              <UploadCloud size={18} /> {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

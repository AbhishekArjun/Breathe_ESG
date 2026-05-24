import React, { useEffect, useState } from 'react';
import { getRecords, approveRecord, rejectRecord } from '../api';
import { Check, X, Search, FileText } from 'lucide-react';

export default function DataReview() {
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState('PENDING_REVIEW');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const fetchRecords = async () => {
    try {
      const res = await getRecords();
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveRecord(id, 'Analyst1');
      fetchRecords();
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectRecord(id, 'Analyst1', rejectNotes);
      fetchRecords();
      setRejectNotes('');
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRecords = records.filter(r => filter === 'ALL' || r.status === filter);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED': return 'badge-success';
      case 'REJECTED': return 'badge-danger';
      case 'SUSPICIOUS': return 'badge-warning';
      default: return 'badge-pending';
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Data Review</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review and approve normalized emissions data before audit.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select className="form-select" style={{ width: 'auto' }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="ALL">All Records</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="SUSPICIOUS">Suspicious</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div className="glass-card" style={{ flex: selectedRecord ? '2' : '1' }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Source</th>
                  <th>Scope</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Qty / Unit</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(record => (
                  <tr key={record.id} style={{ cursor: 'pointer', background: selectedRecord?.id === record.id ? 'rgba(255,255,255,0.05)' : '' }} onClick={() => setSelectedRecord(record)}>
                    <td>#{record.id}</td>
                    <td><span className="badge badge-info">{record.source_type}</span></td>
                    <td>Scope {record.scope}</td>
                    <td>{record.emission_category}</td>
                    <td>{record.activity_date}</td>
                    <td>{record.normalized_quantity} {record.normalized_unit}</td>
                    <td><span className={`badge ${getStatusBadge(record.status)}`}>{record.status}</span></td>
                    <td>
                      <button className="btn" style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-secondary)' }}>
                        <Search size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No records found for the selected filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedRecord && (
          <div className="glass-card" style={{ flex: '1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Record Details</h3>
              <button onClick={() => setSelectedRecord(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p className="form-label">Normalized Output</p>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                <p><strong>Category:</strong> {selectedRecord.emission_category}</p>
                <p><strong>Scope:</strong> {selectedRecord.scope}</p>
                <p><strong>Date:</strong> {selectedRecord.activity_date}</p>
                <p><strong>Quantity:</strong> {selectedRecord.normalized_quantity} {selectedRecord.normalized_unit}</p>
                {selectedRecord.audit_notes && (
                  <p style={{ color: 'var(--warning)', marginTop: '0.5rem' }}><strong>System Flags:</strong> {selectedRecord.audit_notes}</p>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p className="form-label">Raw Source Data</p>
              <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', overflowX: 'auto' }}>
                <pre style={{ margin: 0, color: 'var(--success)' }}>
                  {JSON.stringify(selectedRecord.raw_payload, null, 2)}
                </pre>
              </div>
            </div>

            {(selectedRecord.status === 'PENDING_REVIEW' || selectedRecord.status === 'SUSPICIOUS') && (
              <div>
                <textarea 
                  className="form-input" 
                  placeholder="Review notes (if rejecting)..." 
                  value={rejectNotes}
                  onChange={e => setRejectNotes(e.target.value)}
                  style={{ minHeight: '80px', marginBottom: '1rem' }}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-success" style={{ flex: 1 }} onClick={() => handleApprove(selectedRecord.id)}>
                    <Check size={18} /> Approve
                  </button>
                  <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleReject(selectedRecord.id)}>
                    <X size={18} /> Reject
                  </button>
                </div>
              </div>
            )}
            {selectedRecord.status === 'APPROVED' && (
              <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={18} /> Approved by {selectedRecord.reviewed_by} at {new Date(selectedRecord.reviewed_at).toLocaleString()}
              </div>
            )}
            {selectedRecord.status === 'REJECTED' && (
              <div style={{ color: 'var(--danger)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <X size={18} /> Rejected by {selectedRecord.reviewed_by} at {new Date(selectedRecord.reviewed_at).toLocaleString()}
                </div>
                <p style={{ fontSize: '0.9rem' }}>Notes: {selectedRecord.audit_notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import api from '../utils/api';
import '../billscan.css';

const CATEGORIES = [
  'salary', 'freelance', 'investments', 'food', 'transport',
  'housing', 'utilities', 'entertainment', 'healthcare',
  'education', 'shopping', 'other'
];

export default function BillScanModal({ onClose, onConfirm }) {
  const [step, setStep] = useState('upload'); // 'upload' | 'scanning' | 'review' | 'saving' | 'error'
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [saveError, setSaveError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file.');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setErrorMsg('');
    setStep('upload');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleScan = async () => {
    if (!file) return;
    setStep('scanning');
    setErrorMsg('');
    try {
      const form = new FormData();
      form.append('bill', file);
      const res = await api.post('/bill-scan', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setExtracted(res.data.data);
      setStep('review');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to scan bill. Try a clearer image.');
      setStep('error');
    }
  };

  const handleFieldChange = (field, value) => {
    setExtracted((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = async () => {
    setSaveError('');
    setStep('saving');
    try {
      await onConfirm(extracted);
      onClose();
    } catch (err) {
      setSaveError(err?.response?.data?.message || err?.message || 'Failed to save transaction. Please try again.');
      setStep('review');
    }
  };

  return (
    <div
      className="bill-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bill-modal">
        {/* Header */}
        <div className="bill-modal-header">
          <div className="bill-modal-header-left">
            <span className="bill-modal-icon">📷</span>
            <div>
              <h2 className="bill-modal-title">Scan Bill</h2>
              <p className="bill-modal-subtitle">Upload a photo of your receipt</p>
            </div>
          </div>
          <button className="bill-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Step: Upload */}
        {(step === 'upload' || step === 'error') && (
          <div className="bill-upload-area">
            <div
              className={`bill-dropzone ${dragOver ? 'dragover' : ''} ${preview ? 'has-preview' : ''}`}
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {preview ? (
                <img src={preview} alt="Bill preview" className="bill-preview-img" />
              ) : (
                <div className="bill-dropzone-placeholder">
                  <div className="bill-upload-icon">🧾</div>
                  <p className="bill-upload-text">Drop your bill here or <span className="bill-upload-link">browse</span></p>
                  <p className="bill-upload-hint">JPG, PNG, WEBP up to 10MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {preview && (
              <button
                className="bill-change-btn"
                onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }}
              >
                Change Image
              </button>
            )}

            {errorMsg && (
              <div className="bill-error">{errorMsg}</div>
            )}

            <button
              className="bill-scan-btn"
              disabled={!file}
              onClick={handleScan}
            >
              <span>✨</span> Scan with AI
            </button>
          </div>
        )}

        {/* Step: Scanning */}
        {step === 'scanning' && (
          <div className="bill-scanning">
            <div className="bill-scanning-animation">
              <div className="scan-ring" />
              <div className="scan-ring scan-ring-2" />
              <div className="scan-ring scan-ring-3" />
              <span className="scan-emoji">🤖</span>
            </div>
            <p className="bill-scanning-text">AI is reading your bill...</p>
            <p className="bill-scanning-sub">This usually takes a few seconds</p>
          </div>
        )}

        {/* Step: Review */}
        {step === 'review' && extracted && (
          <div className="bill-review">
            <div className="bill-review-success">
              <span>✅</span> Data extracted successfully! Review and confirm.
            </div>

            <div className="bill-review-grid">
              <div className="bill-field">
                <label>Type</label>
                <select
                  value={extracted.type}
                  onChange={(e) => handleFieldChange('type', e.target.value)}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div className="bill-field">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={extracted.amount}
                  onChange={(e) => handleFieldChange('amount', parseFloat(e.target.value))}
                />
              </div>

              <div className="bill-field">
                <label>Category</label>
                <select
                  value={extracted.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="bill-field">
                <label>Date</label>
                <input
                  type="date"
                  value={extracted.date}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                />
              </div>

              <div className="bill-field bill-field-full">
                <label>Description</label>
                <input
                  type="text"
                  value={extracted.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                />
              </div>
            </div>

            {saveError && (
              <div className="bill-error">{saveError}</div>
            )}

            <div className="bill-review-actions">
              <button className="bill-back-btn" onClick={() => setStep('upload')} disabled={step === 'saving'}>
                ← Rescan
              </button>
              <button
                className="bill-confirm-btn"
                onClick={handleConfirm}
                disabled={step === 'saving'}
                style={step === 'saving' ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
              >
                {step === 'saving' ? '⏳ Saving...' : '✓ Add Transaction'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

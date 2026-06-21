import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCloudUploadAlt, FaCheckCircle, FaCrop,
  FaUndo, FaSearch, FaArrowRight, FaImage, FaUsers, FaPlus
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTranslation } from '../hooks/useTranslation';
import toast from 'react-hot-toast';
import diagnosisService from '../services/diagnosisService';
import familyService from '../services/familyService';

// ===================== Step Progress Bar =====================
const StepProgressBar = ({ currentStep }) => {
  const { t } = useTranslation();
  const steps = t.upload?.steps || [
    { id: 1, label: 'Patient', icon: '👤' },
    { id: 2, label: 'Upload', icon: '📤' },
    { id: 3, label: 'Crop', icon: '✂️' },
    { id: 4, label: 'Analyze', icon: '🔬' },
    { id: 5, label: 'Results', icon: '📋' },
  ];

  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
              currentStep > step.id
                ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                : currentStep === step.id
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-110'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
            }`}>
              {currentStep > step.id ? (
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              ) : <span>{step.icon}</span>}
              {currentStep === step.id && (
                <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping"></div>
              )}
            </div>
            <span className={`mt-2 text-xs font-semibold transition-all duration-300 hidden sm:block ${
              currentStep >= step.id ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'
            }`}>{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 mx-1 mb-5">
              <div className="h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r from-blue-500 to-purple-500 ${
                  currentStep > step.id ? 'w-full' : 'w-0'
                }`} />
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ===================== Patient Selector =====================
const PatientSelector = ({ members, selected, onSelect, loading }) => {
  const { userData } = useAuth();
  const { t } = useTranslation();

  // الـ user نفسه كـ option أساسية
  const selfOption = {
    id: 'self',
    name: userData?.username || userData?.name || t.upload?.myself || 'Myself',
    relation: 'self',
    icon: '👤',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <FaUsers className="text-white text-sm" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{t.upload?.patientQuestion || 'Who is this analysis for?'}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.upload?.selectPatient || 'Select the patient'}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex-shrink-0 w-24 h-20 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {/* Self option */}
            <button
              onClick={() => onSelect(selfOption)}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 min-w-[80px] ${
                selected?.id === 'self'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md scale-105'
                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-2xl mb-1">👤</span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 text-center leading-tight max-w-[70px] truncate">
                {selfOption.name}
              </span>
              <span className="text-xs text-gray-400 mt-0.5">{t.upload?.myself || 'Myself'}</span>
              {selected?.id === 'self' && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                  <FaCheckCircle className="text-white text-xs" />
                </div>
              )}
            </button>

            {/* Family members */}
            {members.map(member => {
              const rel = familyService.getRelationInfo(member.relation);
              return (
                <button
                  key={member.id}
                  onClick={() => onSelect(member)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 min-w-[80px] ${
                    selected?.id === member.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md scale-105'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-2xl mb-1">{rel.icon}</span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 text-center leading-tight max-w-[70px] truncate">
                    {member.name}
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5 capitalize">{rel.label}</span>
                  {selected?.id === member.id && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                      <FaCheckCircle className="text-white text-xs" />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Add member shortcut */}
            <button
              onClick={() => window.location.href = '/profile'}
              className="flex flex-col items-center p-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-gray-700 transition-all min-w-[80px] text-gray-400 hover:text-blue-500"
            >
              <FaPlus className="text-xl mb-1" />
              <span className="text-xs font-semibold text-center leading-tight">{t.upload?.addMember || 'Add Member'}</span>
            </button>
          </div>
        )}

        {/* Selected indicator */}
        {selected && (
          <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <FaCheckCircle className="text-xs" />
            <span className="font-semibold">
              {t.upload?.analyzingFor || 'Analyzing for'}: <strong>{selected.name}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ===================== Success Animation =====================
const SuccessAnimation = ({ disease, probability, patientName }) => {
  const [show, setShow] = useState(false);
  const { t } = useTranslation();
  useEffect(() => { setTimeout(() => setShow(true), 50); }, []);

  return (
    <div className={`flex flex-col items-center justify-center py-6 transition-all duration-700 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
      <div className="relative mb-4">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30">
          <svg className="w-10 h-10 text-white" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="23" fill="none" stroke="white" strokeWidth="2" opacity="0.3"/>
            <path d="M14 25 L22 33 L36 17" fill="none" stroke="white" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ strokeDasharray: 30, strokeDashoffset: show ? 0 : 30, transition: 'stroke-dashoffset 0.6s ease 0.3s' }}
            />
          </svg>
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-green-400/40 animate-ping"></div>
        <div className="absolute -inset-2 rounded-full border border-green-400/20 animate-ping" style={{ animationDelay: '0.3s' }}></div>
      </div>
      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">{t.upload?.analysisComplete || 'Analysis Complete!'}</h3>
      {patientName && patientName !== (t.upload?.myself || 'Myself') && (
        <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">{t.upload?.patientLabel || 'Patient'}: {patientName}</p>
      )}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 text-center">
        <span className="font-bold text-gray-700 dark:text-gray-300 capitalize">{disease}</span> {t.upload?.detectedWith || 'detected with'}{' '}
        <span className={`font-bold ${probability >= 80 ? 'text-green-600' : probability >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
          {probability}%
        </span> {t.upload?.confidence || 'confidence'}
      </p>
      <div className="flex gap-1">
        {['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-pink-500'].map((color, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${color} animate-bounce`} style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    </div>
  );
};

// ===================== Crop Tool =====================
const CropTool = ({ imageSrc, onCropDone, onCancel }) => {
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [cropBox, setCropBox] = useState({ x: 60, y: 60, w: 200, h: 200 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [displaySize, setDisplaySize] = useState({ w: 400, h: 300 });
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const HANDLE_SIZE = 10;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      const maxW = 460; const maxH = 340;
      const ratio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
      const dw = Math.round(img.naturalWidth * ratio);
      const dh = Math.round(img.naturalHeight * ratio);
      setDisplaySize({ w: dw, h: dh });
      setCropBox({ x: Math.round(dw * 0.2), y: Math.round(dh * 0.2), w: Math.round(dw * 0.6), h: Math.round(dh * 0.6) });
      setImgLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const getPos = (e, el) => {
    const rect = el.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const getHandle = (pos, box) => {
    const handles = [
      { id: 'tl', x: box.x, y: box.y }, { id: 'tr', x: box.x + box.w, y: box.y },
      { id: 'bl', x: box.x, y: box.y + box.h }, { id: 'br', x: box.x + box.w, y: box.y + box.h },
      { id: 'tc', x: box.x + box.w / 2, y: box.y }, { id: 'bc', x: box.x + box.w / 2, y: box.y + box.h },
      { id: 'lc', x: box.x, y: box.y + box.h / 2 }, { id: 'rc', x: box.x + box.w, y: box.y + box.h / 2 },
    ];
    for (const h of handles) {
      if (Math.abs(pos.x - h.x) < HANDLE_SIZE + 4 && Math.abs(pos.y - h.y) < HANDLE_SIZE + 4) return h.id;
    }
    return null;
  };

  const isInsideBox = (pos, box) =>
    pos.x > box.x + HANDLE_SIZE && pos.x < box.x + box.w - HANDLE_SIZE &&
    pos.y > box.y + HANDLE_SIZE && pos.y < box.y + box.h - HANDLE_SIZE;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    const el = containerRef.current; if (!el) return;
    const pos = getPos(e, el);
    const handle = getHandle(pos, cropBox);
    if (handle) { setIsResizing(handle); setStartPos(pos); }
    else if (isInsideBox(pos, cropBox)) { setIsDragging(true); setStartPos(pos); }
  }, [cropBox]);

  const onMouseMove = useCallback((e) => {
    if (!isDragging && !isResizing) return;
    e.preventDefault();
    const el = containerRef.current; if (!el) return;
    const pos = getPos(e, el);
    const dx = pos.x - startPos.x; const dy = pos.y - startPos.y;
    setCropBox(prev => {
      let { x, y, w, h } = prev; const minSize = 40;
      if (isDragging) { x = clamp(x + dx, 0, displaySize.w - w); y = clamp(y + dy, 0, displaySize.h - h); }
      else if (isResizing) {
        const r = isResizing;
        if (r.includes('l')) { const nx = clamp(x + dx, 0, x + w - minSize); w = w - (nx - x); x = nx; }
        if (r.includes('r')) { w = clamp(w + dx, minSize, displaySize.w - x); }
        if (r.includes('t')) { const ny = clamp(y + dy, 0, y + h - minSize); h = h - (ny - y); y = ny; }
        if (r.includes('b')) { h = clamp(h + dy, minSize, displaySize.h - y); }
        if (r === 'tc' || r === 'bc') x = prev.x;
        if (r === 'lc' || r === 'rc') y = prev.y;
      }
      return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
    });
    setStartPos(pos);
  }, [isDragging, isResizing, startPos, displaySize]);

  const onMouseUp = useCallback(() => { setIsDragging(false); setIsResizing(null); }, []);

  const handleApplyCrop = () => {
    const canvas = document.createElement('canvas');
    const img = imgRef.current; if (!img) return;
    const scaleX = naturalSize.w / displaySize.w; const scaleY = naturalSize.h / displaySize.h;
    const cx = Math.round(cropBox.x * scaleX); const cy = Math.round(cropBox.y * scaleY);
    const cw = Math.round(cropBox.w * scaleX); const ch = Math.round(cropBox.h * scaleY);
    canvas.width = cw; canvas.height = ch;
    canvas.getContext('2d').drawImage(img, cx, cy, cw, ch, 0, 0, cw, ch);
    canvas.toBlob(blob => {
      if (blob) onCropDone(new File([blob], 'cropped.jpg', { type: 'image/jpeg' }), URL.createObjectURL(blob));
    }, 'image/jpeg', 0.95);
  };

  const handles = [
    { id: 'tl', style: { top: -5, left: -5, cursor: 'nw-resize' } },
    { id: 'tr', style: { top: -5, right: -5, cursor: 'ne-resize' } },
    { id: 'bl', style: { bottom: -5, left: -5, cursor: 'sw-resize' } },
    { id: 'br', style: { bottom: -5, right: -5, cursor: 'se-resize' } },
    { id: 'tc', style: { top: -5, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' } },
    { id: 'bc', style: { bottom: -5, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' } },
    { id: 'lc', style: { left: -5, top: '50%', transform: 'translateY(-50%)', cursor: 'w-resize' } },
    { id: 'rc', style: { right: -5, top: '50%', transform: 'translateY(-50%)', cursor: 'e-resize' } },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FaCrop className="text-white text-sm" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{t.upload?.cropModal?.title || 'Crop & Focus'}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.upload?.cropModal?.subtitle || 'Select the affected skin area'}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold">✕</button>
        </div>
        <div className="mx-6 mt-4 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl flex items-center gap-2">
          <FaSearch className="text-blue-500 text-sm flex-shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>{t.upload?.cropModal?.tipLabel || 'Tip'}:</strong> {t.upload?.cropModal?.tipText || 'Drag corners to resize. Drag inside to move. Focus on affected area only.'}
          </p>
        </div>
        <div className="flex items-center justify-center p-6">
          {!imgLoaded ? (
            <div className="flex items-center justify-center h-64 w-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div ref={containerRef} className="relative select-none"
              style={{ width: displaySize.w, height: displaySize.h, cursor: 'crosshair' }}
              onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
              onTouchStart={onMouseDown} onTouchMove={onMouseMove} onTouchEnd={onMouseUp}
            >
              <img ref={imgRef} src={imageSrc} alt={t.upload?.cropModal?.imageAlt || 'Crop'}
                style={{ width: displaySize.w, height: displaySize.h, display: 'block', userSelect: 'none', pointerEvents: 'none', borderRadius: 8 }}
                draggable={false}
              />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: cropBox.y, background: 'rgba(0,0,0,0.55)' }} />
              <div style={{ position: 'absolute', top: cropBox.y, left: 0, width: cropBox.x, height: cropBox.h, background: 'rgba(0,0,0,0.55)' }} />
              <div style={{ position: 'absolute', top: cropBox.y, left: cropBox.x + cropBox.w, width: displaySize.w - (cropBox.x + cropBox.w), height: cropBox.h, background: 'rgba(0,0,0,0.55)' }} />
              <div style={{ position: 'absolute', top: cropBox.y + cropBox.h, left: 0, width: '100%', height: displaySize.h - (cropBox.y + cropBox.h), background: 'rgba(0,0,0,0.55)' }} />
              <div style={{ position: 'absolute', top: cropBox.y, left: cropBox.x, width: cropBox.w, height: cropBox.h, border: '2px solid #3B82F6', cursor: isDragging ? 'grabbing' : 'grab', boxSizing: 'border-box' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(59,130,246,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.2) 1px,transparent 1px)`, backgroundSize: `${Math.round(cropBox.w / 3)}px ${Math.round(cropBox.h / 3)}px` }} />
                {handles.map(h => (
                  <div key={h.id} style={{ position: 'absolute', width: 12, height: 12, background: '#3B82F6', border: '2px solid white', borderRadius: 2, ...h.style }} />
                ))}
                <div style={{ position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)', background: '#3B82F6', color: 'white', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>
                  {cropBox.w} × {cropBox.h}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-6 pb-6 gap-3">
          <button onClick={() => setCropBox({ x: Math.round(displaySize.w * 0.1), y: Math.round(displaySize.h * 0.1), w: Math.round(displaySize.w * 0.8), h: Math.round(displaySize.h * 0.8) })}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:border-blue-400 transition-all text-sm font-semibold">
            <FaUndo className="text-xs" /><span>{t.upload?.cropModal?.reset || 'Reset'}</span>
          </button>
          <div className="flex gap-3">
            <button onClick={onCancel} className="px-5 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:border-gray-400 transition-all text-sm font-semibold">
              {t.upload?.cropModal?.useOriginal || 'Use Original'}
            </button>
            <button onClick={handleApplyCrop} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all text-sm font-bold">
              <FaCrop className="text-xs" /><span>{t.upload?.cropModal?.applyCrop || 'Apply Crop'}</span><FaArrowRight className="text-xs rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================== Main Upload =====================
const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [originalPreview, setOriginalPreview] = useState(null);
  const [isCropped, setIsCropped] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ✅ Family
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyLoading, setFamilyLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const selfLabel = t.upload?.myself || 'Myself';
  const croppedObjectUrlRef = useRef(null);
  const transferCroppedObjectUrlRef = useRef(false);

  const revokeCroppedObjectUrl = useCallback(() => {
    if (croppedObjectUrlRef.current) {
      URL.revokeObjectURL(croppedObjectUrlRef.current);
      croppedObjectUrlRef.current = null;
    }
    transferCroppedObjectUrlRef.current = false;
  }, []);

  useEffect(() => () => {
    if (!transferCroppedObjectUrlRef.current) {
      revokeCroppedObjectUrl();
    }
  }, [revokeCroppedObjectUrl]);

  // ✅ Load family members on mount
  useEffect(() => {
    const loadFamily = async () => {
      const result = await familyService.getMembers();
      if (result.success) setFamilyMembers(result.data);
      setFamilyLoading(false);

      // Default: select self
      setSelectedPatient({
        id: 'self',
        name: userData?.username || userData?.name || selfLabel,
        relation: 'self',
      });
    };
    if (currentUser) loadFamily();
  }, [currentUser]);

  // ✅ Step tracking: 1=patient, 2=upload, 3=crop, 4=analyze, 5=results
  const getCurrentStep = () => {
    if (analysisComplete) return 5;
    if (isAnalyzing) return 4;
    if (preview && isCropped) return 4;
    if (preview) return 3;
    if (selectedPatient) return 2;
    return 1;
  };

  const processFile = (file) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png'];
    const validExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
    if (!validTypes.includes(file.type) || !validExtensions.includes(fileExtension)) { toast.error(t.upload?.invalidFormat || 'Invalid file format'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error(t.upload?.fileTooLarge || 'File too large (max 10MB)'); return; }
    revokeCroppedObjectUrl();
    setSelectedFile(file);
    setAnalysisComplete(false); setAnalysisResult(null);
    setIsCropped(false); setShowSuccess(false);
    const reader = new FileReader();
    reader.onloadend = () => { setPreview(reader.result); setOriginalPreview(reader.result); setShowCropper(true); };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); processFile(e.dataTransfer.files[0]); };

  const handleCropDone = (croppedFile, croppedUrl) => {
    revokeCroppedObjectUrl();
    croppedObjectUrlRef.current = croppedUrl;
    setSelectedFile(croppedFile); setPreview(croppedUrl);
    setIsCropped(true); setShowCropper(false);
    toast.success(`✂️ ${t.upload?.cropApplied || 'Crop applied!'}`);
  };

  const handleCropCancel = () => { setShowCropper(false); setIsCropped(false); };

  const handleAnalyze = async () => {
    if (!selectedFile) { toast.error(t.upload?.uploadFirst || 'Please upload an image first'); return; }
    if (!currentUser) { toast.error(t.auth?.pleaseLogin || 'Please login'); navigate('/signin'); return; }
    setIsAnalyzing(true);
    try {
      const response = await diagnosisService.uploadImage(selectedFile);
      if (response.success) {
        const data = response.data;
        const result = {
          analysisId: data.analysis_id,
          disease: data.predicted_label || 'Unknown',
          probability: Math.round((data.confidence || 0) * 100),
          imageQuality: Math.round(data.image_quality_score || 0),
          imageQualityLabel: data.image_quality_label || 'Unknown',
          secondaryDiseases: (data.top_k || []).slice(1).map(pred => ({
            name: pred.label, probability: Math.round((pred.confidence || 0) * 100)
          })),
          // ✅ Patient info
          patientName: selectedPatient?.name || selfLabel,
          patientRelation: selectedPatient?.relation || 'self',
        };
        setAnalysisResult(result);
        setAnalysisComplete(true);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        toast.success(`🎉 ${t.upload?.analysisCompleteFor || 'Analysis complete for'} ${result.patientName}!`);
      } else {
        toast.error(response.error || t.upload?.analysisFailed || 'Analysis failed');
      }
    } catch {
      toast.error(t.upload?.analysisFailed || 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewReport = () => {
    if (preview === croppedObjectUrlRef.current) {
      transferCroppedObjectUrlRef.current = true;
    }
    navigate('/result', {
      state: { analysisResult, imageUrl: preview, description }
    });
  };

  const handleReset = () => {
    revokeCroppedObjectUrl();
    setSelectedFile(null); setPreview(null); setOriginalPreview(null);
    setIsCropped(false); setAnalysisComplete(false);
    setAnalysisResult(null); setDescription(''); setShowSuccess(false);
  };

  const getProbabilityColor = (prob) => {
    if (prob >= 80) return 'text-green-600 dark:text-green-400';
    if (prob >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getProbabilityBg = (prob) => {
    if (prob >= 80) return 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700';
    if (prob >= 50) return 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700';
    return 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700';
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {showCropper && originalPreview && (
        <CropTool imageSrc={originalPreview} onCropDone={handleCropDone} onCancel={handleCropCancel} />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full mb-5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-blue-700 dark:text-blue-300 font-semibold text-sm">{t.upload?.readyBadge || 'AI Skin Analysis Ready'}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {t.upload?.title || 'Skin Disease Analysis'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            {t.upload?.subtitle || 'Select patient, upload photo, and get instant AI diagnosis'}
          </p>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t.upload?.privacyNotice || 'Results are AI-assisted and preliminary. They do not replace a dermatologist or professional medical diagnosis. Avoid uploading images with unnecessary identifying content.'}
          </p>
        </div>

        {/* ✅ Step Progress Bar - 5 steps */}
        <StepProgressBar currentStep={getCurrentStep()} />

        {/* ✅ Patient Selector */}
        <PatientSelector
          members={familyMembers}
          selected={selectedPatient}
          onSelect={setSelectedPatient}
          loading={familyLoading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {t.upload?.uploadSection || 'Upload Image'}
              </h2>
              {preview && !analysisComplete && (
                <div className="flex items-center gap-2">
                  {isCropped && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full text-xs text-blue-600 dark:text-blue-400 font-semibold">
                      <FaCrop className="text-xs" /><span>{t.upload?.cropped || 'Cropped'}</span>
                    </span>
                  )}
                  <button onClick={() => setShowCropper(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-lg hover:shadow-md transition-all">
                    <FaCrop className="text-xs" />
                    <span>{isCropped ? t.upload?.reCrop || 'Re-Crop' : t.upload?.cropArea || 'Crop Area'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="mb-5 relative">
                <div
                  className={`relative border-2 border-dashed rounded-xl transition-all duration-300 overflow-hidden min-h-[260px] flex flex-col items-center justify-center
                    ${isDragOver
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 scale-[1.02] shadow-lg shadow-blue-500/20'
                      : preview
                        ? 'border-blue-300 dark:border-blue-600 bg-gray-50 dark:bg-gray-700/30'
                        : 'border-blue-300 dark:border-blue-700 hover:border-blue-500 hover:bg-blue-50/50 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20'
                    }`}
                  onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver} onDrop={handleDrop}
                >
                  <input type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isAnalyzing || analysisComplete}
                  />

                  {isDragOver && (
                    <div className="absolute inset-0 z-20 bg-blue-500/10 flex flex-col items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-3 animate-bounce shadow-xl">
                        <FaImage className="text-white text-2xl" />
                      </div>
                      <p className="text-blue-600 dark:text-blue-400 font-black text-xl">{t.upload?.dropItHere || 'Drop it here!'}</p>
                    </div>
                  )}

                  {preview ? (
                    <div className="w-full h-full relative">
                      <img src={preview} alt="Preview" className="w-full max-h-64 object-contain rounded-lg" />
                      {isCropped && (
                        <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-lg">
                          <FaCrop className="text-xs" /><span>{t.upload?.focusedArea || 'Focused Area'}</span>
                        </div>
                      )}
                      {!analysisComplete && (
                        <div className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg">
                          {t.upload?.clickToChange || 'Click to change'}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-8 space-y-4 pointer-events-none">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <FaCloudUploadAlt className="text-white text-3xl" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{t.upload?.dropImageHere || 'Drop image here or click to upload'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.upload?.supportedUploadFormats || 'JPG, JPEG, PNG - max 10MB'}</p>
                      </div>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
                      <div className="text-center">
                        <LoadingSpinner size="lg" text="" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4 mb-1">{t.upload?.aiAnalyzing || 'AI Analyzing...'}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {selectedPatient ? `${t.upload?.analyzingFor || 'Analyzing for'} ${selectedPatient.name}` : t.upload?.processingPatterns || 'Processing skin patterns'}
                        </p>
                        <div className="flex justify-center gap-1 mt-3">
                          {[0, 0.15, 0.3].map((d, i) => (
                            <div key={i} className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {preview && !isAnalyzing && (
                  <div className={`mt-3 flex items-center gap-2 transition-all duration-300 ${
                    analysisComplete ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    <FaCheckCircle />
                    <span className="text-sm font-semibold">
                      {analysisComplete
                        ? `✅ ${t.upload?.doneReportReadyFor || 'Done! Report ready for'} ${analysisResult?.patientName}`
                        : isCropped ? `✂️ ${t.upload?.areaCroppedReady || 'Area cropped & ready'}` : `📸 ${t.upload?.imageReadyCrop || 'Image ready - crop for better accuracy'}`}
                    </span>
                  </div>
                )}
              </div>

              {preview && !isCropped && !analysisComplete && !isAnalyzing && (
                <div onClick={() => setShowCropper(true)}
                  className="mb-4 flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl cursor-pointer hover:bg-amber-100 transition-all group">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaCrop className="text-white text-xs" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-300">{t.upload?.cropBetter || 'Crop for better accuracy'}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">{t.upload?.focusAffectedArea || 'Focus on the affected area'}</p>
                  </div>
                  <FaArrowRight className="text-amber-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform" />
                </div>
              )}

              {preview && !analysisComplete && (
                <button onClick={handleAnalyze} disabled={isAnalyzing}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
                  {isAnalyzing
                    ? <span>{t.upload?.analyzing || 'Analyzing'} {selectedPatient?.name}...</span>
                    : <><FaSearch /><span>{t.upload?.analyzeFor || 'Analyze for'} {selectedPatient?.name || t.upload?.patientFallback || 'Patient'}</span></>
                  }
                </button>
              )}

              {analysisComplete && (
                <button onClick={handleReset}
                  className="w-full py-3 mt-3 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all text-sm">
                  ↑ {t.upload?.newAnalysis || 'New Analysis'}
                </button>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t.upload?.resultsTitle || 'AI Analysis Results'}</h2>
              {selectedPatient && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                  <span className="text-sm">{familyService.getRelationInfo(selectedPatient.relation)?.icon || '👤'}</span>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{selectedPatient.name}</span>
                </div>
              )}
            </div>

            <div className="p-6">
              {!analysisComplete ? (
                <div className="flex flex-col items-center justify-center h-72 text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center">
                      <FaSearch className="text-3xl text-gray-400 dark:text-gray-500" />
                    </div>
                    {isAnalyzing && <div className="absolute inset-0 rounded-2xl border-2 border-blue-500 animate-ping opacity-50"></div>}
                  </div>
                  <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {isAnalyzing ? `${t.upload?.analyzing || 'Analyzing'} ${selectedPatient?.name || ''}...` : t.upload?.resultsWillAppear || 'Results will appear here'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
                    {isAnalyzing ? t.upload?.aiProcessingPatterns || 'AI is processing the skin patterns' : t.upload?.uploadToSeeDiagnosis || 'Upload an image to see the diagnosis'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {showSuccess && (
                    <SuccessAnimation
                      disease={analysisResult.disease}
                      probability={analysisResult.probability}
                      patientName={analysisResult.patientName}
                    />
                  )}

                  {!showSuccess && (
                    <>
                      {/* Patient badge */}
                      <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                        <span className="text-xl">{familyService.getRelationInfo(analysisResult.patientRelation)?.icon || '👤'}</span>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t.upload?.patientLabel || 'Patient'}</p>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{analysisResult.patientName}</p>
                        </div>
                      </div>

                      {/* Image Quality */}
                      <div className="flex items-center justify-between p-3.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">{t.upload?.imageQualityLabel || 'Image Quality'}</p>
                          <p className="text-xs text-gray-400">{isCropped ? t.upload?.croppedArea || 'Cropped area' : t.upload?.fullImage || 'Full image'}</p>
                        </div>
                        <div className="text-right rtl:text-left">
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analysisResult.imageQuality}</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{analysisResult.imageQualityLabel}</p>
                        </div>
                      </div>

                      {/* Primary Disease */}
                      <div className={`p-5 bg-gradient-to-br ${getProbabilityBg(analysisResult.probability)} rounded-xl border-2`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.upload?.primaryDiagnosis || 'Primary Diagnosis'}</span>
                          <span className="px-2.5 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-full shadow-sm">{t.upload?.topMatch || '#1 Match'}</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 capitalize">{analysisResult.disease}</h3>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2.5 bg-white/60 dark:bg-gray-700/60 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-1000 ${
                              analysisResult.probability >= 80 ? 'bg-green-500' :
                              analysisResult.probability >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} style={{ width: `${analysisResult.probability}%` }} />
                          </div>
                          <span className={`text-2xl font-black ${getProbabilityColor(analysisResult.probability)}`}>{analysisResult.probability}%</span>
                        </div>
                      </div>

                      {/* Secondary */}
                      {analysisResult.secondaryDiseases?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t.upload?.otherPossibilities || 'Other Possibilities'}</p>
                          <div className="space-y-2">
                            {analysisResult.secondaryDiseases.map((d, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize font-medium">{d.name}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                    <div className="h-full bg-gray-400 rounded-full" style={{ width: `${d.probability}%` }} />
                                  </div>
                                  <span className={`text-sm font-bold ${getProbabilityColor(d.probability)}`}>{d.probability}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          {t.upload?.patientNotes || 'Patient Notes (Optional)'}
                        </label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows="2"
                          placeholder={t.upload?.patientNotesPlaceholder || 'Symptoms, duration, medications...'}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 outline-none transition-all text-sm resize-none" />
                      </div>

                      <button onClick={handleViewReport}
                        className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-base font-bold rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                        <span>{t.upload?.viewFullReport || 'View Full Report'}</span><FaArrowRight className="rtl:rotate-180" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {(t.upload?.tipsList || [
            { icon: '👥', title: 'Select Patient', desc: 'Choose who the analysis is for', color: 'border-blue-400' },
            { icon: '💡', title: 'Good Lighting', desc: 'Natural or bright light for best results', color: 'border-yellow-400' },
            { icon: '✂️', title: 'Crop the Area', desc: 'Focus on affected skin only', color: 'border-purple-400' },
            { icon: '🔍', title: 'Close-up Shot', desc: 'Get close to the affected area', color: 'border-green-400' },
          ]).map((tip, i) => (
            <div key={i} className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border-l-4 ${tip.color}`}>
              <div className="text-2xl mb-2">{tip.icon}</div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{tip.title}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Upload;

import React, { useState, useRef, useEffect } from 'react';
import { VehicleInfo, DiagnosticInput, DiagnosticReport, TireAnalysisReport } from '../types';
import CameraCapture from './CameraCapture';

interface VehicleFormProps {
  onDiagnose: (vehicle: VehicleInfo, input: DiagnosticInput) => void;
  onTireScan: (imageData: string, mimeType: string) => void;
  onFindServices: (type: 'mechanic' | 'towing') => void;
  isLoading: boolean;
  history: (DiagnosticReport | TireAnalysisReport)[];
  onHistorySelect: (item: DiagnosticReport | TireAnalysisReport) => void;
  onHistoryClear: () => void;
}

const POPULAR_MAKES = ["BMW", "Chevrolet", "Ford", "Honda", "Hyundai", "Jeep", "Nissan", "Ram", "Toyota", "Volkswagen"];

const ALL_MAKES = [
  "Acura", "AM General", "American LaFrance", "Aston Martin", "Audi", "Autocar LLC", "Bentley",
  "Blue Bird", "BMW", "Bugatti", "Buick", "Cadillac", "Capacity Of Texas", "Caterpillar",
  "Chevrolet", "Chrysler", "Crane Carrier", "Dodge", "El Dorado", "Emergency One", "Evobus",
  "Ferrara", "Ferrari", "Ford", "Freightliner", "Gillig", "GMC", "Hendrickson", "Hino",
  "Honda", "Hyundai", "IC Corporation", "INFINITI", "International", "Isuzu", "Jaguar",
  "Jeep", "Kalmar", "Kenworth", "Kia", "Kovatch", "Lamborghini", "Land Rover", "Lexus",
  "Lincoln", "Lotus", "Mack", "Maserati", "Maybach", "Mazda", "Mercedes-Benz", "Mercury",
  "Mini", "Mitsubishi", "Mitsubishi Fuso", "Motor Coach Industries", "Nissan", "Nova Bus Corporation",
  "Orion Bus", "Oshkosh Motor Truck Co.", "Peterbilt", "Pierce Mfg. Inc.", "Porsche", "Prevost",
  "Ram", "Roadmaster Rail", "Rolls-Royce", "Saab", "Scion", "Smart", "Spartan Motors",
  "Spyker", "Subaru", "Suzuki", "Temsa Bus", "Terex", "Tesla", "Think", "Thomas",
  "Toyota", "UD", "Van Hool", "Volkswagen", "Volvo"
];

const CAR_MODELS: Record<string, string[]> = {
  "Acura": ["ILX", "MDX", "RDX", "RLX", "TLX", "NSX", "ZDX"],
  "Audi": ["A3", "A4", "A5", "A6", "A7", "A8", "Q3", "Q5", "Q7", "Q8", "TT", "R8", "e-tron"],
  "BMW": ["2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "8 Series", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "M3", "M4", "M5", "Z4", "i3", "i4", "iX"],
  "Bentley": ["Bentayga", "Continental GT", "Flying Spur", "Mulsanne"],
  "Buick": ["Enclave", "Encore", "Envision", "LaCrosse", "Regal", "Verano"],
  "Cadillac": ["CT4", "CT5", "Escalade", "XT4", "XT5", "XT6", "Lyriq"],
  "Chevrolet": ["Blazer", "Camaro", "Colorado", "Corvette", "Equinox", "Malibu", "Silverado 1500", "Silverado 2500", "Silverado 3500", "Suburban", "Tahoe", "Traverse", "Trax", "Bolt EV"],
  "Chrysler": ["300", "Pacifica", "Voyager"],
  "Dodge": ["Challenger", "Charger", "Durango", "Grand Caravan", "Journey", "Ram 1500"],
  "Ferrari": ["488", "812", "F8", "Roma", "SF90", "Portofino"],
  "Ford": ["Bronco", "Bronco Sport", "Edge", "Escape", "Expedition", "Explorer", "F-150", "F-250", "F-350", "Maverick", "Mustang", "Mustang Mach-E", "Ranger", "Transit"],
  "GMC": ["Acadia", "Canyon", "Envoy", "Sierra 1500", "Sierra 2500", "Sierra 3500", "Terrain", "Yukon", "Yukon XL"],
  "Honda": ["Accord", "Civic", "CR-V", "Fit", "HR-V", "Insight", "Odyssey", "Passport", "Pilot", "Ridgeline", "Prologue"],
  "Hyundai": ["Elantra", "Ioniq", "Ioniq 5", "Ioniq 6", "Kona", "Palisade", "Santa Cruz", "Santa Fe", "Sonata", "Tucson", "Veloster"],
  "INFINITI": ["Q50", "Q60", "QX50", "QX55", "QX60", "QX80"],
  "Isuzu": ["D-Max", "MU-X", "NPR", "NQR"],
  "Jaguar": ["E-Pace", "F-Pace", "F-Type", "I-Pace", "XE", "XF", "XJ"],
  "Jeep": ["Cherokee", "Compass", "Gladiator", "Grand Cherokee", "Grand Wagoneer", "Renegade", "Wagoneer", "Wrangler"],
  "Kia": ["Carnival", "EV6", "Forte", "K5", "Niro", "Seltos", "Sorento", "Soul", "Sportage", "Stinger", "Telluride"],
  "Lamborghini": ["Aventador", "Huracan", "Urus"],
  "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar"],
  "Lexus": ["ES", "GS", "GX", "IS", "LC", "LS", "LX", "NX", "RC", "RX", "UX"],
  "Lincoln": ["Aviator", "Corsair", "MKZ", "Nautilus", "Navigator"],
  "Maserati": ["Ghibli", "GranTurismo", "Grecale", "Levante", "Quattroporte"],
  "Mazda": ["CX-3", "CX-30", "CX-5", "CX-9", "CX-50", "Mazda3", "Mazda6", "MX-5 Miata", "MX-30"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "G-Class", "GLA", "GLB", "GLC", "GLE", "GLS", "AMG GT", "EQS", "EQE"],
  "Mini": ["Clubman", "Convertible", "Countryman", "Hardtop", "Paceman"],
  "Mitsubishi": ["Eclipse Cross", "Galant", "Outlander", "Outlander Sport"],
  "Nissan": ["Altima", "Armada", "Frontier", "GT-R", "Kicks", "Leaf", "Maxima", "Murano", "Pathfinder", "Rogue", "Rogue Sport", "Sentra", "Titan", "Versa", "Z"],
  "Porsche": ["718", "911", "Cayenne", "Macan", "Panamera", "Taycan"],
  "Ram": ["1500", "2500", "3500", "ProMaster", "ProMaster City"],
  "Rolls-Royce": ["Cullinan", "Dawn", "Ghost", "Phantom", "Wraith"],
  "Saab": ["9-3", "9-5"],
  "Scion": ["FR-S", "iA", "iM", "tC", "xB", "xD"],
  "Subaru": ["Ascent", "BRZ", "Crosstrek", "Forester", "Impreza", "Legacy", "Outback", "WRX", "Solterra"],
  "Suzuki": ["Equator", "Grand Vitara", "Kizashi", "SX4"],
  "Tesla": ["Model 3", "Model S", "Model X", "Model Y", "Cybertruck"],
  "Toyota": ["4Runner", "Avalon", "Camry", "Corolla", "Crown", "GR86", "Highlander", "Land Cruiser", "Prius", "RAV4", "Sequoia", "Sienna", "Tacoma", "Tundra", "Venza", "bZ4X"],
  "Volkswagen": ["Arteon", "Atlas", "Atlas Cross Sport", "Golf", "ID.4", "Jetta", "Passat", "Taos", "Tiguan"],
  "Volvo": ["C40", "S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"],
};

const YEARS = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => (2026 - i).toString());

/* ─── Typography ──────────────────────────────────────────────────────────── */
// Condensed italic: CTAs and hero moments only
const display: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif", fontStyle: 'italic' };
// Regular Barlow: all UI text — readable at any size
const body: React.CSSProperties = { fontFamily: "'Barlow', sans-serif" };

/* ─── Shared style constants ──────────────────────────────────────────────── */
const S = {
  card:        'bg-gray-950 rounded-2xl p-5 sm:p-8 border border-slate-800/60',
  secIcon:     'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
  fieldLabel:  'text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1',
  selectBase:  'w-full h-12 pl-5 pr-10 bg-black/40 border border-slate-800 rounded-full text-white font-medium text-sm cursor-pointer appearance-none outline-none transition-colors focus:border-orange-500/50',
  inputBase:   'w-full h-12 px-5 bg-black/40 border border-slate-800 rounded-full text-white font-medium text-sm outline-none transition-colors focus:border-orange-500/50 placeholder:text-slate-600',
  toolBtn:     'flex flex-col items-center justify-center gap-3 p-5 sm:p-6 bg-black/40 border border-slate-800 rounded-2xl transition-all hover:bg-slate-900 hover:border-orange-500/30 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-950',
  historyItem: 'flex items-center gap-4 p-4 bg-black/40 border border-slate-800 rounded-xl hover:bg-slate-900 hover:border-orange-500/25 transition-all text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-950 w-full',
};

/* ─── Section header ──────────────────────────────────────────────────────── */
const SectionHead: React.FC<{
  icon: React.ReactNode;
  title: string;
  iconColor?: string;
  right?: React.ReactNode;
}> = ({ icon, title, iconColor = 'text-orange-500', right }) => (
  <div className="flex items-center gap-3 mb-6 overflow-hidden">
    <div className={`${S.secIcon} bg-orange-500/10 border border-orange-500/20 ${iconColor} flex-shrink-0`}>
      {icon}
    </div>
    {/* Regular Barlow bold — no italic, no condensed — much easier to read */}
    <span
      className="font-bold text-white flex-shrink-0 tracking-wide"
      style={{ ...body, fontSize: 'clamp(14px, 3.5vw, 16px)', textTransform: 'uppercase' }}
    >
      {title}
    </span>
    <div className="flex-1 h-px bg-slate-800 min-w-0" />
    {right && <div className="flex-shrink-0 ml-1">{right}</div>}
  </div>
);

/* ─── Icons ───────────────────────────────────────────────────────────────── */
const ToolboxIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="10" width="20" height="12" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    <line x1="12" y1="14" x2="12" y2="18" />
    <line x1="10" y1="16" x2="14" y2="16" />
  </svg>
);

const CarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const WarningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChevronDown = () => (
  <svg className="w-4 h-4 text-slate-500 pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronRight = () => (
  <svg className="w-4 h-4 text-slate-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);

/* ─── Component ───────────────────────────────────────────────────────────── */
const VehicleForm: React.FC<VehicleFormProps> = ({
  onDiagnose,
  onTireScan,
  onFindServices,
  isLoading,
  history,
  onHistorySelect,
  onHistoryClear,
}) => {
  const [vehicle, setVehicle]             = useState<VehicleInfo>({ make: '', model: '', year: '', mileage: '', engine: '' });
  const [description, setDescription]     = useState('');
  const [interimText, setInterimText]     = useState('');
  const [obdCodes, setObdCodes]           = useState('');
  const [files, setFiles]                 = useState<DiagnosticInput['files']>([]);
  const [isRecording, setIsRecording]     = useState(false);
  const [isConnecting, setIsConnecting]   = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showCamera, setShowCamera]       = useState(false);
  const [manualEntry, setManualEntry]     = useState(false);

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const textAreaRef    = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef       = useRef<number | null>(null);

  useEffect(() => {
    if (textAreaRef.current) textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
  }, [description, interimText]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => setRecordingTime(p => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const startRecording = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Voice input is not supported in this browser. Please use Chrome or Safari.'); return; }
    setIsConnecting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onstart  = () => { setIsRecording(true); setIsConnecting(false); setInterimText(''); };
      recognition.onresult = (event: any) => {
        let interim = ''; let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) final += t; else interim += t;
        }
        if (final) {
          setDescription(prev => { const sep = prev && !prev.endsWith(' ') ? ' ' : ''; return prev + sep + final.trim(); });
          setInterimText('');
        } else setInterimText(interim);
      };
      recognition.onerror = (event: any) => {
        setIsConnecting(false); setIsRecording(false);
        if (event.error === 'not-allowed') alert('Microphone access blocked.');
        else if (event.error === 'network') alert('Network error. Voice transcription requires an internet connection.');
      };
      recognition.onend = () => { setIsRecording(false); setIsConnecting(false); setInterimText(''); };
      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsConnecting(false); setIsRecording(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') alert('Microphone permission denied.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} recognitionRef.current = null; }
    setIsRecording(false); setIsConnecting(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'make') setVehicle(p => ({ ...p, make: value, model: '' }));
    else setVehicle(p => ({ ...p, [name]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'description') setDescription(value);
    else if (name === 'obdCodes') setObdCodes(value);
    else if (name === 'mileage') setVehicle(p => ({ ...p, mileage: value }));
    else if (name === 'make' || name === 'model' || name === 'year') setVehicle(p => ({ ...p, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const processed: DiagnosticInput['files'] = await Promise.all(
      Array.from(e.target.files).map(file => new Promise<DiagnosticInput['files'][0]>(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => {
          let type: 'image' | 'audio' | 'video' = 'image';
          if (file.type.startsWith('audio')) type = 'audio';
          else if (file.type.startsWith('video')) type = 'video';
          resolve({ data: reader.result as string, mimeType: file.type, name: file.name, type });
        };
        reader.readAsDataURL(file);
      }))
    );
    setFiles(p => [...p, ...processed]);
  };

  const removeFile = (idx: number) => setFiles(p => p.filter((_, i) => i !== idx));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle.make || !vehicle.model || (!description && !interimText)) {
      alert('Please provide vehicle info and describe the symptoms.'); return;
    }
    onDiagnose(vehicle, { description: (description + ' ' + interimText).trim(), obdCodes, files });
  };

  const handleToggleManual = () => {
    setManualEntry(p => !p);
    setVehicle({ make: '', model: '', year: '', mileage: vehicle.mileage, engine: '' });
  };

  const isTireReport = (item: any): item is TireAnalysisReport => 'healthScore' in item;
  const models     = CAR_MODELS[vehicle.make] || [];
  const otherMakes = ALL_MAKES.filter(m => !POPULAR_MAKES.includes(m));
  const charCount  = (description + interimText).length;

  return (
    <div className="max-w-lg md:max-w-4xl mx-auto px-3 sm:px-4 pb-20 space-y-4 sm:space-y-5">

      {showCamera && (
        <CameraCapture
          onCapture={(data, mime) => { onTireScan(data, mime); setShowCamera(false); }}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* ── Quick Tools ───────────────────────────────────────────────────── */}
      <section className={S.card}>
        <SectionHead icon={<ToolboxIcon />} title="Quick Tools" />
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <button type="button" aria-label="Scan tire tread" onClick={() => setShowCamera(true)} className={S.toolBtn}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center text-orange-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
                <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-400" style={body}>Tire Scan</span>
          </button>

          <button type="button" aria-label="Find local mechanic" onClick={() => onFindServices('mechanic')} className={S.toolBtn}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-blue-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <circle cx="12" cy="11" r="3" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-400" style={body}>Find Mechanic</span>
          </button>

          <button type="button" aria-label="Request towing service" onClick={() => onFindServices('towing')} className={S.toolBtn}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center text-red-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-400" style={body}>Request Tow</span>
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

        {/* ── Vehicle Details ──────────────────────────────────────────────── */}
        <section className={S.card}>
          <SectionHead
            icon={<CarIcon />}
            title="Vehicle Details"
            right={
              <button
                type="button"
                onClick={handleToggleManual}
                className="text-xs font-semibold transition-colors px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-500"
                style={{
                  ...body,
                  color: manualEntry ? '#f97316' : '#64748b',
                  borderColor: manualEntry ? 'rgba(249,115,22,0.3)' : 'rgba(100,116,139,0.25)',
                  background: manualEntry ? 'rgba(249,115,22,0.08)' : 'transparent',
                }}
              >
                {manualEntry ? '← Use list' : 'Type manually'}
              </button>
            }
          />

          {manualEntry ? (
            <div className="space-y-3">
              <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl px-4 py-3">
                <p className="text-sm text-orange-400/70 leading-relaxed" style={body}>
                  Can't find your vehicle? Enter the details below and we'll still run a full diagnosis.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className={S.fieldLabel} style={body}>Make</label>
                  <input name="make" value={vehicle.make} onChange={handleInputChange} placeholder="e.g. Honda" className={S.inputBase} style={body} />
                </div>
                <div className="space-y-2">
                  <label className={S.fieldLabel} style={body}>Model</label>
                  <input name="model" value={vehicle.model} onChange={handleInputChange} placeholder="e.g. Civic" className={S.inputBase} style={body} />
                </div>
                <div className="space-y-2">
                  <label className={S.fieldLabel} style={body}>Year</label>
                  <input name="year" value={vehicle.year} onChange={handleInputChange} placeholder="e.g. 2019" className={S.inputBase} style={body} maxLength={4} />
                </div>
              </div>
              <div className="space-y-2">
                <label className={S.fieldLabel} style={body}>Mileage</label>
                <input name="mileage" value={vehicle.mileage} onChange={handleInputChange} placeholder="e.g. 45,000" className={S.inputBase} style={body} />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className={S.fieldLabel} style={body}>Make</label>
                  <div className="relative">
                    <select name="make" value={vehicle.make} onChange={handleSelectChange} className={S.selectBase} style={body}>
                      <option value="" disabled>Select make</option>
                      <optgroup label="── Popular ──">
                        {POPULAR_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                      </optgroup>
                      <optgroup label="── All Makes ──">
                        {otherMakes.map(m => <option key={m} value={m}>{m}</option>)}
                      </optgroup>
                    </select>
                    <ChevronDown />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={S.fieldLabel} style={body}>Model</label>
                  <div className="relative">
                    <select
                      name="model"
                      value={vehicle.model}
                      onChange={handleSelectChange}
                      disabled={!vehicle.make}
                      className={`${S.selectBase} ${!vehicle.make ? 'opacity-40 cursor-not-allowed' : ''}`}
                      style={body}
                    >
                      <option value="" disabled>
                        {vehicle.make ? 'Select model' : 'Pick a make first'}
                      </option>
                      {models.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <ChevronDown />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={S.fieldLabel} style={body}>Year</label>
                  <div className="relative">
                    <select name="year" value={vehicle.year} onChange={handleSelectChange} className={S.selectBase} style={body}>
                      <option value="" disabled>Select year</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <ChevronDown />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className={S.fieldLabel} style={body}>Mileage</label>
                <input name="mileage" value={vehicle.mileage} onChange={handleInputChange} placeholder="e.g. 45,000" className={S.inputBase} style={body} />
              </div>

              <p className="text-xs text-slate-600 pl-1" style={body}>
                Vehicle not listed?{' '}
                <button type="button" onClick={handleToggleManual} className="text-orange-500/60 hover:text-orange-400 transition-colors underline underline-offset-2 focus:outline-none">
                  Enter it manually
                </button>
              </p>
            </div>
          )}
        </section>

        {/* ── Diagnostic Information ───────────────────────────────────────── */}
        <section className={S.card}>
          <SectionHead
            icon={<WarningIcon />}
            title="Diagnostic Info"
            right={
              <div className="relative">
                {isRecording && (
                  <div className="absolute inset-0 rounded-xl ring-2 ring-orange-500 animate-ping opacity-20" />
                )}
                <button
                  type="button"
                  aria-label="Toggle voice input"
                  disabled={isConnecting}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-xl border-b-2 font-semibold text-xs transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-950 whitespace-nowrap
                    ${isRecording
                      ? 'bg-orange-600 border-orange-800 text-white'
                      : isConnecting
                      ? 'bg-slate-800 border-slate-900 text-slate-400'
                      : 'bg-black/40 border-slate-800 text-slate-300 hover:border-orange-500/40 hover:text-white'
                    }`}
                  style={body}
                >
                  {isRecording ? (
                    <div className="flex items-end gap-0.5 h-3.5 flex-shrink-0">
                      <div className="w-0.5 bg-white rounded-full animate-[bounce_0.8s_infinite] h-2" />
                      <div className="w-0.5 bg-white rounded-full animate-[bounce_1s_infinite] h-3.5" />
                      <div className="w-0.5 bg-white rounded-full animate-[bounce_0.6s_infinite] h-2.5" />
                      <div className="w-0.5 bg-white rounded-full animate-[bounce_0.9s_infinite] h-3.5" />
                    </div>
                  ) : isConnecting ? (
                    <svg className="w-3.5 h-3.5 animate-spin flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">
                    {isRecording ? `Listening… ${formatTime(recordingTime)}` : isConnecting ? 'Connecting…' : 'Tap to speak'}
                  </span>
                  <span className="sm:hidden">
                    {isRecording ? formatTime(recordingTime) : isConnecting ? '…' : 'Speak'}
                  </span>
                </button>
              </div>
            }
          />

          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <label className={S.fieldLabel} style={body}>What's happening? — symptoms, noises, leaks</label>
              <div className="relative">
                <textarea
                  ref={textAreaRef}
                  name="description"
                  value={description + (interimText ? (description ? ' ' : '') + interimText : '')}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Example: My car makes a loud squealing noise when I brake…"
                  className={`w-full min-h-[120px] px-5 py-4 bg-black/40 border rounded-2xl outline-none resize-none text-white text-sm leading-relaxed transition-colors font-medium
                    ${isRecording ? 'border-orange-500/40 bg-orange-900/5' : 'border-slate-800 focus:border-orange-500/50'}`}
                  style={{ ...body, color: '#f1f5f9', caretColor: '#f97316' }}
                />
                {isRecording && (
                  <div className="absolute top-3 right-4 flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                    </span>
                    <span className="text-[10px] font-semibold text-orange-500" style={body}>Live</span>
                  </div>
                )}
                <div className="absolute bottom-3 right-4 text-[10px] text-slate-600" style={body}>
                  {charCount} chars
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className={S.fieldLabel} style={body}>OBD-II Codes (optional)</label>
                <input
                  name="obdCodes"
                  value={obdCodes}
                  onChange={handleInputChange}
                  placeholder="P0300, P0420…"
                  className={`${S.inputBase} font-mono`}
                />
              </div>
              <div className="space-y-2">
                <label className={S.fieldLabel} style={body}>Photos or videos</label>
                <button
                  type="button"
                  aria-label="Attach photos or videos"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-12 flex items-center justify-center gap-2 px-5 bg-black/40 border-2 border-dashed border-slate-800 rounded-full text-slate-500 hover:border-orange-500/30 hover:text-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-950 text-sm font-medium"
                  style={body}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Attach media
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*,video/*" className="hidden" />
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-5 pt-5 border-t border-slate-800/60">
              <p className="text-xs font-semibold text-slate-600 mb-3" style={body}>
                Attachments ({files.length})
              </p>
              <div className="flex flex-wrap gap-3">
                {files.map((file, idx) => (
                  <div key={idx} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center">
                    {file.type === 'image' ? (
                      <img src={file.data} className="w-full h-full object-cover" alt={file.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <button
                      type="button"
                      aria-label="Remove attachment"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Submit — keep condensed italic here, it's the CTA ────────────── */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-5 rounded-full flex items-center justify-center gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-950
            ${isLoading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 active:scale-[0.99]'
            }`}
          style={{ ...display, fontWeight: 900, fontSize: 'clamp(18px, 5vw, 22px)', letterSpacing: '0.04em' }}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Running diagnosis…
            </>
          ) : (
            <>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Find My Problem
            </>
          )}
        </button>
      </form>

      {/* ── History ───────────────────────────────────────────────────────── */}
      {history.length > 0 && (
        <section className={S.card}>
          <SectionHead
            icon={<ClockIcon />}
            title="Recent History"
            iconColor="text-slate-500"
            right={
              <button
                type="button"
                onClick={onHistoryClear}
                className="text-xs font-medium text-slate-500 hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-1"
                style={body}
              >
                Clear all
              </button>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {history.map(item => (
              <button
                key={item.id}
                type="button"
                aria-label={`View report for ${isTireReport(item) ? 'Tire Scan' : (item as DiagnosticReport).vehicle.make}`}
                onClick={() => onHistorySelect(item)}
                className={S.historyItem}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${isTireReport(item) ? 'bg-blue-500/10 border-blue-500/15 text-blue-500' : 'bg-orange-500/10 border-orange-500/15 text-orange-500'}`}>
                  {isTireReport(item) ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {/* History title: regular bold, not condensed italic */}
                  <div className="font-semibold text-white text-sm truncate" style={body}>
                    {isTireReport(item) ? 'Tire Scan Report' : `${(item as DiagnosticReport).vehicle.year} ${(item as DiagnosticReport).vehicle.make} ${(item as DiagnosticReport).vehicle.model}`}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5" style={body}>
                    {new Date(item.timestamp).toLocaleDateString()} · {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <ChevronRight />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Privacy badge ─────────────────────────────────────────────────── */}
      <div className="flex justify-center py-4">
        <div className="inline-flex items-center gap-2 bg-orange-500/5 border border-slate-800 rounded-full px-4 py-2.5">
          <svg className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-slate-600" style={body}>
            Privacy secured · Encrypted diagnostic stream
          </span>
        </div>
      </div>

    </div>
  );
};

export default VehicleForm;
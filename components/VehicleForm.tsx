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

const STORAGE_KEY = 'underthehood_history';

const CAR_DATA: Record<string, string[]> = {
  "Acura": ["ILX", "MDX", "RDX", "RLX", "TLX"],
  "Audi": ["A3", "A4", "A5", "A6", "A7", "A8", "Q3", "Q5", "Q7", "Q8", "TT"],
  "BMW": ["2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "8 Series", "X1", "X3", "X5", "X7", "Z4"],
  "Chevrolet": ["Blazer", "Camaro", "Colorado", "Corvette", "Equinox", "Malibu", "Silverado", "Suburban", "Tahoe", "Traverse"],
  "Ford": ["Bronco", "Edge", "Escape", "Expedition", "Explorer", "F-150", "Mustang", "Ranger"],
  "Honda": ["Accord", "Civic", "CR-V", "Fit", "HR-V", "Insight", "Odyssey", "Passport", "Pilot", "Ridgeline"],
  "Hyundai": ["Elantra", "Ioniq", "Kona", "Palisade", "Santa Fe", "Sonata", "Tucson", "Veloster"],
  "Jeep": ["Cherokee", "Compass", "Gladiator", "Grand Cherokee", "Renegade", "Wrangler"],
  "Kia": ["Forte", "Niro", "Optima", "Rio", "Seltos", "Sorento", "Soul", "Sportage", "Stinger", "Telluride"],
  "Lexus": ["ES", "GS", "GX", "IS", "LS", "LX", "NX", "RX", "UX"],
  "Mazda": ["CX-3", "CX-30", "CX-5", "CX-9", "Mazda3", "Mazda6", "MX-5 Miata"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "G-Class", "GLA", "GLC", "GLE", "GLS"],
  "Nissan": ["Altima", "Armada", "Frontier", "Maxima", "Murano", "Pathfinder", "Rogue", "Sentra", "Titan", "Versa"],
  "Subaru": ["Ascent", "Crosstrek", "Forester", "Impreza", "Legacy", "Outback", "WRX"],
  "Tesla": ["Model 3", "Model S", "Model X", "Model Y"],
  "Toyota": ["4Runner", "Avalon", "Camry", "Corolla", "Highlander", "Prius", "RAV4", "Sequoia", "Sienna", "Tacoma", "Tundra"],
  "Volkswagen": ["Arteon", "Atlas", "Golf", "Jetta", "Passat", "Tiguan"],
  "Volvo": ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"]
};

const YEARS = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => (2026 - i).toString());

const VehicleForm: React.FC<VehicleFormProps> = ({ 
  onDiagnose, 
  onTireScan, 
  onFindServices,
  isLoading, 
  history, 
  onHistorySelect,
  onHistoryClear
}) => {
  const [vehicle, setVehicle] = useState<VehicleInfo>({
    make: '',
    model: '',
    year: '',
    mileage: '',
    engine: ''
  });

  const [description, setDescription] = useState('');
  const [interimText, setInterimText] = useState('');
  const [obdCodes, setObdCodes] = useState('');
  const [files, setFiles] = useState<DiagnosticInput['files']>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [description, interimText]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    setIsConnecting(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setIsConnecting(false);
        setInterimText('');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcript;
          } else {
            currentInterim += transcript;
          }
        }

        if (finalChunk) {
          setDescription(prev => {
            const separator = prev && !prev.endsWith(' ') ? ' ' : '';
            return prev + separator + finalChunk.trim();
          });
          setInterimText('');
        } else {
          setInterimText(currentInterim);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsConnecting(false);
        setIsRecording(false);
        
        if (event.error === 'not-allowed') {
          alert("Microphone access blocked. Please click the lock icon in your browser address bar and set Microphone to 'Allow'.");
        } else if (event.error === 'network') {
          alert("Network error. Voice transcription requires an internet connection.");
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        setIsConnecting(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Failed to start speech recognition:", err);
      setIsConnecting(false);
      setIsRecording(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        alert("Microphone permission denied. Please enable microphone access in your browser settings to use 'Tap to Speak'.");
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setIsConnecting(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name in vehicle) {
      setVehicle(prev => ({ ...prev, [name]: value }));
    } else if (name === 'description') {
      setDescription(value);
    } else if (name === 'obdCodes') {
      setObdCodes(value);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files);
    const processedFiles: DiagnosticInput['files'] = await Promise.all(
      newFiles.map((file: File) => new Promise<DiagnosticInput['files'][0]>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          let type: 'image' | 'audio' | 'video' = 'image';
          if (file.type.startsWith('audio')) type = 'audio';
          else if (file.type.startsWith('video')) type = 'video';
          
          resolve({
            data: reader.result as string,
            mimeType: file.type,
            name: file.name,
            type
          });
        };
        reader.readAsDataURL(file);
      }))
    );

    setFiles(prev => [...prev, ...processedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle.make || !vehicle.model || (!description && !interimText)) {
      alert("Please provide vehicle info and describe the symptoms.");
      return;
    }
    const finalDescription = (description + ' ' + interimText).trim();
    onDiagnose(vehicle, { description: finalDescription, obdCodes, files });
  };

  const isTireReport = (item: any): item is TireAnalysisReport => {
    return 'healthScore' in item;
  };

  return (
    <div className="max-w-lg md:max-w-4xl mx-auto px-4 pb-20 space-y-12 animate-in slide-in-from-bottom-4 duration-500">
      
      {showCamera && (
        <CameraCapture 
          onCapture={(data, mime) => {
            onTireScan(data, mime);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}

      {showComingSoon && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl">
            <div className="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">Coming Soon</h3>
            <p className="text-slate-400 text-sm font-medium mb-8">
              {showComingSoon === 'mechanic' 
                ? "Local mechanic finder is launching soon. We're building a network of verified shops near you."
                : 'Emergency towing dispatch is launching soon. 24/7 roadside assistance is on the way.'}
            </p>
            <button
              onClick={() => setShowComingSoon(null)}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black uppercase tracking-widest rounded-full hover:from-orange-400 hover:to-red-500 transition-all"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Quick Tools Section */}
      <section className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800 text-white py-12">
        <div className="mt-8 mb-6">
          <h3 className="text-xl font-bold flex items-center text-orange-500 uppercase tracking-wider">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Emergency & Quick Tools
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            type="button"
            aria-label="Scan tire tread"
            onClick={() => setShowCamera(true)}
            className="flex flex-col items-center justify-center p-8 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all border border-slate-700 hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/10 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900 text-center group"
          >
            <div className="bg-slate-900 p-4 rounded-xl mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div className="font-black text-xs text-slate-100 uppercase tracking-widest">Tire Tread Scan</div>
          </button>

          <button 
            type="button"
            aria-label="Find local mechanic"
            onClick={() => setShowComingSoon('mechanic')}
            className="flex flex-col items-center justify-center p-8 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all border border-slate-700 hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/10 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900 text-center group"
          >
            <div className="bg-slate-900 p-4 rounded-xl mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
            </div>
            <div className="font-black text-xs text-slate-100 uppercase tracking-widest">Find Mechanic</div>
          </button>

          <button 
            type="button"
            aria-label="Request towing service"
            onClick={() => setShowComingSoon('towing')}
            className="flex flex-col items-center justify-center p-8 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all border border-slate-700 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/10 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 text-center group"
          >
            <div className="bg-slate-900 p-4 rounded-xl mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div className="font-black text-xs text-slate-100 uppercase tracking-widest">Request Tow</div>
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Vehicle Info Card */}
        <section className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800 py-12">
          <h3 className="text-xl font-bold text-white mt-8 mb-6 flex items-center uppercase tracking-wider">
            <svg className="w-6 h-6 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6" />
              <circle cx="17" cy="17" r="2" />
            </svg>
            Vehicle Details
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">Make</label>
                <input 
                  name="make" 
                  list="makes"
                  value={vehicle.make} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Honda" 
                  className="w-full h-12 px-6 bg-slate-800 border border-slate-700 rounded-full focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all text-white placeholder:text-slate-500 font-bold text-base" 
                />
                <datalist id="makes">
                  {Object.keys(CAR_DATA).map(make => <option key={make} value={make} />)}
                </datalist>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">Model</label>
                <input 
                  name="model" 
                  list="models"
                  value={vehicle.model} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Civic" 
                  className="w-full h-12 px-6 bg-slate-800 border border-slate-700 rounded-full focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all text-white placeholder:text-slate-500 font-bold text-base" 
                />
                <datalist id="models">
                  {vehicle.make && CAR_DATA[vehicle.make] 
                    ? CAR_DATA[vehicle.make].map(model => <option key={model} value={model} />)
                    : Object.values(CAR_DATA).flat().slice(0, 50).map((model, i) => <option key={i} value={model} />)
                  }
                </datalist>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">Year</label>
                <input 
                  name="year" 
                  list="years"
                  value={vehicle.year} 
                  onChange={handleInputChange} 
                  placeholder="2022" 
                  className="w-full h-12 px-6 bg-slate-800 border border-slate-700 rounded-full focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all text-white placeholder:text-slate-500 font-bold text-base" 
                />
                <datalist id="years">
                  {YEARS.map(year => <option key={year} value={year} />)}
                </datalist>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">Mileage</label>
              <input name="mileage" value={vehicle.mileage} onChange={handleInputChange} placeholder="45,000" className="w-full h-12 px-6 bg-slate-800 border border-slate-700 rounded-full focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all text-white placeholder:text-slate-500 font-bold text-base" />
            </div>
          </div>
        </section>

        {/* Symptom Input Card */}
        <section className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-8 mb-8">
            <h3 className="text-xl font-bold text-white flex items-center uppercase tracking-wider">
              <svg className="w-6 h-6 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              Diagnostic Information
            </h3>

            <div className="relative">
              {isRecording && (
                <div className="absolute inset-0 rounded-2xl ring-4 ring-orange-500 animate-ping opacity-20"></div>
              )}
              <button
                type="button"
                aria-label="Start hands-free voice diagnosis"
                disabled={isConnecting}
                onClick={isRecording ? stopRecording : startRecording}
                className={`relative flex items-center space-x-4 px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl border-b-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${isRecording ? 'bg-orange-600 border-orange-800 text-white scale-105 shadow-orange-500/20' : isConnecting ? 'bg-slate-700 border-slate-900 text-slate-300' : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'}`}
              >
                <div className="relative">
                  {isRecording ? (
                    <div className="flex items-end space-x-1 h-5 w-6">
                      <div className="w-1 bg-white animate-[bounce_0.8s_infinite] h-2"></div>
                      <div className="w-1 bg-white animate-[bounce_1s_infinite] h-4"></div>
                      <div className="w-1 bg-white animate-[bounce_0.6s_infinite] h-3"></div>
                      <div className="w-1 bg-white animate-[bounce_0.9s_infinite] h-5"></div>
                    </div>
                  ) : isConnecting ? (
                    <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="text-left">
                  <div className="text-base">
                    {isRecording ? `LISTENING... ${formatTime(recordingTime)}` : isConnecting ? 'CONNECTING MIC...' : 'TAP TO SPEAK'}
                  </div>
                </div>
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">What's happening? (Symptoms, Noises, Leaks)</label>
              <div className="relative group/textarea">
                <textarea 
                  ref={textAreaRef}
                  name="description"
                  value={description + (interimText ? (description ? ' ' : '') + interimText : '')}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Example: My car is making a loud squealing noise from the front when I start it..."
                  className={`w-full min-h-[120px] px-6 py-4 bg-slate-800 border border-slate-700 rounded-3xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all resize-none text-white placeholder:text-slate-500 font-medium leading-relaxed ${isRecording ? 'border-orange-400 bg-orange-900/10 shadow-[inset_0_2px_10px_rgba(249,115,22,0.1)]' : ''}`}
                />
                <div className="absolute bottom-4 right-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  {(description + interimText).length} Characters
                </div>
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                    </span>
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-tighter">Live Transcribing</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">OBD-II Codes (Optional)</label>
                <input 
                  name="obdCodes"
                  value={obdCodes}
                  onChange={handleInputChange}
                  placeholder="P0300, P0420..."
                  className="w-full h-12 px-6 bg-slate-800 border border-slate-700 rounded-full focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all text-white placeholder:text-slate-500 font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">Photos or Videos (Leaks/Wear)</label>
                <button 
                  type="button"
                  aria-label="Attach photos or videos"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-12 flex items-center justify-center space-x-3 px-6 bg-slate-800 border-2 border-dashed border-slate-700 rounded-full text-slate-400 hover:bg-slate-700 hover:border-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                  <span className="font-black text-xs uppercase tracking-widest">Attach Media</span>
                </button>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-8">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-4">Diagnostic Attachments ({files.length})</h4>
              <div className="flex flex-wrap gap-4 px-4">
                {files.map((file, idx) => (
                  <div key={idx} className="relative group w-20 h-20 rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center shadow-lg">
                    {file.type === 'image' ? (
                      <img src={file.data} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-700">
                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <button 
                      type="button"
                      aria-label="Remove attachment"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <button 
          type="submit"
          disabled={isLoading}
          className={`w-full py-6 rounded-full font-black text-xl shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center space-x-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${isLoading ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white'}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>RUNNING EXPERT DIAGNOSIS...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
              <span>FIND MY PROBLEM</span>
            </>
          )}
        </button>
      </form>

      {history.length > 0 && (
        <section className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800 py-12">
          <div className="flex items-center justify-between mt-8 mb-6">
            <h3 className="text-xl font-bold text-white flex items-center uppercase tracking-wider">
              <svg className="w-6 h-6 mr-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Recent History
            </h3>
            <button 
              type="button"
              onClick={onHistoryClear}
              className="text-[10px] font-black text-slate-500 hover:text-red-500 uppercase tracking-[0.2em] transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg px-2 py-1"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={`View report for ${isTireReport(item) ? 'Tire Scan' : item.vehicle.make}`}
                onClick={() => onHistorySelect(item)}
                className="flex items-center p-6 bg-slate-800 border border-slate-700 rounded-2xl hover:bg-slate-700 transition-all text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <div className="bg-slate-900 p-4 rounded-xl mr-4 border border-slate-700 shadow-inner">
                  {isTireReport(item) ? (
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  ) : (
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3"/></svg>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="font-black text-white truncate uppercase tracking-tight">
                    {isTireReport(item) ? 'Tire Scan Report' : `${item.vehicle.year} ${item.vehicle.make} ${item.vehicle.model}`}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-widest">
                    {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="ml-3">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="flex justify-center py-8">
        <div className="flex items-center space-x-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-900/50 px-6 py-3 rounded-full border border-slate-800">
          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          <span>Privacy Secured • Encrypted Diagnostic Stream</span>
        </div>
      </div>
    </div>
  );
};

export default VehicleForm;

import React, { useRef, useState, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (imageData: string, mimeType: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setIsStarting(false);
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please ensure you have granted permission.");
        setIsStarting(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg');
        onCapture(imageData, 'image/jpeg');
        
        // Stop stream after capture
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-lg aspect-[3/4] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        {isStarting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold uppercase tracking-widest opacity-70">Initializing Camera...</p>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
            <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-bold mb-6">{error}</p>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest text-sm"
            >
              Go Back
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            
            {/* Overlay UI */}
            <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20">
              <div className="absolute inset-0 border-2 border-white/30 rounded-xl m-4"></div>
              
              {/* Corner Brackets */}
              <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-lg"></div>
              <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-lg"></div>
              <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-lg"></div>
              <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-lg"></div>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-8 text-center">
                <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em]">Align tire tread within frame</p>
              </div>
            </div>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {!error && !isStarting && (
        <div className="mt-8 flex items-center justify-between w-full max-w-xs">
          <button 
            onClick={onClose}
            className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button 
            onClick={takePhoto}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-1 shadow-2xl active:scale-90 transition-transform focus:outline-none focus:ring-4 focus:ring-orange-500"
          >
            <div className="w-full h-full border-4 border-slate-900 rounded-full flex items-center justify-center">
              <div className="w-14 h-14 bg-orange-600 rounded-full shadow-inner"></div>
            </div>
          </button>

          <div className="w-14"></div> {/* Spacer for symmetry */}
        </div>
      )}
    </div>
  );
};

export default CameraCapture;

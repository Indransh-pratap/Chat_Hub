import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useState } from "react";

function CallControl({ stream, endCall }) {
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  function toggleMic() {
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicEnabled(audioTrack.enabled);
    }
  }

  function toggleCamera() {
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraEnabled(videoTrack.enabled);
    }
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 glass-panel border border-[var(--neon-red)] px-6 py-3 rounded-full shadow-[0_0_20px_rgba(255,0,60,0.3)] z-50">
      <button 
        onClick={toggleMic}
        className={`p-4 rounded-full transition-all ${micEnabled ? 'bg-black hover:bg-gray-800 text-white' : 'bg-[#1a0005] hover:bg-red-950 border border-[var(--neon-red)] text-[var(--neon-red)] shadow-[0_0_10px_var(--neon-red)]'}`}
      >
        {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
      </button>

      <button 
        onClick={toggleCamera}
        className={`p-4 rounded-full transition-all ${cameraEnabled ? 'bg-black hover:bg-gray-800 text-white' : 'bg-[#1a0005] hover:bg-red-950 border border-[var(--neon-red)] text-[var(--neon-red)] shadow-[0_0_10px_var(--neon-red)]'}`}
      >
        {cameraEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
      </button>

      <button 
        onClick={endCall}
        className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_red] transition-all"
        title="Terminate Secure Link"
      >
        <PhoneOff className="w-6 h-6" />
      </button>
    </div>
  );
}

export default CallControl;
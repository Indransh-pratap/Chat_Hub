import { useEffect, useRef, useState } from "react";

import CallControl from "./CallControl";

function VideoCalling({ remoteUserId, offer, isReceiver, onEnd }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [peer, setPeer] = useState(null);

  // 🎥 Get media
  useEffect(() => {
    async function getMedia() {
      const media = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(media);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = media;
      }
    }

    getMedia();
  }, []);

  // 🧠 Create Peer
  function createPeerConnection() {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ],
    });

    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: remoteUserId,
          candidate: event.candidate,
        });
      }
    };

    return pc;
  }

  // 🔵 Caller
  useEffect(() => {
    if (!isReceiver && stream) {
      startCall();
    }
  }, [stream]);

  async function startCall() {
    const pc = createPeerConnection();

    stream.getTracks().forEach(track =>
      pc.addTrack(track, stream)
    );

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("call-user", {
      to: remoteUserId,
      offer,
    });

    setPeer(pc);
  }

  // 🔴 Receiver
  useEffect(() => {
    if (isReceiver && stream && offer) {
      answerCall();
    }
  }, [stream]);

  async function answerCall() {
    const pc = createPeerConnection();

    stream.getTracks().forEach(track =>
      pc.addTrack(track, stream)
    );

    await pc.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answer-call", {
      to: remoteUserId,
      answer,
    });

    setPeer(pc);
  }

  // ✅ Handle Call Accepted
  useEffect(() => {
    socket.on("call-answered", async (answer) => {
      if (peer) {
        await peer.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    });

    return () => socket.off("call-answered");
  }, [peer]);

  // 🔁 ICE
  useEffect(() => {
    socket.on("ice-candidate", async ({ candidate }) => {
      if (peer) {
        await peer.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    });

    return () => socket.off("ice-candidate");
  }, [peer]);

  // ❌ End Call
  function endCall() {
    if (peer) peer.close();
    if (stream) stream.getTracks().forEach(track => track.stop());

    socket.emit("end-call", { to: remoteUserId });

    onEnd();
  }

  useEffect(() => {
    socket.on("call-ended", () => {
      if (peer) peer.close();
      if (stream) stream.getTracks().forEach(track => track.stop());
      onEnd();
    });

    return () => socket.off("call-ended");
  }, [peer, stream]);

  return (
    <div className="fixed inset-0 z-[100] bg-black grid place-items-center">
      {/* Sci-fi Overlays */}
      <div className="absolute inset-0 scanlines pointer-events-none z-40"></div>
      <div className="absolute inset-0 border-[4px] border-[var(--neon-red)] opacity-20 pointer-events-none z-10 box-border"></div>
      <div className="absolute top-4 left-4 z-50 text-[var(--neon-red)] font-mono text-sm tracking-widest neon-text">
        <p>SECURE LINK [ESTABLISHED]</p>
        <p className="opacity-70 text-xs">ENCRYPTION: AES-256</p>
      </div>

      <div className="relative w-full h-full">
        {/* Remote Video (Full Background) */}
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          className="w-full h-full object-cover filter contrast-125 brightness-90 grayscale-[0.2]" 
        />
        <div className="absolute inset-0 bg-red-900/10 mix-blend-overlay pointer-events-none"></div>

        {/* Local Video (Floating PIP) */}
        <div className="absolute top-4 right-4 w-48 aspect-video bg-black border-2 border-[var(--neon-red)] rounded-xl overflow-hidden shadow-[0_0_20px_var(--neon-red)] z-30">
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            className="w-full h-full object-cover filter contrast-125 saturate-150" 
          />
        </div>

        {stream && (
          <CallControl stream={stream} endCall={endCall} />
        )}
      </div>
    </div>
  );
}

export default VideoCalling;
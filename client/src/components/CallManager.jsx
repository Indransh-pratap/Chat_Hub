import { useEffect, useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useUIStore } from "../lib/uiStore";
import { ChatContext } from "../../context/ChatContext";
import IncomingCallModal from "./IncomingCallModal";
import VideoCalling from "./VideoCalling";
import toast from "react-hot-toast";

const CallManager = () => {
  const { socket, authUser } = useContext(AuthContext);
  const { users } = useContext(ChatContext);
  const { incomingCall, activeCall, setIncomingCall, setActiveCall, clearCall } = useUIStore();

  useEffect(() => {
    if (!socket) return;

    const handleCallUser = ({ from, name, offer }) => {
      // If already in a call, ignore or emit busy
      if (activeCall || incomingCall) {
        // Optionally emit busy:
        // socket.emit("call-busy", { to: from });
        return;
      }
      setIncomingCall({ fromUserId: from, callerName: name || "UNKNOWN SUBJECT", offer });
    };

    const handleCallEnded = () => {
      clearCall();
      toast("Secure Link Terminated", { icon: "🔴", style: { background: "#1a0005", color: "#ff003c", border: "1px solid #ff003c" }});
    };

    socket.on("call-user", handleCallUser);
    socket.on("call-ended", handleCallEnded);

    return () => {
      socket.off("call-user", handleCallUser);
      socket.off("call-ended", handleCallEnded);
    };
  }, [socket, activeCall, incomingCall]);

  const handleAcceptCall = () => {
    if (incomingCall) {
      setActiveCall({
        remoteUserId: incomingCall.fromUserId,
        offer: incomingCall.offer,
        isReceiver: true,
      });
      setIncomingCall(null);
    }
  };

  const handleRejectCall = () => {
    if (incomingCall && socket) {
      socket.emit("end-call", { to: incomingCall.fromUserId });
      clearCall();
    }
  };

  const handleEndCall = () => {
    clearCall();
  };

  return (
    <>
      {incomingCall && !activeCall && (
        <IncomingCallModal 
          caller={incomingCall.callerName} 
          onAccept={handleAcceptCall} 
          onReject={handleRejectCall} 
        />
      )}
      
      {activeCall && (
        <VideoCalling 
          remoteUserId={activeCall.remoteUserId}
          offer={activeCall.offer}
          isReceiver={activeCall.isReceiver}
          onEnd={handleEndCall}
        />
      )}
    </>
  );
};

export default CallManager;

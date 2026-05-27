import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, User, Maximize2, Repeat, ArrowLeftRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Socket } from 'socket.io-client';

import { TabType } from '../types';

interface CallsProps {
  socket: Socket;
  callType: 'video' | 'audio';
  setCallType: (type: 'video' | 'audio') => void;
  setActiveTab: (tab: TabType) => void;
  autoJoin?: boolean;
}

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const VideoView = ({ stream, muted = false, className = "", videoRef }: { stream: MediaStream | null, muted?: boolean, className?: string, videoRef?: React.RefObject<HTMLVideoElement | null> }) => {
  const internalRef = useRef<HTMLVideoElement>(null);
  const activeRef = videoRef || internalRef;

  useEffect(() => {
    const el = activeRef.current;
    if (el) {
      if (stream) {
        if (el.srcObject !== stream) {
          el.srcObject = stream;
        }
      } else {
        el.srcObject = null;
      }
    }
  }, [stream, activeRef]);

  return (
    <video
      ref={activeRef}
      autoPlay
      playsInline
      muted={muted}
      className={className}
    />
  );
};

export function Calls({ socket, callType, setCallType, setActiveTab, autoJoin }: CallsProps) {
  const [inCall, setInCall] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [peerId, setPeerId] = useState<string | null>(null);
  const [isSwapped, setIsSwapped] = useState(false);
  const [status, setStatus] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [currentFacingMode, setCurrentFacingMode] = useState<'user' | 'environment'>('user');
  const [isRotating, setIsRotating] = useState(false);

  const pc = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pipLocalVideoRef = useRef<HTMLVideoElement>(null);
  const pipRemoteVideoRef = useRef<HTMLVideoElement>(null);

  const peerIdRef = useRef<string | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const inCallRef = useRef(false);
  const signalQueue = useRef<{ from: string, signal: any }[]>([]);
  const iceCandidateQueue = useRef<{ from: string, candidate: any }[]>([]);

  useEffect(() => {
    socket.on('user-joined', (userId) => {
      console.log('Remote user joined:', userId);
      peerIdRef.current = userId;
      setPeerId(userId);
      setStatus('calling');
      if (inCallRef.current) {
        startCall(userId);
      }
    });

    socket.on('call-cancelled', () => {
      console.log('Call cancelled by remote');
      cleanup();
    });

    socket.on('user-disconnected', (userId) => {
      if (userId === peerIdRef.current) {
        console.log('Remote user disconnected, ending call');
        cleanup();
      }
    });

    socket.on('signal', async ({ from, signal }) => {
      if (signal.type === 'hangup') {
        console.log('Remote user hung up');
        cleanup();
        return;
      }
      console.log('Signal received from', from, signal.type || 'ICE candidate');
      
      // Handle ICE candidates separately to ensure they are queued if remoteDescription is missing
      if (signal.candidate) {
        if (pc.current && pc.current.remoteDescription) {
          try {
            await pc.current.addIceCandidate(new RTCIceCandidate(signal));
          } catch (e) {
            console.warn('Error adding ICE candidate:', e instanceof Error ? e.message : String(e));
          }
        } else {
          console.log('Remote description not set yet. Queueing ICE candidate.');
          iceCandidateQueue.current.push({ from, candidate: signal });
        }
        return;
      }
      
      // If we haven't finished joining (getting media), queue the offer/answer
      if (!inCallRef.current) {
        console.log('Not yet in call. Queueing signal.');
        signalQueue.current.push({ from, signal });
        peerIdRef.current = from;
        setPeerId(from);
        return;
      }

      await handleSignal(from, signal);
    });

    return () => {
      socket.off('user-joined');
      socket.off('user-disconnected');
      socket.off('call-cancelled');
      socket.off('signal');
      signalQueue.current = [];
    };
  }, []); // Only on mount

  const handleSignal = async (from: string, signal: any) => {
    if (!pc.current) {
      await initPeerConnection(from);
    }

    try {
      if (!pc.current) return;

      if (signal.type === 'offer') {
        // Signaling collision handling
        if (pc.current.signalingState !== 'stable') {
          console.warn('Signaling collision: received offer in state', pc.current.signalingState);
          // Standard courtesy: if both are callers, one should yield
          // For simplicity, re-init if we receive an offer while we have an offer out
          console.log('Resetting PC due to collision');
          await initPeerConnection(from);
        }
        
        await pc.current.setRemoteDescription(new RTCSessionDescription(signal));
        
        // Process queued ICE candidates for this peer
        const candidates = iceCandidateQueue.current.filter(c => c.from === from);
        iceCandidateQueue.current = iceCandidateQueue.current.filter(c => c.from !== from);
        console.log('Processing', candidates.length, 'queued ICE candidates for remote offer');
        for (const item of candidates) {
          await pc.current.addIceCandidate(new RTCIceCandidate(item.candidate)).catch(e => console.warn('Queued ICE err:', e instanceof Error ? e.message : String(e)));
        }

        const answer = await pc.current.createAnswer();
        await pc.current.setLocalDescription(answer);
        socket.emit('signal', { to: from, signal: answer.toJSON ? answer.toJSON() : { type: answer.type, sdp: answer.sdp } });
        peerIdRef.current = from;
        setPeerId(from);
        
        // If we are answering an offer, we are connected enough for signaling
        if (status === 'idle') setStatus('connected');
      } else if (signal.type === 'answer') {
        if (pc.current.signalingState === 'have-local-offer') {
          await pc.current.setRemoteDescription(new RTCSessionDescription(signal));
          
          // Process queued ICE candidates
          const candidates = iceCandidateQueue.current.filter(c => c.from === from);
          iceCandidateQueue.current = iceCandidateQueue.current.filter(c => c.from !== from);
          console.log('Processing', candidates.length, 'queued ICE candidates for remote answer');
          for (const item of candidates) {
            await pc.current.addIceCandidate(new RTCIceCandidate(item.candidate)).catch(e => console.warn('Queued ICE err:', e instanceof Error ? e.message : String(e)));
          }

          setStatus('connected');
        } else {
          console.warn('Received answer but in state', pc.current.signalingState);
        }
      }
    } catch (err) {
      console.error(`Signal handling error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameras(videoDevices);
        if (videoDevices.length > 0 && !selectedCamera) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error(`Error listing cameras: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    getCameras();
  }, [inCall]);

  const initPeerConnection = async (targetId: string) => {
    console.log('Initializing PeerConnection for:', targetId);
    if (pc.current) {
      pc.current.close();
    }
    
    pc.current = new RTCPeerConnection(STUN_SERVERS);

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('signal', { to: targetId, signal: event.candidate.toJSON ? event.candidate.toJSON() : event.candidate });
      }
    };

    pc.current.ontrack = (event) => {
      console.log('Remote track received:', event.track.kind, 'stream count:', event.streams?.length, 'track enabled:', event.track.enabled);
      
      if (event.streams && event.streams[0]) {
        const incomingStream = event.streams[0];
        setRemoteStream(incomingStream);
      } else {
        setRemoteStream(prev => {
          if (prev) {
            if (!prev.getTracks().find(t => t.id === event.track.id)) {
              prev.addTrack(event.track);
            }
            return new MediaStream(prev.getTracks());
          }
          return new MediaStream([event.track]);
        });
      }
      
      setStatus('connected');
    };

    pc.current.oniceconnectionstatechange = () => {
      console.log('ICE Connection State:', pc.current?.iceConnectionState);
      const state = pc.current?.iceConnectionState;
      if (state === 'connected' || state === 'completed') {
        setStatus('connected');
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        setRemoteStream(null);
        setStatus('idle');
      }
    };

    const stream = localStream || localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.current?.addTrack(track, stream);
      });
    }
  };

  const startCall = async (targetId: string) => {
    await initPeerConnection(targetId);
    const offer = await pc.current?.createOffer();
    if (offer) {
      await pc.current?.setLocalDescription(offer);
      socket.emit('signal', { to: targetId, signal: offer.toJSON ? offer.toJSON() : { type: offer.type, sdp: offer.sdp } });
    }
    setStatus('calling');
  };

  useEffect(() => {
    if (!inCall) {
      handleJoin();
    }
  }, []);

  const handleJoin = async () => {
    try {
      console.log('Requesting media access...', callType);
      
      // Initial constraints
      let constraints: any = {
        video: callType === 'video' ? { 
          deviceId: selectedCamera ? { ideal: selectedCamera } : undefined,
          facingMode: selectedCamera ? undefined : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
      
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        console.warn('Initial getUserMedia failed, trying fallback...', e instanceof Error ? e.message : String(e));
        // Fallback for video
        if (callType === 'video') {
           stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } else {
           throw e;
        }
      }

      console.log('Media access granted');
      
      // Update camera list after getting permission to ensure labels are retrieved
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameras(videoDevices);
        console.log('Câmeras detectadas:', videoDevices.map(d => d.label || d.deviceId));
      } catch (e) {
        console.error(`Error updating devices after join: ${e instanceof Error ? e.message : String(e)}`);
      }
      
      setLocalStream(stream);
      localStreamRef.current = stream;
      setInCall(true);
      inCallRef.current = true;
      
      // Process any queued signals that arrived while we were getting media
      if (signalQueue.current.length > 0) {
        console.log('Processing', signalQueue.current.length, 'queued signals');
        const queueToProcess = [...signalQueue.current];
        signalQueue.current = [];
        for (const item of queueToProcess) {
          await handleSignal(item.from, item.signal);
        }
      } else if (peerIdRef.current) {
        // If no signals were queued but we know there's a peer (from user-joined)
        console.log('Joining existing peer:', peerIdRef.current);
        startCall(peerIdRef.current);
      }

      // Only notify others if aren't using autoJoin (which usually means we're answering)
      if (!autoJoin) {
        socket.emit('initiate-call', { type: callType });
      }
      socket.emit('join-call', 'default-room');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`Media access error: ${errMsg}`);
      alert('Erro ao acessar mídia. Verifique permissões de câmera e microfone.');
    }
  };

  const toggleMute = () => {
    const stream = localStream || localStreamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    const stream = localStream || localStreamRef.current;
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const switchCamera = async (deviceId: string) => {
    await performMediaSwitch(deviceId, undefined);
  };

  const performMediaSwitch = async (deviceId?: string, facingMode?: 'user' | 'environment') => {
    if (!inCall || callType !== 'video' || isRotating) return;
    
    setIsRotating(true);
    try {
      console.log('Switching media starting...', { deviceId, facingMode });
      const oldStream = localStream || localStreamRef.current;
      
      // 1. Detach UI first
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (pipLocalVideoRef.current) pipLocalVideoRef.current.srcObject = null;

      // 2. Stop and release ALL tracks and wait for the hardware to flush
      if (oldStream) {
        oldStream.getTracks().forEach(track => {
          track.enabled = false;
          track.stop();
          console.log('Released hardware track:', track.label);
        });
      }

      // 3. Significant pause (1s) to allow mobile OS to release lock on camera hardware
      await new Promise(resolve => setTimeout(resolve, 1000));

      let newStream: MediaStream;
      const getMedia = async (constraints: any) => {
        return await navigator.mediaDevices.getUserMedia({
          video: constraints,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      };

      try {
        if (deviceId) {
          console.log('Attempting deviceId switch (exact)...');
          newStream = await getMedia({ deviceId: { exact: deviceId } });
        } else {
          console.log('Attempting facingMode switch (ideal)...', facingMode);
          newStream = await getMedia({ facingMode: { ideal: facingMode } });
        }
      } catch (err) {
        console.warn('Primary constraint failed, falling back to relaxed constraints...', err instanceof Error ? err.message : String(err));
        try {
          if (deviceId) {
            newStream = await getMedia({ deviceId: { ideal: deviceId } });
          } else {
            newStream = await getMedia({ facingMode: facingMode });
          }
        } catch (err2) {
          console.warn('Secondary switch failed, trying generic video...', err2 instanceof Error ? err2.message : String(err2));
          newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        }
      }

      await handleNewStream(newStream);
      console.log('Media switch successful');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`Final media switch failure: ${errMsg}`);
      alert(`Não foi possível alternar a câmera: ${errMsg}`);
    } finally {
      setIsRotating(false);
    }
  };

  const rotateCamera = async () => {
    if (!inCall || callType !== 'video' || isRotating) return;
    
    // 1. Update device list
    let videoDevices: MediaDeviceInfo[] = [];
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      videoDevices = devices.filter(d => d.kind === 'videoinput' && d.deviceId);
      setCameras(videoDevices);
    } catch (e) {
      console.warn('Camera enumeration error:', e instanceof Error ? e.message : String(e));
      videoDevices = cameras;
    }

    // 2. Decide strategy
    if (videoDevices.length >= 2) {
      // If we see multiple devices, cycle them by deviceId
      const currentIndex = videoDevices.findIndex(c => c.deviceId === selectedCamera);
      const nextIndex = (currentIndex === -1) ? 0 : (currentIndex + 1) % videoDevices.length;
      const nextCamera = videoDevices[nextIndex];
      console.log(`Cycling to next camera by deviceId: ${nextCamera.label || nextCamera.deviceId}`);
      await performMediaSwitch(nextCamera.deviceId, undefined);
    } else {
      // Single/Unknown device list - use facingMode toggle (best for modern mobile browsers)
      const nextFacing = currentFacingMode === 'user' ? 'environment' : 'user';
      console.log(`Toggling facingMode fallback to ${nextFacing}`);
      await performMediaSwitch(undefined, nextFacing);
    }
  };

  const handleNewStream = async (newStream: MediaStream) => {
    if (!newStream) return;
    
    const videoTrack = newStream.getVideoTracks()[0];
    const audioTrack = newStream.getAudioTracks()[0];

    // 1. Sync WebRTC stack
    if (pc.current && pc.current.signalingState !== 'closed') {
      const senders = pc.current.getSenders();
      const videoSender = senders.find(s => s.track?.kind === 'video');
      const audioSender = senders.find(s => s.track?.kind === 'audio');

      if (videoSender && videoTrack) {
        await videoSender.replaceTrack(videoTrack).catch(e => {
          console.error(`Video replace err: ${e instanceof Error ? e.message : String(e)}`);
        });
      }
      if (audioSender && audioTrack) {
        await audioSender.replaceTrack(audioTrack).catch(e => {
          console.error(`Audio replace err: ${e instanceof Error ? e.message : String(e)}`);
        });
      }
    }

    // 2. Sync State
    const tracks: MediaStreamTrack[] = [];
    if (videoTrack) tracks.push(videoTrack);
    if (audioTrack) tracks.push(audioTrack);
    const combinedStream = new MediaStream(tracks);
    
    setLocalStream(combinedStream);
    localStreamRef.current = combinedStream;

    // Update facing mode state from settings if possible, otherwise we infer it later
    const settings = videoTrack?.getSettings();
    const label = videoTrack?.label?.toLowerCase() || '';

    if (settings?.facingMode) {
      setCurrentFacingMode(settings.facingMode as 'user' | 'environment');
    } else if (label) {
      if (label.includes('front') || label.includes('selfie') || label.includes('user')) {
        setCurrentFacingMode('user');
      } else if (label.includes('back') || label.includes('rear') || label.includes('environment')) {
        setCurrentFacingMode('environment');
      }
    } else if (settings?.deviceId) {
      // Try to determine facing mode from list if settings.facingMode is missing
      const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
      const device = devices.find(d => d.deviceId === settings.deviceId);
      if (device?.label) {
        const dLabel = device.label.toLowerCase();
        if (dLabel.includes('front') || dLabel.includes('selfie') || dLabel.includes('user')) {
          setCurrentFacingMode('user');
        } else if (dLabel.includes('back') || dLabel.includes('rear') || dLabel.includes('environment')) {
          setCurrentFacingMode('environment');
        }
      }
    }
    if (settings?.deviceId) setSelectedCamera(settings.deviceId);
    
    console.log('Media state synchronized');
  };


  const cleanup = () => {
    try {
      if (peerIdRef.current) {
        socket.emit('signal', { to: peerIdRef.current, signal: { type: 'hangup' } });
      }
      socket.emit('cancel-call');
    } catch (e) {
      console.warn('Error during socket cleanup:', e instanceof Error ? e.message : String(e));
    }

    setInCall(false);
    inCallRef.current = false;
    setStatus('idle');
    const stream = localStream || localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    localStreamRef.current = null;
    setRemoteStream(null);
    if (pc.current) {
      try {
        pc.current.close();
      } catch (e) {}
      pc.current = null;
    }
    setPeerId(null);
    peerIdRef.current = null;
    
    // Always return to home screen on cleanup
    setActiveTab('home');
  };


  return (
    <div className="flex-1 bg-[#0B1120] p-4 flex flex-col h-full overflow-hidden">
      <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
        <div className="flex-1 flex flex-col space-y-4">
          {callType === 'video' ? (
            <div className="flex-1 relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 ring-1 ring-white/5 min-h-[400px]">
                
                {/* Main Video View */}
                <div className="absolute inset-0 w-full h-full">
                  <AnimatePresence mode="popLayout">
                    {!isSwapped ? (
                      <motion.div
                        key="remote-main"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-900"
                      >
                        <VideoView
                          videoRef={remoteVideoRef}
                          stream={remoteStream}
                          className={`w-full h-full object-cover transition-opacity duration-500 ${!remoteStream ? 'opacity-0' : 'opacity-100'}`}
                        />
                        {!remoteStream && (
                          <div className="flex flex-col items-center justify-center text-slate-500 text-center p-8">
                            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse border-2 border-slate-700">
                              <User size={48} />
                            </div>
                            {status === 'calling' ? (
                              <div>
                                <h3 className="text-xl font-bold text-white mb-2">Chamando...</h3>
                                <p className="text-sm">Aguardando o outro usuário aceitar</p>
                              </div>
                            ) : (
                              <div>
                                <h3 className="text-xl font-bold text-white mb-2">Buscando Par...</h3>
                                <p className="text-sm">Abra este app em outro dispositivo para conectar</p>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="absolute bottom-6 left-6 flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 z-10">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                          <span className="text-xs font-bold text-white">REDE LOCAL</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="local-main"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 w-full h-full bg-slate-900"
                      >
                        <VideoView
                          videoRef={localVideoRef}
                          stream={localStream}
                          muted
                          className={`w-full h-full object-cover transition-opacity duration-500 ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
                        />
                        {isVideoOff && (
                          <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-500">
                            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                              <User size={48} />
                            </div>
                            <span className="font-medium">Sua câmera está desligada</span>
                          </div>
                        )}
                        <div className="absolute bottom-6 left-6 flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 z-10">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-xs font-bold text-white">VOCÊ (PRINCIPAL)</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* PiP (Picture-in-Picture) Window */}
                <motion.div
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.1}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onTap={() => setIsSwapped(!isSwapped)}
                  className="absolute top-6 right-6 w-32 h-48 sm:w-48 sm:h-64 bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 cursor-pointer z-20 group"
                >
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {isSwapped ? (
                      /* Remote is in PiP */
                      <div className="w-full h-full">
                        <VideoView
                          videoRef={pipRemoteVideoRef}
                          stream={remoteStream}
                          className={`w-full h-full object-cover pointer-events-none ${!remoteStream ? 'opacity-0' : 'opacity-100'}`}
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/10 uppercase tracking-tighter">
                          Remote
                        </div>
                      </div>
                    ) : (
                      /* Local is in PiP */
                      <div className="w-full h-full">
                        <VideoView
                          videoRef={pipLocalVideoRef}
                          stream={localStream}
                          muted
                          className={`w-full h-full object-cover pointer-events-none ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
                        />
                        {isVideoOff && (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                            <User size={24} className="text-slate-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/10 uppercase tracking-tighter">
                          Você
                        </div>
                      </div>
                    )}
                    {/* PiP Actions Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/60 backdrop-blur-[2px]">
                      <div className="flex flex-col items-center space-y-2 transform scale-75 group-hover:scale-100 transition-transform">
                         <Repeat className="text-white w-8 h-8" />
                         <span className="text-white text-[10px] font-bold uppercase tracking-widest">Inverter</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Toggle Position Button (Bottom Right of main view) */}
                <button
                  onClick={() => setIsSwapped(!isSwapped)}
                  className="absolute bottom-6 right-6 p-4 bg-blue-600/20 hover:bg-blue-600/40 backdrop-blur-md rounded-2xl border border-blue-500/30 text-blue-400 z-10 transition-all hover:scale-110 active:scale-95 shadow-xl"
                  title="Inverter Visualização"
                >
                  <ArrowLeftRight size={24} />
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center space-y-8 bg-slate-950 rounded-3xl border border-slate-800 shadow-inner">
                {/* Robust Audio Playback for Remote Stream */}
                <VideoView 
                  videoRef={remoteVideoRef} 
                  stream={remoteStream} 
                  className="fixed inset-0 w-1 h-1 opacity-0 pointer-events-none" 
                  aria-hidden="true" 
                />
                
                <div className="relative">
                  <div className="w-48 h-48 bg-slate-900 rounded-full flex items-center justify-center border-2 border-slate-800 shadow-2xl relative z-10 overflow-hidden">
                    {remoteStream ? (
                      <div className="w-full h-full bg-blue-600/20 flex items-center justify-center animate-pulse">
                         <User size={80} className="text-blue-400" />
                      </div>
                    ) : (
                      <User size={80} className="text-slate-700" />
                    )}
                  </div>
                  {status === 'connected' && (
                    <div className="absolute -inset-4 bg-blue-500/10 rounded-full animate-ping opacity-50" />
                  )}
                </div>
                
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                    {status === 'connected' ? 'Chamada de Áudio' : status === 'calling' ? 'Chamando...' : 'Buscando conexão...'}
                  </h2>
                  <p className="text-slate-500 font-medium">
                    {status === 'connected' ? 'CONECTADO COM SUCESSO' : 'REDE LOCAL'}
                  </p>
                </div>

                <div className="flex items-center space-x-3 bg-slate-900/50 px-4 py-2 rounded-full border border-white/5">
                  <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-slate-600'} animate-pulse`} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status: {status}</span>
                </div>
              </div>
            )}

      {/* Control bar */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-4 sm:p-6 rounded-[2.5rem] flex flex-col items-center space-y-4 shadow-2xl">
        <div className="flex items-center justify-center space-x-4 sm:space-x-8">
          <button
            onClick={toggleMute}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90 ${
              isMuted ? 'bg-red-500 text-white ring-4 ring-red-500/20' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
          </button>
          
          <button
            onClick={cleanup}
            className="w-20 h-20 sm:w-24 sm:h-24 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-red-500/30 transition-all hover:scale-105 active:scale-90"
          >
            <PhoneOff size={36} />
          </button>

          {callType === 'video' && (
            <>
              <button
                onClick={toggleVideo}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90 ${
                  isVideoOff ? 'bg-red-500 text-white ring-4 ring-red-500/20' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                {isVideoOff ? <VideoOff size={28} /> : <Video size={28} />}
              </button>

              <button
                onClick={() => rotateCamera()}
                disabled={isRotating}
                className={`w-14 h-14 sm:w-16 sm:h-16 bg-slate-800 text-gray-300 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90 ${
                  isRotating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700'
                }`}
                title="Trocar Câmera"
              >
                <RefreshCw size={28} className={isRotating ? 'animate-spin' : ''} />
              </button>

            </>
          )}
        </div>

        {/* Camera Selector Dropdown (Desktop/Visible on large screens) */}
        {cameras.length > 1 && inCall && callType === 'video' && (
          <div className="hidden lg:flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10 group">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selecionar Câmera:</span>
            <select
              value={selectedCamera}
              onChange={(e) => switchCamera(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer hover:text-blue-400 transition-colors"
            >
              {cameras.map((camera) => (
                <option key={camera.deviceId} value={camera.deviceId} className="bg-slate-900 text-white">
                  {camera.label || `Câmera ${cameras.indexOf(camera) + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
}

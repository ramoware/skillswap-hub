'use client';

import { useEffect, useState, useRef } from 'react';
import { Users, MessageCircle, Share, Phone, Mic, MicOff, Video, VideoOff, Lock, UserMinus } from 'lucide-react';

interface Message {
  id: number;
  message: string;
  user: string;
  timestamp: string;
}

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
}

interface LiveSessionProps {
  sessionId: string;
  userName: string;
  isHost?: boolean;
  onClose: () => void;
}

export default function LiveSession({ sessionId, userName, isHost = false, onClose }: LiveSessionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showHostPassword, setShowHostPassword] = useState(false);
  const [hostPassword, setHostPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [sessionPassword, setSessionPassword] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Initialize session
    initializeSession();
    addMessage('System', 'Welcome to the live session!');
    
    return () => {
      // Cleanup on unmount
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [sessionId]);

  const initializeSession = async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    
    try {
      // Add current user to participants first (only if not already added)
      setParticipants(prev => {
        const existingUser = prev.find(p => p.id === 'current-user');
        if (!existingUser) {
          return [...prev, {
            id: 'current-user',
            name: userName,
            isHost,
            isMuted: false,
            isVideoOff: false
          }];
        }
        return prev;
      });

      // Check if media devices are available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        addMessage('System', 'Media devices not supported in this browser.');
        setIsInitializing(false);
        return;
      }

      // Try to get user media with fallback options
      let stream: MediaStream | null = null;
      
      try {
        // First try with both video and audio
        console.log('Attempting to access camera and microphone...');
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }, 
          audio: true 
        });
        console.log('Successfully accessed camera and microphone');
      } catch (videoError) {
        console.log('Video access failed, trying audio only:', videoError);
        addMessage('System', `Camera access failed: ${videoError.name}. Trying audio only...`);
        try {
          // If video fails, try audio only
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: false, 
            audio: true 
          });
          addMessage('System', 'Video access denied. Audio only mode enabled.');
        } catch (audioError) {
          console.log('Audio access failed, trying video only:', audioError);
          addMessage('System', `Audio access failed: ${audioError.name}. Trying video only...`);
          try {
            // If audio fails, try video only
            stream = await navigator.mediaDevices.getUserMedia({ 
              video: { 
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
              }, 
              audio: false 
            });
            addMessage('System', 'Audio access denied. Video only mode enabled.');
          } catch (bothError) {
            console.log('Both video and audio failed:', bothError);
            const errorMsg = bothError instanceof Error ? bothError.message : 'Unknown error';
            const errorName = bothError instanceof Error ? bothError.name : 'Unknown';
            
            if (errorName === 'NotReadableError') {
              addMessage('System', 'Camera/Microphone is being used by another application.');
              addMessage('System', 'Please close other apps using your camera (Zoom, Teams, etc.) and try again.');
            } else if (errorName === 'NotAllowedError') {
              addMessage('System', 'Camera/Microphone access denied by browser.');
              addMessage('System', 'Please allow camera and microphone permissions and refresh the page.');
            } else if (errorName === 'NotFoundError') {
              addMessage('System', 'No camera or microphone found on this device.');
            } else {
              addMessage('System', `Unable to access camera and microphone. Error: ${errorName} - ${errorMsg}`);
              addMessage('System', 'Please check browser permissions and ensure no other apps are using your camera.');
            }
            setIsInitializing(false);
            return;
          }
        }
      }
      
      if (stream && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localStreamRef.current = stream;
        
        // Update participant status based on available tracks
        const hasAudio = stream.getAudioTracks().length > 0;
        const hasVideo = stream.getVideoTracks().length > 0;
        
        if (!hasAudio) {
          setIsMuted(true);
        }
        if (!hasVideo) {
          setIsVideoOff(true);
        }
        
        addMessage('System', 'Media devices connected successfully.');
      }
      
    } catch (error) {
      console.error('Error initializing session:', error);
      addMessage('System', 'Failed to initialize session. Please refresh and try again.');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (user: string, message: string) => {
    const messageObj: Message = {
      id: Date.now(),
      message,
      user,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, messageObj]);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      // Mock sending message
      addMessage(userName, newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        addMessage('System', `${audioTrack.enabled ? 'Microphone enabled' : 'Microphone muted'}`);
      } else {
        addMessage('System', 'No audio track available. Cannot toggle microphone.');
      }
    } else {
      addMessage('System', 'No media stream available. Please refresh the session.');
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        addMessage('System', `${videoTrack.enabled ? 'Camera enabled' : 'Camera disabled'}`);
      } else {
        addMessage('System', 'No video track available. Cannot toggle camera.');
      }
    } else {
      addMessage('System', 'No media stream available. Please refresh the session.');
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => {
            if (track.kind === 'video' && track.label.includes('screen')) {
              track.stop();
            }
          });
        }
        setIsScreenSharing(false);
        addMessage('System', 'Screen sharing stopped');
        
        // Restore camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true, 
          audio: true 
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        // Replace video track with screen share
        if (localStreamRef.current) {
          const audioTrack = localStreamRef.current.getAudioTracks()[0];
          const screenVideoTrack = screenStream.getVideoTracks()[0];
          
          // Create new stream with audio from mic and video from screen
          const newStream = new MediaStream();
          if (audioTrack) newStream.addTrack(audioTrack);
          if (screenVideoTrack) newStream.addTrack(screenVideoTrack);
          
          localStreamRef.current = newStream;
        }
        
        setIsScreenSharing(true);
        addMessage('System', 'Screen sharing started');
        
        // Stop screen share when user clicks "Stop sharing"
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          toggleScreenShare();
        });
      }
    } catch (error) {
      console.error('Error with screen sharing:', error);
      addMessage('System', 'Unable to start screen sharing');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    addMessage('System', 'Session ended');
    onClose();
  };

  const handleSetHostPassword = () => {
    setShowHostPassword(true);
  };

  const confirmHostPassword = () => {
    if (hostPassword.trim()) {
      addMessage('System', `Host password set: ${hostPassword}`);
      setShowHostPassword(false);
      setHostPassword('');
    }
  };

  const removeParticipant = (participantId: string) => {
    if (isHost) {
      setParticipants(prev => prev.filter(p => p.id !== participantId));
      addMessage('System', `Participant removed from session`);
    }
  };

  const requestHostAccess = () => {
    setShowPasswordPrompt(true);
  };

  const confirmHostAccess = () => {
    // In a real app, this would verify the password with the server
    if (sessionPassword.trim()) {
      addMessage('System', 'Host access granted');
      setShowPasswordPrompt(false);
      setSessionPassword('');
    } else {
      addMessage('System', 'Invalid host password');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Live Session</h2>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{participants.length + 1} participants</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Video Area */}
          <div className="flex-1 bg-gray-900 flex items-center justify-center relative">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {!localStreamRef.current && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-white text-center max-w-md">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">Media Access Required</p>
                  <p className="text-sm opacity-75 mb-4">Please allow camera and microphone access</p>
                  
                  <div className="text-xs opacity-60 mb-4 text-left bg-gray-800 p-3 rounded">
                    <p className="mb-1">Common solutions:</p>
                    <p>• Check browser permissions for camera/microphone</p>
                    <p>• Close other apps using your camera</p>
                    <p>• Try refreshing the page</p>
                    <p>• Use HTTPS (required for media access)</p>
                  </div>
                  
                  <button
                    onClick={initializeSession}
                    disabled={isInitializing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isInitializing ? 'Requesting Access...' : 'Retry Media Access'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-700'} text-white hover:bg-opacity-80`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full ${isVideoOff ? 'bg-red-600' : 'bg-gray-700'} text-white hover:bg-opacity-80`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-full ${isScreenSharing ? 'bg-green-600' : 'bg-gray-700'} text-white hover:bg-opacity-80`}
              >
                <Share className="w-6 h-6" />
              </button>
              <button 
                onClick={handleEndCall}
                className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
              >
                <Phone className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="w-80 border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Chat</h3>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`${message.user === 'System' ? 'text-center' : ''}`}>
                  {message.user !== 'System' && (
                    <div className="font-medium text-sm text-gray-700 mb-1">
                      {message.user}
                    </div>
                  )}
                  <div className={`p-2 rounded-lg ${
                    message.user === 'System' 
                      ? 'bg-gray-100 text-gray-600 text-sm' 
                      : 'bg-blue-100 text-gray-900'
                  }`}>
                    {message.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Participants Section */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="h-5 w-5" />
                  <h3 className="font-semibold">Participants ({participants.length})</h3>
                </div>
                {isHost && (
                  <button
                    onClick={handleSetHostPassword}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <Lock className="h-4 w-4" />
                    Set Password
                  </button>
                )}
                {!isHost && (
                  <button
                    onClick={requestHostAccess}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <Lock className="h-4 w-4" />
                    Host Access
                  </button>
                )}
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-medium">{participant.name}</span>
                        {participant.isHost && <span className="text-xs text-blue-600 ml-1">(Host)</span>}
                        <div className="flex gap-1">
                          {participant.isMuted && <span className="text-xs text-red-600">🔇</span>}
                          {participant.isVideoOff && <span className="text-xs text-red-600">📹</span>}
                        </div>
                      </div>
                    </div>
                    {isHost && participant.id !== 'current-user' && (
                      <button
                        onClick={() => removeParticipant(participant.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Remove participant"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Host Password Modal */}
        {showHostPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Set Host Password</h3>
              <input
                type="password"
                value={hostPassword}
                onChange={(e) => setHostPassword(e.target.value)}
                placeholder="Enter host password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowHostPassword(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmHostPassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Set Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Host Access Prompt */}
        {showPasswordPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Enter Host Password</h3>
              <input
                type="password"
                value={sessionPassword}
                onChange={(e) => setSessionPassword(e.target.value)}
                placeholder="Enter session password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowPasswordPrompt(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmHostAccess}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Join as Host
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

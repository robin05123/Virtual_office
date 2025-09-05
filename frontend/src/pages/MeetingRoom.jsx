import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Phaser from "phaser";
import VirtualOfficeScene from "../components/VirtualOfficeScene";
import JoinForm from "../components/JoinForm";
import GameUI from "../components/GameUI";
import WebRTCManager from "../components/WebRTCManager";
import RemoteVideoGrid from "../components/RemoteVideoGrid";
import "../styles/globals.css";

const MeetingRoom = ({ onJoinOffice, onLeaveOffice }) => {
  const [playerName, setPlayerName] = useState("");
  const [joined, setJoined] = useState(false);
  const [socket, setSocket] = useState(null);
  const gameRef = useRef(null);
  const localVideoRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const webRTCManagerRef = useRef(null);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    const newSocket = io("http://localhost:3000", {
      auth: { username: playerName },
    });
    setSocket(newSocket);
    setJoined(true);

    // Notify parent that user has joined the office
    if (onJoinOffice) onJoinOffice();

    // Initialize WebRTC manager
    webRTCManagerRef.current = new WebRTCManager(
      newSocket, 
      localVideoRef,
      (userId, stream) => {
        console.log('Remote stream received for user:', userId);
        setRemoteStreams(prev => new Map(prev.set(userId, stream)));
      },
      (userId) => {
        console.log('User disconnected:', userId);
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.delete(userId);
          return newMap;
        });
      }
    );

    if (!gameRef.current) {
      const config = {
        type: Phaser.AUTO,
        width: 1200,
        height: 800,
        parent: "phaser-container",
        physics: {
          default: "arcade",
          arcade: { debug: false, gravity: { y: 0 } },
        },
        scene: new VirtualOfficeScene(playerName, newSocket),
      };
      
      // Add scene data
      config.scene = {
        key: 'default',
        create: function() {
          const scene = new VirtualOfficeScene();
          scene.init({ playerName, setSocketRef: (socket) => {} });
          scene.preload.call(this);
          scene.create.call(this);
        }
      };
      
      gameRef.current = new Phaser.Game(config);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("newPlayer", (player) => {
      console.log('New player joined:', player);
      setProfiles((prev) => [...prev, player]);
    });

    socket.on("playerDisconnected", (id) => {
      console.log('Player disconnected:', id);
      setProfiles((prev) => prev.filter((p) => p.playerId !== id));
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    });

    socket.on("chatMessage", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on("currentPlayers", (players) => {
      console.log('Current players:', players);
      setProfiles(Object.values(players));
    });

    return () => {
      socket.off("chatMessage");
      socket.off("currentPlayers");
      socket.off("newPlayer");
      socket.off("playerDisconnected");
    };
  }, [socket]);

  useEffect(() => {
    async function getMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(e => {
            console.log('Error playing local video:', e);
          });
        }
        // Set initial stream in WebRTC manager
        if (webRTCManagerRef.current) {
          await webRTCManagerRef.current.setLocalStream(stream);
        }
      } catch (err) {
        console.error("Media access error:", err);
      }
    }

    getMedia();
  }, []);

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;

    socket.emit("chatMessage", { sender: playerName, message: chatInput });
    setChatInput("");
  };

  const handleToggleAudio = () => {
    localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setAudioEnabled((prev) => !prev);
  };

  const handleToggleVideo = () => {
    localStream?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setVideoEnabled((prev) => !prev);
  };

  const handleToggleScreenShare = async () => {
    if (!webRTCManagerRef.current) {
      console.error('WebRTC manager not initialized');
      return;
    }

    if (!isScreenSharing) {
      try {
        await webRTCManagerRef.current.startScreenShare();
        setIsScreenSharing(true);
        console.log('Screen sharing started');
      } catch (err) {
        console.error("Screen share error:", err);
      }
    } else {
      await webRTCManagerRef.current.stopScreenShare();
      setIsScreenSharing(false);
      console.log('Screen sharing stopped');
    }
  };

  const handleLeaveMeeting = () => {
    // Clean up WebRTC connections
    if (webRTCManagerRef.current) {
      webRTCManagerRef.current.destroy();
      webRTCManagerRef.current = null;
    }

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    setJoined(false);
    setPlayerName("");
    setChatMessages([]);
    setProfiles([]);
    setRemoteStreams(new Map());
    setIsScreenSharing(false);
    
    if (onLeaveOffice) onLeaveOffice();
  };

  if (!joined) {
    return (
      <JoinForm
        playerName={playerName}
        setPlayerName={setPlayerName}
        handleJoin={handleJoin}
      />
    );
  }

  return (
    <div className="virtual-office-container">
      <div id="phaser-container" className="game-container" />
      
      <RemoteVideoGrid remoteStreams={remoteStreams} profiles={profiles} />

      <GameUI
        profiles={profiles}
        localVideoRef={localVideoRef}
        videoEnabled={videoEnabled}
        audioEnabled={audioEnabled}
        showControls={showControls}
        chatMessages={chatMessages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        handleToggleAudio={handleToggleAudio}
        handleToggleVideo={handleToggleVideo}
        setShowControls={setShowControls}
        handleChatSubmit={handleChatSubmit}
        playerName={playerName}
        handleLeaveMeeting={handleLeaveMeeting}
        handleToggleScreenShare={handleToggleScreenShare}
        isScreenSharing={isScreenSharing}
      />

    </div>
  );
};

export default MeetingRoom;

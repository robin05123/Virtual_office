import { useEffect, useRef, useState } from 'react';

class WebRTCManager {
  constructor(socket, localVideoRef, onRemoteStream, onUserDisconnected) {
    this.socket = socket;
    this.localVideoRef = localVideoRef;
    this.onRemoteStream = onRemoteStream;
    this.onUserDisconnected = onUserDisconnected;
    this.peers = new Map();
    this.localStream = null;
    this.isScreenSharing = false;
    this.originalStream = null;
    
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    this.socket.on('user-connected', (userId) => {
      console.log('User connected:', userId);
      this.createPeerConnection(userId, true);
    });

    this.socket.on('user-disconnected', (userId) => {
      console.log('User disconnected:', userId);
      if (this.peers.has(userId)) {
        this.peers.get(userId).close();
        this.peers.delete(userId);
      }
      if (this.onUserDisconnected) {
        this.onUserDisconnected(userId);
      }
    });

    this.socket.on('webrtc-offer', async ({ from, offer }) => {
      console.log('Received offer from:', from);
      await this.handleOffer(from, offer);
    });

    this.socket.on('webrtc-answer', async ({ from, answer }) => {
      console.log('Received answer from:', from);
      await this.handleAnswer(from, answer);
    });

    this.socket.on('webrtc-ice-candidate', ({ from, candidate }) => {
      console.log('Received ICE candidate from:', from);
      this.handleIceCandidate(from, candidate);
    });

    // Listen for new players joining
    this.socket.on('newPlayer', (player) => {
      if (player.playerId !== this.socket.id) {
        console.log('New player joined, creating peer connection:', player.playerId);
        setTimeout(() => {
          this.createPeerConnection(player.playerId, true);
        }, 1000);
      }
    });

    // Listen for current players
    this.socket.on('currentPlayers', (players) => {
      Object.values(players).forEach(player => {
        if (player.playerId !== this.socket.id) {
          console.log('Existing player found, creating peer connection:', player.playerId);
          setTimeout(() => {
            this.createPeerConnection(player.playerId, true);
          }, 1000);
        }
      });
    });
  }

  async createPeerConnection(userId, isInitiator = false) {
    if (this.peers.has(userId)) {
      console.log('Peer connection already exists for:', userId);
      return;
    }

    console.log('Creating peer connection for:', userId, 'as initiator:', isInitiator);

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    });

    this.peers.set(userId, peerConnection);

    // Add local stream to peer connection
    if (this.localStream) {
      console.log('Adding local stream tracks to peer connection');
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote stream from:', userId);
      if (this.onRemoteStream) {
        this.onRemoteStream(userId, event.streams[0]);
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to:', userId);
        this.socket.emit('webrtc-ice-candidate', {
          target: userId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state changed for', userId, ':', peerConnection.connectionState);
    };

    if (isInitiator) {
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        console.log('Sending offer to:', userId);
        this.socket.emit('webrtc-offer', { target: userId, offer });
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    }
  }

  async handleOffer(from, offer) {
    try {
      if (!this.peers.has(from)) {
        await this.createPeerConnection(from, false);
      }

      const peerConnection = this.peers.get(from);
      await peerConnection.setRemoteDescription(offer);
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      console.log('Sending answer to:', from);
      this.socket.emit('webrtc-answer', { target: from, answer });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  async handleAnswer(from, answer) {
    try {
      const peerConnection = this.peers.get(from);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  async handleIceCandidate(from, candidate) {
    try {
      const peerConnection = this.peers.get(from);
      if (peerConnection) {
        await peerConnection.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  async setLocalStream(stream) {
    console.log('Setting local stream');
    this.localStream = stream;
    
    // Update local video element
    if (this.localVideoRef.current) {
      this.localVideoRef.current.srcObject = stream;
    }
    
    // Update all peer connections with new stream
    for (const [userId, peerConnection] of this.peers) {
      try {
        // Remove old tracks
        const senders = peerConnection.getSenders();
        for (const sender of senders) {
          if (sender.track) {
            peerConnection.removeTrack(sender);
          }
        }
        
        // Add new tracks
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });
        
        // Create new offer to update the connection
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        console.log('Sending updated offer to:', userId);
        this.socket.emit('webrtc-offer', { target: userId, offer });
      } catch (error) {
        console.error('Error updating stream for peer:', userId, error);
      }
    }
  }

  async startScreenShare() {
    try {
      console.log('Starting screen share');
      // Store original stream
      this.originalStream = this.localStream;
      
      // Get screen share stream
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });
      
      // Update local stream and peer connections
      await this.setLocalStream(screenStream);
      
      this.isScreenSharing = true;
      
      // Handle screen share end
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        console.log('Screen share ended by user');
        this.stopScreenShare();
      });
      
      return screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  async stopScreenShare() {
    if (!this.isScreenSharing || !this.originalStream) {
      console.log('Not screen sharing or no original stream');
      return;
    }
    
    console.log('Stopping screen share');
    
    // Stop screen share tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    
    // Restore original stream
    await this.setLocalStream(this.originalStream);
    
    this.isScreenSharing = false;
    this.originalStream = null;
  }

  destroy() {
    console.log('Destroying WebRTC manager');
    // Close all peer connections
    for (const [userId, peerConnection] of this.peers) {
      peerConnection.close();
    }
    this.peers.clear();
    
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    // Remove socket listeners
    this.socket.off('user-connected');
    this.socket.off('user-disconnected');
    this.socket.off('webrtc-offer');
    this.socket.off('webrtc-answer');
    this.socket.off('webrtc-ice-candidate');
    this.socket.off('newPlayer');
    this.socket.off('currentPlayers');
  }
}




export default WebRTCManager;
import React, { useEffect, useRef, useState } from 'react';

const RemoteVideoGrid = ({ remoteStreams, profiles }) => {
  if (!remoteStreams || remoteStreams.size === 0) return null;

  return (
    <div className="remote-video-grid">
      {Array.from(remoteStreams.entries()).map(([userId, stream]) => {
        const profile = profiles.find(p => p.playerId === userId);
        return (
          <RemoteVideoItem 
            key={userId} 
            userId={userId} 
            stream={stream} 
            playerName={profile?.playerName || `User ${userId.substring(0, 8)}`}
          />
        );
      })}
    </div>
  );
};

const RemoteVideoItem = ({ userId, stream, playerName }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => {
        console.log('Error playing remote video:', e);
      });
    }
  }, [stream]);

  return (
    <div className="remote-video-item">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="remote-video"
      />
      <div className="remote-video-label">
        {playerName}
      </div>
    </div>
  );
};

export default RemoteVideoGrid;
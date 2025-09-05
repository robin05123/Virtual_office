import React from "react";

const GameUI = ({
  profiles,
  localVideoRef,
  videoEnabled,
  audioEnabled,
  showControls,
  chatMessages,
  chatInput,
  setChatInput,
  handleToggleAudio,
  handleToggleVideo,
  setShowControls,
  handleChatSubmit,
  playerName,
  handleLeaveMeeting,
  handleToggleScreenShare,
  isScreenSharing,
}) => {
  return (
    <>
      {/* User List Panel */}
      <div className="users-panel">
        <div className="panel-header">
          <h3>Online ({profiles.length})</h3>
        </div>
        <div className="users-list">
          {profiles.map((profile) => (
            <div key={profile.playerId} className="user-item">
              <div className="user-avatar">
                {profile.playerName.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{profile.playerName}</span>
              <div className="user-status online"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Panel */}
      <div className="video-panel">
        <div className="video-container">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="local-video"
          />
          {!videoEnabled && (
            <div className="video-disabled">
              <span>📹</span>
              <p>Camera Off</p>
            </div>
          )}
          <div className="video-label">{playerName} (You)</div>
        </div>
      </div>

      {/* Controls */}
      <div className={`controls-panel ${showControls ? "visible" : "hidden"}`}>
        <button
          className={`control-btn ${!audioEnabled ? "disabled" : ""}`}
          onClick={handleToggleAudio}
          title={audioEnabled ? "Mute Audio" : "Unmute Audio"}
        >
          {audioEnabled ? "🎤" : "🔇"}
        </button>

        <button
          className={`control-btn ${!videoEnabled ? "disabled" : ""}`}
          onClick={handleToggleVideo}
          title={videoEnabled ? "Turn Off Camera" : "Turn On Camera"}
        >
          {videoEnabled ? "📹" : "📷"}
        </button>
        {/* Screen Share button with only icon, no text */}
        <button
          className="control-btn"
          onClick={handleToggleScreenShare}
          title={isScreenSharing ? "Stop Screen Share" : "Start Screen Share"}
          aria-label={
            isScreenSharing ? "Stop Screen Share" : "Start Screen Share"
          }
        >
          {isScreenSharing ? "🛑" : "🖥️"}
        </button>
        <button
          className="control-btn settings"
          onClick={() => setShowControls(!showControls)}
          title="Toggle Controls"
        >
          ⚙️
        </button>
        <button
          className="control-btn leave"
          onClick={handleLeaveMeeting}
          title="Leave Meeting"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="28"
            height="28"
            fill="white"
            style={{ transform: "rotate(135deg)" }} // Rotate to make it look like a hang-up
          >
            <path d="M21 15.46l-5.27-.61a.998.998 0 0 0-.99.59l-1.2 2.75a16.01 16.01 0 0 1-6.17-6.17l2.75-1.2a1 1 0 0 0 .59-.99l-.61-5.27a1 1 0 0 0-.99-.89H3.01C2.46 4.67 2 5.13 2 5.68c0 9.6 7.79 17.39 17.39 17.39.55 0 1.01-.46 1.01-1.01v-4.42c0-.5-.38-.92-.89-.99z" />
          </svg>
        </button>
      </div>

      {/* Chat Panel */}
      <div className="chat-panel">
        <div className="chat-header">
          <h3>Team Chat</h3>
          <div className="chat-status">
            <span className="status-dot"></span>
            <span>Live</span>
          </div>
        </div>

        <div className="chat-messages">
          {chatMessages.map((msg, index) => (
            <div key={index} className="chat-message">
              {typeof msg === "object" ? (
                <>
                  <span className="message-sender">{msg.sender}:</span>
                  <span className="message-text">{msg.message}</span>
                </>
              ) : (
                <span className="message-text">{msg}</span>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleChatSubmit} className="chat-input-form">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message..."
            className="chat-input"
            maxLength={200}
          />
          <button type="submit" className="chat-send-btn">
            <span>Send</span>
          </button>
        </form>
      </div>
    </>
  );
};

export default GameUI;

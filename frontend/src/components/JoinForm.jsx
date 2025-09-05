import React from 'react';

const JoinForm = ({ playerName, setPlayerName, handleJoin }) => {
  return (
    <div className="join-container">
      <div className="join-background"></div>
      <div className="join-content">
        <div className="join-card">
          <div className="join-header">
            <h1 className="join-title">Virtual Office Odyssey</h1>
            <p className="join-subtitle">Connect, collaborate, and create together in your virtual workspace</p>
          </div>
          
          <form onSubmit={handleJoin} className="join-form">
            <div className="input-group">
              <label htmlFor="playerName" className="input-label">
                Your Name
              </label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your display name"
                className="name-input"
                required
                maxLength={20}
              />
            </div>
            
            <button type="submit" className="join-button">
              <span className="button-text">Join Office</span>
              <div className="button-gradient"></div>
            </button>
          </form>
          
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">💬</span>
              <span>Chat with your colleagues in real-time</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📹</span>
              <span>Video calls and screen sharing</span>
            </div>
          </div>
        </div>
      </div>
      <div id="phaser-container" style={{ display: 'none' }} />
    </div>
  );
};

export default JoinForm;

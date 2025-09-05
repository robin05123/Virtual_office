import React, { useState, useEffect } from "react";
import ProjectRoom from "../src/pages/MeetingRoom";
import ParticleBackground from "./components/ParticleBackground";

/**
 * @component App
 * The main application component with integrated ProjectRoom that displays
 * when the Project Room button is clicked in the 360° tour.
 */
export default function App() {
  const [showProjectRoom, setShowProjectRoom] = useState(false);
  const [hasJoinedOffice, setHasJoinedOffice] = useState(false); // <-- Add this line

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === "SHOW_PROJECT_ROOM") {
        setShowProjectRoom(true);
      } else if (event.data.type === "HIDE_PROJECT_ROOM") {
        setShowProjectRoom(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // The entire working HTML/JS application is stored in this template literal.
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Virtual Office 360 Tour</title>
        
        <!-- Leaflet Map Library -->
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        
        <style>
            /* --- Base and Layout --- */
            body {
                margin: 0;
                overflow: hidden;
                background-color: #000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                color: white;
            }
            canvas { display: block; }
            .hidden { display: none !important; }

            /* --- UI Containers --- */
            #ui-container, #map-container, #conference-container {
                position: absolute;
                top: 0; right: 0; bottom: 0; left: 0;
            }
            #hotspot-container {
                position: absolute;
                top: 0; right: 0; bottom: 0; left: 0;
                pointer-events: none; /* Make container transparent to mouse events, allowing dragging on the canvas below */
            }

            /* --- Landing Page Styles --- */
            #landing-page {
                position: absolute;
                inset: 0;
                z-index: 20;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background-color: rgba(17, 24, 39, 0.8);
                transition: opacity 0.5s ease-in-out;
                animation: fadeIn 1.5s ease-in-out;
            }
            #landing-page .content-box {
                text-align: center;
                padding: 2rem;
                background-color: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(16px);
                border-radius: 1rem;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                border: 1px solid rgba(156, 163, 175, 0.3);
                max-width: 90%;
                animation: slideUp 1.5s ease-in-out;
            }
            #landing-page h1 {
                font-size: 2.5rem;
                line-height: 3rem;
                font-weight: 700;
                margin-bottom: 1rem;
                background: linear-gradient(90deg, #34D399, #3B82F6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
                animation: textGlow 2s infinite alternate;
            }
            @media (min-width: 768px) { 
                #landing-page h1 { 
                    font-size: 4rem; 
                    line-height: 1; 
                } 
            }
            #landing-page p {
                font-size: 1.5rem;
                line-height: 2.25rem;
                color: #E5E7EB;
                margin-bottom: 2rem;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                animation: subtitleGlow 2s infinite alternate;
                background: linear-gradient(90deg, #FBBF24, #F59E0B);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            /* --- Enhanced Begin Tour Button Styles --- */
            #enter-btn {
                padding: 1rem 2rem;
                background: linear-gradient(90deg, #2563EB, #1D4ED8);
                color: white;
                font-weight: 600;
                border: none;
                border-radius: 0.75rem;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                transition: all 0.3s ease-in-out, transform 0.3s ease-in-out;
                cursor: pointer;
                animation: pulse 2s infinite;
                position: relative;
                overflow: hidden;
            }
            #enter-btn:hover {
                background: linear-gradient(90deg, #1D4ED8, #2563EB);
                transform: scale(1.1);
                box-shadow: 0 15px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -2px rgba(0, 0, 0, 0.1);
            }
            #enter-btn:focus {
                outline: none;
                box-shadow: 0 0 0 4px rgba(147, 197, 253, 0.4);
            }
            #enter-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 200%;
                height: 100%;
                background: rgba(255, 255, 255, 0.2);
                transform: skewX(-45deg);
                transition: left 0.5s ease-in-out;
            }
            #enter-btn:hover::before {
                left: 100%;
            }

            /* --- Keyframes for Animations --- */
            @keyframes fadeIn {
                0% { opacity: 0; }
                100% { opacity: 1; }
            }
            @keyframes slideUp {
                0% { transform: translateY(50px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
            @keyframes textGlow {
                0% { text-shadow: 0 4px 6px rgba(0, 0, 0, 0.2), 0 0 10px #34D399; }
                100% { text-shadow: 0 4px 6px rgba(0, 0, 0, 0.2), 0 0 20px #3B82F6; }
            }
            @keyframes subtitleGlow {
                0% { text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 8px #8c712cff; }
                100% { text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 16px #F59E0B; }
            }

            /* --- Menu Styles --- */
            #menu {
                position: absolute;
                top: 20px;
                left: 50%;
                transform: translateX(-50%); /* Center the menu */
                z-index: 100;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(10px);
                border-radius: 12px;
                padding: 10px;
                border: 1px solid rgba(255,255,255,0.2);
                display: flex; /* Arrange buttons horizontally */
                gap: 8px; /* Space between buttons */
            }
            #menu button {
                background: transparent;
                color: white;
                border: none;
                padding: 10px 18px;
                text-align: center;
                font-size: 14px;
                border-radius: 8px;
                cursor: pointer;
                transition: background-color 0.3s;
                white-space: nowrap; /* Prevent text wrapping */
            }
            #menu button:hover { background-color: rgba(255, 255, 255, 0.1); }
            #menu button.active { background-color: rgba(0, 122, 255, 0.5); font-weight: bold; }

            /* --- Hotspot Styles --- */
            .hotspot {
                position: absolute;
                transform: translate(-50%, -50%);
                width: 48px;
                height: 48px;
                background: rgba(0, 0, 0, 0.5);
                border-radius: 50%;
                border: 1px solid rgba(255, 255, 255, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                color: white;
                pointer-events: auto; /* Make hotspots clickable, overriding the container's style */
            }
            .hotspot:hover { transform: translate(-50%, -50%) scale(1.1); background: rgba(0, 0, 0, 0.75); }
            .hotspot-label {
                position: absolute;
                left: 120%;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                white-space: nowrap;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            }
            .hotspot:hover .hotspot-label { opacity: 1; }
            
            /* --- Map Styles --- */
            #map-container { z-index: 50; }
            .leaflet-container { background: #1a202c; }
            .leaflet-popup-content-wrapper, .leaflet-popup-tip { background: #2d3748; color: white; }

            /* --- Conference Room Styles --- */
            #conference-container {
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #111827;
            }
            .conference-layout {
                position: relative;
                width: 90vmin;
                height: 90vmin;
            }
            /* --- Conference Room Styles --- */
.conference-table {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 60%;
    /* This line creates the glossy effect */
    background: radial-gradient(circle at 50% 40%, #a0aec0, #2d3748 70%);
    border-radius: 50%;
    border: 10px solid #2d3748;
    /* This line adds depth and an inner shadow */
    box-shadow: 0 0 20px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.4);
}
            .seat {
                position: absolute;
                width: 10vmin;
                height: 10vmin;
                max-width: 80px;
                max-height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background-color: #2d3748;
                border: 2px solid #718096;
                overflow: hidden;
                transform: translate(-50%, -50%); /* FIX: Center the seat on its calculated position */
            }
            .seat img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            /* --- CTO Office Animated Sections --- */
            #cto-sections {
                position: absolute;
                top: 15%;
                left: 50%;
                transform: translateX(-50%);
                z-index: 200;
                display: flex;
                gap: 2rem;
                pointer-events: none; /* Let mouse events pass through unless needed */
            }
            .cto-section {
                background: #fff;
                color: #222;
                border-radius: 1.25rem;
                box-shadow: 0 6px 32px 0 rgba(34,197,94,0.15), 0 1.5px 8px 0 rgba(0,0,0,0.10);
                border: 1.5px solid #8eb2dcff;
                padding: 2rem 1.5rem;
                min-width: 220px;
                max-width: 260px;
                opacity: 0;
                filter: blur(10px) brightness(0.97);
                pointer-events: auto;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                position: relative;
                overflow: hidden;
                /* Animation setup */
                transform: scale(0.85) translateY(40px) rotateZ(-6deg);
                transition:
                    opacity 0.7s cubic-bezier(.4,2,.6,1),
                    transform 0.7s cubic-bezier(.4,2,.6,1),
                    filter 0.7s cubic-bezier(.4,2,.6,1),
                    box-shadow 0.7s cubic-bezier(.4,2,.6,1);
                animation: card-pop-in 1.1s cubic-bezier(.4,2,.6,1) backwards;
            }
            .cto-section.visible {
                opacity: 1;
                filter: blur(0) brightness(1);
                box-shadow: 0 16px 48px 0 rgba(34,197,94,0.18), 0 2px 8px 0 rgba(0,0,0,0.10);
                transform: scale(1) translateY(0) rotateZ(0deg);
                animation: card-pop-in 0.7s cubic-bezier(.4,2,.6,1) backwards;
            }
            .cto-section:hover {
                box-shadow: 0 32px 80px 0 rgba(34,197,94,0.28), 0 8px 24px 0 rgba(0,0,0,0.18);
                transform: scale(1.06) translateY(-4px) rotateZ(1deg);
                filter: brightness(1.03);
                transition:
                    box-shadow 0.4s cubic-bezier(.4,2,.6,1),
                    transform 0.4s cubic-bezier(.4,2,.6,1),
                    filter 0.4s cubic-bezier(.4,2,.6,1);
            }
            .cto-section h3 {
                color: #ff9800;
                margin-top: 0;
                margin-bottom: 0.5rem;
                font-weight: 700;
                letter-spacing: 1px;
                font-size: 1.25rem;
                transition: color 0.3s, text-shadow 0.3s;
                text-shadow: 0 2px 8px rgba(255,152,0,0.08);
            }
            .cto-section:hover h3 {
                color: #ffd54f;
                text-shadow: 0 4px 16px rgba(255,152,0,0.18);
            }
            .cto-section p {
                color: #444;
                font-size: 1rem;
                margin: 0;
                margin-top: 0.5rem;
                transition: color 0.3s, opacity 0.4s, max-height 0.4s;
                opacity: 1;
                max-height: 200px;
                overflow: hidden;
            }
            .cto-section p[style*="display: none"] {
                opacity: 0;
                max-height: 0;
                transition: opacity 0.3s, max-height 0.3s;
            }

            /* Keyframes for pop-in animation */
            @keyframes card-pop-in {
                0% {
                    opacity: 0;
                    filter: blur(16px) brightness(0.8);
                    transform: scale(0.7) translateY(80px) rotateZ(-12deg);
                }
                60% {
                    opacity: 1;
                    filter: blur(2px) brightness(1.05);
                    transform: scale(1.04) translateY(-8px) rotateZ(2deg);
                }
                100% {
                    opacity: 1;
                    filter: blur(0) brightness(1);
                    transform: scale(1) translateY(0) rotateZ(0deg);
                }
            }

             /* --- Ceo Office Animated Sections --- */
            #ceo-sections {
                position: absolute;
                top: 15%;
                left: 50%;
                transform: translateX(-50%);
                z-index: 200;
                display: flex;
                gap: 2rem;
                pointer-events: none; /* Let mouse events pass through unless needed */
            }
            .ceo-section {
                background: #fff;
                color: #222;
                border-radius: 1.25rem;
                box-shadow: 0 6px 32px 0 rgba(34,197,94,0.15), 0 1.5px 8px 0 rgba(0,0,0,0.10);
                border: 1.5px solid #8eb2dcff;
                padding: 2rem 1.5rem;
                min-width: 220px;
                max-width: 260px;
                opacity: 0;
                filter: blur(10px) brightness(0.97);
                pointer-events: auto;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                position: relative;
                overflow: hidden;
                /* Animation setup */
                transform: scale(0.85) translateY(40px) rotateZ(-6deg);
                transition:
                    opacity 0.7s cubic-bezier(.4,2,.6,1),
                    transform 0.7s cubic-bezier(.4,2,.6,1),
                    filter 0.7s cubic-bezier(.4,2,.6,1),
                    box-shadow 0.7s cubic-bezier(.4,2,.6,1);
                animation: card-pop-in 1.1s cubic-bezier(.4,2,.6,1) backwards;
            }
            .ceo-section.visible {
                opacity: 1;
                filter: blur(0) brightness(1);
                box-shadow: 0 16px 48px 0 rgba(34,197,94,0.18), 0 2px 8px 0 rgba(0,0,0,0.10);
                transform: scale(1) translateY(0) rotateZ(0deg);
                animation: card-pop-in 0.7s cubic-bezier(.4,2,.6,1) backwards;
            }
            .ceo-section:hover {
                box-shadow: 0 32px 80px 0 rgba(34,197,94,0.28), 0 8px 24px 0 rgba(0,0,0,0.18);
                transform: scale(1.06) translateY(-4px) rotateZ(1deg);
                filter: brightness(1.03);
                transition:
                    box-shadow 0.4s cubic-bezier(.4,2,.6,1),
                    transform 0.4s cubic-bezier(.4,2,.6,1),
                    filter 0.4s cubic-bezier(.4,2,.6,1);
            }
            .ceo-section h3 {
                color: #ff9800;
                margin-top: 0;
                margin-bottom: 0.5rem;
                font-weight: 700;
                letter-spacing: 1px;
                font-size: 1.25rem;
                transition: color 0.3s, text-shadow 0.3s;
                text-shadow: 0 2px 8px rgba(255,152,0,0.08);
            }
            .ceo-section:hover h3 {
                color: #ffd54f;
                text-shadow: 0 4px 16px rgba(255,152,0,0.18);
            }
            .ceo-section p {
                color: #444;
                font-size: 1rem;
                margin: 0;
                margin-top: 0.5rem;
                transition: color 0.3s, opacity 0.4s, max-height 0.4s;
                opacity: 1;
                max-height: 200px;
                overflow: hidden;
            }
            .ceo-section p[style*="display: none"] {
                opacity: 0;
                max-height: 0;
                transition: opacity 0.3s, max-height 0.3s;
            }

            /* Keyframes for pop-in animation */
            @keyframes card-pop-in {
                0% {
                    opacity: 0;
                    filter: blur(16px) brightness(0.8);
                    transform: scale(0.7) translateY(80px) rotateZ(-12deg);
                }
                60% {
                    opacity: 1;
                    filter: blur(2px) brightness(1.05);
                    transform: scale(1.04) translateY(-8px) rotateZ(2deg);
                }
                100% {
                    opacity: 1;
                    filter: blur(0) brightness(1);
                    transform: scale(1) translateY(0) rotateZ(0deg);
                }
            }
        
            /* --- Responsive Styles --- */
            @media (max-width: 768px) {
                #menu {
                    flex-direction: column;
                    gap: 4px;
                }
                #menu button {
                    width: 100%;
                    padding: 12px;
                    font-size: 16px;
                }
                #enter-btn {
                    width: 100%;
                    padding: 12px;
                    font-size: 16px;
                }
                .cto-section {
                    padding: 1.5rem 1rem;
                    min-width: 180px;
                    max-width: 220px;
                }
                .device-showcase {
                    flex-direction: row;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .device {
                    width: 60px;
                    height: 60px;
                }
                .ceo-title {
                    font-size: 1.25rem;
                }
                .ceo-desc {
                    font-size: 0.875rem;
                }
            }
                .process-timeline {
            display: flex;
            width: 100%;
            margin-top: 20px;
            /* MODIFIED: Added padding on the right to ensure the container covers the last arrow */
            padding-right: 1.2em; 
            box-sizing: border-box; /* Ensures padding is included in the element's total width */
        }

        /* Styling for each individual step in the timeline */
        .step {
            /* Using flexbox to center the text inside the block */
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            /* Each step will take up an equal amount of space */
            flex: 1;
            color: white;
            font-weight: bold;
            text-align: center;
            
            /* MODIFIED: Reduced margin to make the arrow thinner */
            padding: 1em;
            margin-right: 1.2em; /* This creates space for the arrow */
        }

        /* NEW APPROACH: Using a pseudo-element to create the arrow shape */
        /* This is more stable than using clip-path on the main element. */
        .step::after {
            content: '';
            position: absolute;
            /* Position the arrow in the margin space */
            left: 100%; 
            top: 0;
            height: 100%;
            /* MODIFIED: Reduced width to make the arrow thinner */
            width: 1.2em; /* Same as the margin-right */
            
            /* The arrow inherits the background color of its parent step */
            background-color: inherit;
            
            /* Use clip-path on the pseudo-element to shape it into a triangle */
            clip-path: polygon(0 0, 100% 50%, 0 100%);
        }

        /* The last step should not have an arrow */
        .step:last-child {
            margin-right: 0;
        }

       

        /* Specific background colors for each step, matching the new image */
        .initiation { background-color: #00b050; }
        .planning   { background-color: #92d050; }
        .execution  { background-color: #5b7690; }
        .control    { background-color: #425568; }
        .close      { background-color: #212a34; }

        /* Styling for the upcoming projects list */
.upcoming-projects-list {
    list-style: none; /* Remove default bullet points */
    padding-left: 0;
}

.upcoming-projects-list li {
    display: flex;
    align-items: center;
    font-size: 1.1rem;
    color: #374151; /* Medium gray text */
    padding: 0.75rem 0;
    border-bottom: 1px solid #f3f4f6; /* Very light separator line */
    transition: background-color 0.2s ease-in-out;
}

.upcoming-projects-list li:last-child {
    border-bottom: none; /* Remove border from the last item */
}

.upcoming-projects-list li:hover {
    background-color: #f9fafb;
}

/* This creates the small, glossy arrow using a pseudo-element */
.upcoming-projects-list li::before {
    content: '▶'; /* Unicode arrow character */
    font-size: 0.8em;
    margin-right: 1em;
    
    /* Gradient and shadow to create the glossy effect */
    background: linear-gradient(to bottom, #4c6ef5, #3b5bdb);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
    
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease-in-out;
}

.upcoming-projects-list li:hover::before {
    transform: translateX(4px); /* Move arrow slightly on hover */
}
        </style>
    </head>
    <body>
        <div id="container"></div>
        <div id="map-container" class="hidden"></div>
        <div id="conference-container" class="hidden"></div>

        <div id="ui-container">
            <div id="landing-page">
                <div class="content-box">
                    <h1>Virtual Office Odyssey</h1>
                    <p>Bring our remote culture to life.</p>
                    <button id="enter-btn">Begin Tour</button>
                </div>
            </div>
            
            <div id="menu" class="hidden">
                <button id="btn-lobby" data-scene="lobby">Lobby</button>
                <button id="btn-ceo" data-scene="ceoOffice">CEO Office</button>
                <button id="btn-cto" data-scene="ctoOffice">CTO Office</button>
                <button id="btn-project" data-scene="projectRoom">Project Room</button>
                <button id="btn-conference" data-scene="conference">Conference Room</button>
                <button id="btn-virtual-desk" data-scene="vdesk">Virtual Desk</button>
                <button id="btn-map">Locations</button>
            </div>

            <div id="hotspot-container"></div>
            <!-- CTO Office Animated Sections -->
            <div id="cto-sections" class="hidden" style="flex-direction:column;align-items:center;">
  <!-- First row: Milestone -->
  <div style="display:flex;justify-content:center;width:100%;">
    <div class="cto-section" id="cto-section-1" style="max-width: 1000px; margin: auto;">
      <h3></h3>
      <div class="process-timeline">

            <!-- Step 1: Initiation -->
            <div class="step initiation">
                Architectural <span class="ml-2">Overhaul</span>
            </div>

            <!-- Step 2: Planning -->
            <div class="step planning">
                Product<span class="ml-2">Innovation</span>
            </div>

            <!-- Step 3: Execution -->
            <div class="step execution">
                Catalyst <span class="ml-2"></span>
            </div>

            <!-- Step 4: Control -->
            <div class="step control">
                IP <span class="ml-2">Products</span>
            </div>

            <!-- Step 5: Close -->
            <div class="step close">
                Innovations <span class="ml-2"></span>
            </div>
        </div>
    </div>
  </div>
  <!-- Second row: Upcoming Project & Core Members -->
  <div style="display:flex;justify-content:center;gap:1rem;margin-top:0.5rem;">
    <div class="cto-section" id="cto-section-3">
      <h3>Core Members</h3>
      <ul class="upcoming-projects-list">
            <li>Aravind Arasu (Chief Technology Officer)</li>
            <li>RK</li>
            <li>Jeevanadham</li>
            <li>Dinesh</li>
            <li>Avinash Kala</li>
        </ul>
    </div>
    <div class="cto-section" id="cto-section-2">
    <h3>Upcoming Projects</h3>
        <ul class="upcoming-projects-list">
            <li>Financial Services</li>
            <li>Waste Management</li>
            <li>Travel Tech / Finance</li>
            <li>Warehouse Safety Automation</li>
            <li>Payments Infrastructure</li>
        </ul>
    </div>
  </div>
</div>

            <!-- CEO Office Animated Sections -->
<div id="ceo-sections" class="hidden" style="flex-direction:column;align-items:center;">
  <!-- First row: Milestone -->
  <div style="display:flex;justify-content:center;width:100%;">
    <div id="ceo-section-1" style="max-width: 1000px; margin: auto;">
      <div class="process-timeline">

      </div>
    </div>
  </div>
  <!-- Second row: Upcoming Project & Core Members -->
  <div style="display:flex;justify-content:center;gap:1rem;margin-top:0.5rem;">
    <div  id="ceo-section-2">
      
    </div>
     <div class="ceo-section" id="ceo-section-3" style="max-width: 2000px; margin: auto;">
      <h3></h3>
    <video width="1000" height="800" controls>
  <source src="nexturn.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
    </div>
    <!-- New Card -->
    <div  id="ceo-section-4">
    </div>
  </div>
</div>

            <!-- Parallax Device Showcase for CEO Office -->
              </div>
            </div>
        </div>
        
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>

        <script>
            const scenes = {
                lobby: {
                    image: '/office2.jpg',
                    hotspots: [
                        { position: new THREE.Vector3(40, 0, -20), target: 'ceoOffice', label: 'CEO Office' },
                        { position: new THREE.Vector3(-40, 0, -20), target: 'ctoOffice', label: 'CTO Office' }
                    ]
                },
                ceoOffice: { 
                    image: '/ceo-office-3d.jpg', // <-- Add your 3D panoramic image path here
                    hotspots: [
                        { position: new THREE.Vector3(-30, 0, 30), target: 'projectRoom', label: 'Project Room' },
                        { position: new THREE.Vector3(40, 0, 0), target: 'lobby', label: 'Back to Lobby' }
                    ]
                },
                ctoOffice: { 
                    image: '/cto-office-3d.jpg',
                    hotspots: [ { position: new THREE.Vector3(30, 0, 20), target: 'lobby', label: 'Back to Lobby' } ] 
                },
                projectRoom: { 
                    colors: ['#34e89e', '#0f3443'],
                    hotspots: [ { position: new THREE.Vector3(30, 0, 20), target: 'ceoOffice', label: 'Back to CEO Office' } ]
                }
            };

            let camera, scene, renderer, map;
            let isUserInteracting = false, onPointerDownMouseX = 0, onPointerDownMouseY = 0;
            let lon = 90, onPointerDownLon = 0, lat = 0, onPointerDownLat = 0;
            let isAnimationLoopRunning = false;
            const container = document.getElementById('container');
            const mapContainer = document.getElementById('map-container');
            const conferenceContainer = document.getElementById('conference-container');
            const hotspotContainer = document.getElementById('hotspot-container');
            let currentSceneKey = null;

            function init() {
                camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
                scene = new THREE.Scene();
                localStorage.removeItem('virtual-desk-items');
                renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.setSize(window.innerWidth, window.innerHeight);
                container.appendChild(renderer.domElement);

                document.addEventListener('pointerdown', onPointerDown);
                document.addEventListener('pointermove', onPointerMove);
                document.addEventListener('pointerup', onPointerUp);
                window.addEventListener('resize', onWindowResize);
                document.getElementById('enter-btn').addEventListener('click', startTour);
                
                document.querySelectorAll('#menu button[data-scene]').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const scene = e.target.dataset.scene;
                        if (scene === 'projectRoom') {
                            // Send message to parent to show ProjectRoom component
                            window.parent.postMessage({ type: 'SHOW_PROJECT_ROOM' }, '*');
                        } 
                        else {
                            if(scene !== 'vdesk') {
                            const desk = document.getElementById('virtual-desk-area');
                                if (desk) {
                                    desk.remove();
                                }
                            }
                            loadScene(scene);
                        }
                    });
                });
                document.getElementById('btn-map').addEventListener('click', showMap);
                document.getElementById('btn-virtual-desk').addEventListener('click', () => {
                    document.getElementById('btn-map').classList.remove('active');
                    // Send message to parent to show VirtualDesk component
                container.classList.add('hidden');
                conferenceContainer.classList.add('hidden');
                mapContainer.classList.remove('hidden');
                document.querySelectorAll('#menu button').forEach(b => b.classList.remove('active'));
                document.getElementById('btn-virtual-desk').classList.add('active');
                initVirtualDesk();
                setTimeout(() => map.invalidateSize(), 10); 
                     });

                // Listen for messages from parent
                window.addEventListener('message', (event) => {
                    if (event.data.type === 'BACK_TO_TOUR') {
                        // Return to the previous scene or lobby
                        loadScene('ceoOffice'); // Since project room is usually accessed from CEO office
                    }
                });
            }

            function startTour() {
                document.getElementById('landing-page').style.opacity = '0';
                document.getElementById('menu').classList.remove('hidden');
                setTimeout(() => { document.getElementById('landing-page').style.display = 'none'; }, 500);
                loadScene('lobby');
            }
                function closeVirtualDesk() {
                    const desk = document.getElementById('virtual-desk-area');
                    if (desk) {
                        desk.remove();
                    }
                }
            
            function createGradientTexture(colors) {
                const canvas = document.createElement('canvas');
                canvas.width = 2048; canvas.height = 1024;
                const context = canvas.getContext('2d');
                const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
                gradient.addColorStop(0, colors[0]);
                gradient.addColorStop(1, colors[1]);
                context.fillStyle = gradient;
                context.fillRect(0, 0, canvas.width, canvas.height);
                const texture = new THREE.CanvasTexture(canvas);
                texture.mapping = THREE.EquirectangularReflectionMapping;
                return texture;
            }

            function loadScene(sceneKey) {
                container.classList.remove('hidden');
                mapContainer.classList.add('hidden');
                conferenceContainer.classList.add('hidden');

                // --- CTO Office Sections Animation ---
                const ctoSections = document.getElementById('cto-sections');
                if (sceneKey === 'ctoOffice') {
                    ctoSections.classList.remove('hidden');
                    // Animate each section with a staggered delay
                    setTimeout(() => document.getElementById('cto-section-1').classList.add('visible'), 100);
                    setTimeout(() => document.getElementById('cto-section-2').classList.add('visible'), 400);
                    setTimeout(() => document.getElementById('cto-section-3').classList.add('visible'), 700);
                } else {
                    // Hide and reset animation
                    ctoSections.classList.add('hidden');
                    document.getElementById('cto-section-1').classList.remove('visible');
                    document.getElementById('cto-section-2').classList.remove('visible');
                    document.getElementById('cto-section-3').classList.remove('visible');
                }

                // --- CEO Office Sections Animation ---
                const ceoSections = document.getElementById('ceo-sections');
                if (sceneKey === 'ceoOffice') {
                    ceoSections.classList.remove('hidden');
                    // Animate each section with a staggered delay
                    setTimeout(() => document.getElementById('ceo-section-1').classList.add('visible'), 100);
                    setTimeout(() => document.getElementById('ceo-section-2').classList.add('visible'), 400);
                    setTimeout(() => document.getElementById('ceo-section-3').classList.add('visible'), 700);
                    setTimeout(() => document.getElementById('ceo-section-4').classList.add('visible'), 1000);
                } else {
                    // Hide and reset animation
                    ceoSections.classList.add('hidden');
                    document.getElementById('ceo-section-1').classList.remove('visible');
                    document.getElementById('ceo-section-2').classList.remove('visible');
                    document.getElementById('ceo-section-3').classList.remove('visible');
                    document.getElementById('ceo-section-4').classList.remove('visible');
                }

                currentSceneKey = sceneKey;
                
                document.querySelectorAll('#menu button').forEach(b => b.classList.remove('active'));
                const targetButton = document.querySelector(\`#menu button[data-scene="\${sceneKey}"]\`);
                if (targetButton) {
                    targetButton.classList.add('active');
                }

                if (sceneKey === 'conference') {
                    showConferenceRoom();
                    return;
                }

                const sceneData = scenes[sceneKey];
                const geometry = new THREE.SphereGeometry(500, 60, 40);
                geometry.scale(-1, 1, 1);
                
                let material;
                if (sceneData.image) {
                    const textureLoader = new THREE.TextureLoader();
                    textureLoader.setCrossOrigin('anonymous');
                    const texture = textureLoader.load(sceneData.image, () => {
                         if (!isAnimationLoopRunning) { animate(); isAnimationLoopRunning = true; }
                    });
                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    material = new THREE.MeshBasicMaterial({ map: texture });
                } else {
                    const texture = createGradientTexture(sceneData.colors);
                    material = new THREE.MeshBasicMaterial({ map: texture });
                    if (!isAnimationLoopRunning) { animate(); isAnimationLoopRunning = true; }
                }
                
                while(scene.children.length > 0) { scene.remove(scene.children[0]); }
                const mesh = new THREE.Mesh(geometry, material);
                scene.add(mesh);
                updateHotspots();
            }

           function initMap() {
                closeVirtualDesk();
                if (map) return; 
                map = L.map('map-container').setView([27, -22], 2.5);
                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; OpenStreetMap &copy; CARTO',
                    subdomains: 'abcd',
                    maxZoom: 19
                }).addTo(map);
                closeVirtualDesk()
                L.marker([17.3850, 78.4867]).addTo(map).bindTooltip('<b>Hyderabad Office</b>', {permanent: true, direction: 'top'});
                L.marker([47.6290852, -122.1324821]).addTo(map).bindTooltip('<b>US Office (Washington)</b>', {permanent: true, direction: 'top'});
            }

  
function initVirtualDesk() {
    // If desk already exists, do nothing
    if (document.getElementById('virtual-desk-area')) return;

    // --- Create the main desk container ---
    const desk = document.createElement('div');
    desk.id = 'virtual-desk-area';
    // Centering and sizing styles
    desk.style.position = 'fixed';
    desk.style.top = '50%';
    desk.style.left = '50%';
    desk.style.transform = 'translate(-50%, -50%)';
    desk.style.width = '950px'; // Adjusted width for better grid layout
    desk.style.height = '450px';
    // Beautification styles
    desk.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
    desk.style.border = '1px solid #e0e0e0';
    desk.style.borderRadius = '24px';
    desk.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
    desk.style.zIndex = 2000;
    desk.style.overflow = 'hidden';
    desk.style.display = 'flex';
    desk.style.flexDirection = 'column';
   

    // --- Add close button ---
    const closeBtn = document.createElement('button');
    closeBtn.innerText = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '15px';
    closeBtn.style.right = '25px';
    closeBtn.style.background = 'rgba(0,0,0,0.1)';
    closeBtn.style.color = '#333';
    closeBtn.style.fontSize = '1.5rem';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.width = '30px';
    closeBtn.style.height = '30px';
    closeBtn.style.lineHeight = '30px';
    closeBtn.style.textAlign = 'center';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.transition = 'background 0.2s';
    closeBtn.onmouseover = () => { closeBtn.style.background = 'rgba(0,0,0,0.2)'; };
    closeBtn.onmouseout = () => { closeBtn.style.background = 'rgba(0,0,0,0.1)'; };
    closeBtn.onclick = () => desk.remove();
    desk.appendChild(closeBtn);

    // --- Add desk header ---
    const header = document.createElement('div');
    header.innerText = "Virtual Desk";
    header.style.fontWeight = '600';
    header.style.fontSize = '1.5rem';
    header.style.color = '#2c3e50';
    header.style.padding = '20px 30px';
    desk.appendChild(header);

    // --- Desk inner area (the grid container) ---
    const deskArea = document.createElement('div');
    deskArea.id = 'desk-surface';
    deskArea.style.position = 'relative'; // Needed for absolute positioning of dragged items
    deskArea.style.flex = '1';
    deskArea.style.padding = '0 30px 30px 30px';
    deskArea.style.overflowY = 'auto';
    // Grid layout for perfect alignment
    deskArea.style.display = 'grid';
    deskArea.style.gridTemplateColumns = 'repeat(6, 1fr)';
    deskArea.style.gridTemplateRows = 'repeat(3, 1fr)';
    deskArea.style.gap = '20px';
    desk.appendChild(deskArea);

    document.body.appendChild(desk);

   
    const defaultItems = [
        { id: 1, type: 'profile', name: 'NHCK_2025', title: 'Lead Developer', avatarUrl: 'https://placehold.co/60x60/E2E8F0/4A5568?text=AD', gc: '1 / 3', gr: '1 / 2' },
        { id: 2, type: 'kpi', title: 'Revenue Growth', value: '+18%', icon: '📈', color: '#2ecc71', gc: '3 / 4', gr: '1 / 2' },
        { id: 3, type: 'kpi', title: 'Customer Sat.', value: '96%', icon: '😊', color: '#3498db', gc: '4 / 5', gr: '1 / 2' },
        { id: 4, type: 'kpi', title: 'System Uptime', value: '99.9%', icon: '✅', color: '#f39c12', gc: '5 / 6', gr: '1 / 2' },
        { id: 5, type: 'announcement', title: 'Product Launch!', text: 'Project "Salesforce" goes live next Monday!', icon: '🚀', color: '#9b59b6', gc: '1 / 4', gr: '2 / 3' },
        { id: 6, type: 'links', title: 'Developer Tools', links: [{name: 'Git Repository', url: '#'}, {name: 'CI/CD Pipeline', url: '#'}, {name: 'API Docs', url: '#'}], gc: '4 / 7', gr: '2 / 3' },
        { id: 7, type: 'timeline', title: 'Project Salesforce Timeline', steps: ['Design', 'Develop', 'Test', 'Deploy'], currentStep: 2, gc: '1 / 5', gr: '3 / 4' },
       { id: 8, type: 'worldclock', city: 'India (IST)', timezone: 'Asia/Kolkata', gc: '5 / 6', gr: '3 / 4' },
        { id: 9, type: 'worldclock', city: 'New York (ET)', timezone: 'America/New_York', gc: '6 / 7', gr: '3 / 4' }
        
    ];

    let items = [];
    try {
        const storedItems = localStorage.getItem('virtual-desk-items');
        if (storedItems) {
            items = JSON.parse(storedItems);
        } else {
            items = defaultItems;
        }
    } catch { items = defaultItems; }

    function saveDesk() {
        localStorage.setItem('virtual-desk-items', JSON.stringify(items));
    }

    // --- Drag and Drop Logic ---
    let activeItem = null;
    let offsetX = 0;
    let offsetY = 0;

    function onMouseDown(e) {
        // Ensure we're dragging the item, not text or links inside it
        if (e.target.tagName === 'A' || e.target.tagName === 'INPUT') return;
        
        activeItem = e.currentTarget; // Use currentTarget to get the main item element
        
        // Switch to absolute positioning for dragging
        activeItem.style.position = 'absolute';
        activeItem.style.zIndex = '100'; // Bring to front
        
        const deskRect = deskArea.getBoundingClientRect();
        offsetX = e.clientX - activeItem.getBoundingClientRect().left;
        offsetY = e.clientY - activeItem.getBoundingClientRect().top;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    function onMouseMove(e) {
        if (!activeItem) return;
        e.preventDefault();

        const deskRect = deskArea.getBoundingClientRect();
        let newX = e.clientX - deskRect.left - offsetX;
        let newY = e.clientY - deskRect.top - offsetY;

        // Constrain movement within the deskArea
        newX = Math.max(0, Math.min(newX, deskRect.width - activeItem.offsetWidth));
        newY = Math.max(0, Math.min(newY, deskRect.height - activeItem.offsetHeight));

        activeItem.style.left = newX + 'px';
        activeItem.style.top = newY + 'px';
    }

    function onMouseUp() {
        if (!activeItem) return;

        const itemId = parseInt(activeItem.dataset.id);
        const itemData = items.find(item => item.id === itemId);
        if (itemData) {
            // Save the new absolute coordinates and remove grid properties
            itemData.x = parseInt(activeItem.style.left);
            itemData.y = parseInt(activeItem.style.top);
            delete itemData.gc;
            delete itemData.gr;
            saveDesk();
        }

        activeItem.style.zIndex = '10'; // Reset z-index
        activeItem = null;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    // --- Render Items onto the Desk ---
    function renderItems() {
        deskArea.innerHTML = '';
        items.forEach(item => {
            const el = document.createElement('div');
            el.dataset.id = item.id;
            el.style.cursor = 'grab';
            el.style.userSelect = 'none';
            el.style.borderRadius = '16px';
            el.style.padding = '15px 20px';
            el.style.background = 'rgba(255, 255, 255, 0.7)';
            el.style.backdropFilter = 'blur(10px)';
            el.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            el.style.border = '1px solid rgba(255,255,255,0.3)';
            el.style.color = '#2c3e50';
            el.style.transition = 'transform 0.2s, box-shadow 0.2s';
            el.onmouseover = () => { el.style.transform = 'translateY(-5px)'; el.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'; };
            el.onmouseout = () => { el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'; };

            // If item has absolute coordinates, use them. Otherwise, use grid.
            if (item.x !== undefined && item.y !== undefined) {
                el.style.position = 'absolute';
                el.style.left = item.x + 'px';
                el.style.top = item.y + 'px';
            } else {
                el.style.gridColumn = item.gc;
                el.style.gridRow = item.gr;
            }

            // --- Item-specific styling ---
            let content = '';
            if (item.type === 'logo') {
                el.style.background = 'transparent';
                el.style.boxShadow = 'none';
                el.style.backdropFilter = 'none';
                content = '<img src="' + item.url + '" style="max-width: 100%; height: auto; pointer-events: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />';
            } else if (item.type === 'profile') {
                el.style.display = 'flex';
                el.style.alignItems = 'center';
                content = '<img src="' + item.avatarUrl + '" style="width: 50px; height: 50px; border-radius: 50%; margin-right: 15px; pointer-events: none;" />' +
                          '<div><h4 style="margin: 0; font-weight: 600; font-size: 1.1rem;">' + item.name + '</h4><p style="margin: 0; opacity: 0.7;">' + item.title + '</p></div>';
            } else if (item.type === 'kpi') {
                el.style.color = '#fff';
                el.style.background = item.color;
                content = '<div style="font-size: 2rem; margin-bottom: 5px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));">' + item.icon + '</div>' +
                          '<h4 style="margin: 0; font-size: 0.9rem; opacity: 0.9;">' + item.title + '</h4>' +
                          '<p style="margin: 2px 0 0; font-size: 1.5rem; font-weight: 700;">' + item.value + '</p>';
            } else if (item.type === 'announcement') {
                el.style.background = item.color;
                el.style.color = '#fff';
                content = '<h4 style="margin: 0 0 8px 0; font-weight: 600; font-size: 1.1rem;">' + item.icon + ' ' + item.title + '</h4><p style="margin: 0;">' + item.text + '</p>';
            } else if (item.type === 'links') {
                let listHtml = '<h4 style="margin: 0 0 10px 0; font-weight: 600;">' + item.title + '</h4>';
                item.links.forEach(link => {
                    listHtml += '<a href="' + link.url + '" target="_blank" style="display: block; margin-bottom: 5px; color: #3498db; text-decoration: none;">' + link.name + '</a>';
                });
                content = listHtml;
            } else if (item.type === 'timeline') {
                let timelineHtml = '<h4 style="margin: 0 0 15px 0; font-weight: 600;">' + item.title + '</h4><div style="display: flex; align-items: center;">';
                item.steps.forEach((step, index) => {
                    const isCompleted = index < item.currentStep;
                    const isActive = index === item.currentStep;
                    const color = isActive ? '#3498db' : (isCompleted ? '#2ecc71' : '#bdc3c7');
                    timelineHtml += '<div style="text-align: center; flex: 1;"><div style="background:'+color+'; width: 24px; height: 24px; border-radius: 50%; margin: 0 auto 5px; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div><span style="font-size: 0.8rem;">'+step+'</span></div>';
                    if (index < item.steps.length - 1) {
                        timelineHtml += '<div style="flex: 1; height: 3px; background: #dfe4ea; margin-bottom: 20px;"></div>';
                    }
                });
                timelineHtml += '</div>';
                content = timelineHtml;
            } else if (item.type === 'worldclock') {
                const updateClock = () => {
                    const timeString = new Date().toLocaleTimeString('en-US', { timeZone: item.timezone, hour: '2-digit', minute: '2-digit', hour12: false });
                    el.innerHTML = '<h4 style="margin: 0; font-size: 0.9rem; opacity: 0.7;">' + item.city + '</h4><p style="margin: 2px 0 0; font-size: 1.8rem; font-weight: 600; font-family: monospace;">' + timeString + '</p>';
                };
                setInterval(updateClock, 1000);
                updateClock();
            }
            
            el.innerHTML = content;
            el.addEventListener('mousedown', onMouseDown);
            deskArea.appendChild(el);
        });
    }

    renderItems();
}


          

            function showMap() {
                container.classList.add('hidden');
                conferenceContainer.classList.add('hidden');
                mapContainer.classList.remove('hidden');
                document.querySelectorAll('#menu button').forEach(b => b.classList.remove('active'));
                document.getElementById('btn-map').classList.add('active');
                initMap();
                setTimeout(() => map.invalidateSize(), 10); 
            }
            
            function showConferenceRoom() {
                container.classList.add('hidden');
                mapContainer.classList.add('hidden');
                conferenceContainer.classList.remove('hidden');
                 // This line clears all arrows from the screen
                    hotspotContainer.innerHTML = ''; 
    
                
                const layout = document.createElement('div');
                layout.className = 'conference-layout';
                layout.innerHTML = '<div class="conference-table"></div>';
                conferenceContainer.innerHTML = '';
                conferenceContainer.appendChild(layout);

                const memberImages = [
                    '/conference/deva.jpeg',
                    '/conference/naren.jpeg',
                    '/conference/bhaskar.jpeg',
                    '/conference/baba.jpeg',
                    '/conference/saravanan.jpeg',
                    '/conference/gunjan.jpg',
                     '/conference/aravind.jpeg',
                    '/conference/prajisha.jpeg',
                     '/conference/lakshmi.jpeg',
                      '/conference/terence.jpeg',
                      '/conference/meera.jpeg',
                    '/conference/jeevan.jpeg',
                     '/conference/surendra.jpeg',
                    '/conference/prasad.jpeg',
                    '/conference/shiva.jpeg',
                    '/conference/deepu.jpeg',
                     '/conference/robin.jpeg',
                    '/conference/milton.jpeg',
                    '/conference/srasti.jpg',
                     '/conference/suresh.jpeg',
                    '/conference/akhil.jpeg',
                    '/conference/bhuvan.jpeg',
                    '/conference/rk.jpg',
                     '/conference/seeni.jpeg',
                    '/conference/lahasya.jpeg',
                    
                ];

                const totalSeats = 25;
                for (let i = 0; i < totalSeats; i++) {
                    const angle = (i / totalSeats) * 2 * Math.PI - (Math.PI / 2);
                    const radius = 40; // FIX: Reduced radius for a tighter circle
                    const x = 50 + radius * Math.cos(angle);
                    const y = 50 + radius * Math.sin(angle);

                    const seat = document.createElement('div');
                    seat.className = 'seat';
                    seat.style.left = \`\${x}%\`;
                    seat.style.top = \`\${y}%\`;
                    
                    if(i < memberImages.length) {
                        seat.innerHTML = \`<img src="\${memberImages[i]}" alt="Member \${i+1}">\`;
                    } else {
                         seat.innerHTML = \`<span>\${i+1}</span>\`;
                    }
                    layout.appendChild(seat);
                }
            }

            function updateHotspots() {
                hotspotContainer.innerHTML = '';
                const sceneData = scenes[currentSceneKey];
                if (!sceneData || !sceneData.hotspots) return;

                sceneData.hotspots.forEach(hotspotData => {
                    const el = document.createElement('div');
                    el.className = 'hotspot';
                    el.innerHTML = \`<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg><div class="hotspot-label">\${hotspotData.label}</div>\`;
                    el.onclick = () => {
                        if (hotspotData.target === 'projectRoom') {
                            // Send message to parent to show ProjectRoom component
                            window.parent.postMessage({ type: 'SHOW_PROJECT_ROOM' }, '*');
                        } else {
                            loadScene(hotspotData.target);
                        }
                    };
                    hotspotContainer.appendChild(el);
                    hotspotData.element = el;
                });
            }
            
            function updateHotspotPositions() {
                if (!currentSceneKey || !scenes[currentSceneKey] || !scenes[currentSceneKey].hotspots) return;

                scenes[currentSceneKey].hotspots.forEach(hotspotData => {
                    if (!hotspotData.element) return;
                    const vector = hotspotData.position.clone().project(camera);
                    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
                    const y = (vector.y * -0.5 + 0.5) * window.innerHeight;
                    const isBehind = hotspotData.position.clone().sub(camera.position).dot(camera.getWorldDirection(new THREE.Vector3())) < 0;

                    if (vector.z < 1 && !isBehind) {
                        hotspotData.element.style.display = 'flex';
                        hotspotData.element.style.left = x + 'px';
                        hotspotData.element.style.top = y + 'px';
                    } else {
                        hotspotData.element.style.display = 'none';
                    }
                });
            }

            function onWindowResize() {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
                if (map) { map.invalidateSize(); }
            }

            function onPointerDown(event) {
                if (event.target.closest('#menu') || event.target.closest('.hotspot')) return;
                isUserInteracting = true;
                onPointerDownMouseX = event.clientX;
                onPointerDownMouseY = event.clientY;
                onPointerDownLon = lon;
                onPointerDownLat = lat;
            }

            function onPointerMove(event) {
                if (isUserInteracting) {
                    lon = (onPointerDownMouseX - event.clientX) * 0.1 + onPointerDownLon;
                    lat = (event.clientY - onPointerDownMouseY) * 0.1 + onPointerDownLat;
                }
            }

            function onPointerUp() { isUserInteracting = false; }

            function animate() {
                requestAnimationFrame(animate);
                render();
            }
            
            function render() {
                if (currentSceneKey !== 'conference' && currentSceneKey !== 'map') {
                    lat = Math.max(-85, Math.min(85, lat));
                    const phi = THREE.MathUtils.degToRad(90 - lat);
                    const theta = THREE.MathUtils.degToRad(lon);
                    camera.lookAt(500 * Math.sin(phi) * Math.cos(theta), 500 * Math.cos(phi), 500 * Math.sin(phi) * Math.sin(theta));
                    renderer.render(scene, camera);
                    updateHotspotPositions();
                }
            }

            init();

            // Add this after your init() function, but before loadScene()
            function setupCTOSectionClicks() {
                const sections = document.querySelectorAll('.cto-section');
                sections.forEach(section => {
                    section.addEventListener('click', () => {
                        const para = section.querySelector('p');
                        const isVisible = para.style.display === 'block';
                        // Hide all paragraphs
                        sections.forEach(sec => sec.querySelector('p').style.display = 'none');
                        // Toggle only the clicked one
                        para.style.display = isVisible ? 'none' : 'block';
                    });
                    // Optional: Hide all paragraphs initially except the first
                    section.querySelector('p').style.display = 'none';
                });
                // Show the first by default
                if (sections[0]) sections[0].querySelector('p').style.display = 'block';
            }

            // Call this after DOM is ready and after CTO sections are rendered
            document.addEventListener('DOMContentLoaded', setupCTOSectionClicks);
            // Or, if CTO sections are dynamically shown, call setupCTOSectionClicks() inside your loadScene('ctoOffice') logic after making them visible.
        </script>
    </body>
    </html>
  `;

  const handleBackToTour = () => {
    setShowProjectRoom(false);
    // Send message to iframe to return to tour
    const iframe = document.querySelector("iframe");
    if (iframe) {
      iframe.contentWindow.postMessage({ type: "BACK_TO_TOUR" }, "*");
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* for floating balls */}
      {/* <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}>
      <ParticleBackground /> */}
      <ParticleBackground />
      {showProjectRoom && !hasJoinedOffice && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 1000,
            //   background: 'rgba(0,0,0,0.7)',
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            backdropFilter: "blur(10px)",
          }}
        >
          <button
            onClick={handleBackToTour}
            style={{
              background: "#2563EB",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ← Back to Tour
          </button>
        </div>
      )}

      <iframe
        srcDoc={htmlContent}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: showProjectRoom ? "none" : "block",
        }}
        title="Virtual Office 360 Tour"
      />

      {showProjectRoom && (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#f0f0f0",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <ProjectRoom
            onJoinOffice={() => setHasJoinedOffice(true)}
            onLeaveOffice={() => setHasJoinedOffice(false)}
          />
        </div>
      )}
    </div>
  );
}

import React from "react";

/**
 * @component App
 * The main application component. This version renders the stable, vanilla JavaScript version
 * of the tour inside an iframe with a robust, full-screen wrapper.
 * It now includes an interactive map view for office locations and a horizontal top menu.
 */
export default function App() {
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
            }
            #landing-page h1 {
                font-size: 2.25rem;
                line-height: 2.5rem;
                font-weight: 700;
                margin-bottom: 1rem;
            }
            @media (min-width: 768px) { #landing-page h1 { font-size: 3.75rem; line-height: 1; } }
            #landing-page p {
                font-size: 1.125rem;
                line-height: 1.75rem;
                color: #E5E7EB;
                margin-bottom: 2rem;
            }
            #enter-btn {
                padding: 1rem 2rem;
                background-color: #2563EB;
                color: white;
                font-weight: 600;
                border: none;
                border-radius: 0.5rem;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                transition: all 0.3s;
                cursor: pointer;
            }
            #enter-btn:hover { background-color: #1D4ED8; transform: scale(1.05); }
            #enter-btn:focus { outline: none; box-shadow: 0 0 0 4px rgba(147, 197, 253, 0.4); }

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
        </style>
    </head>
    <body>
        <div id="container"></div>
        <div id="map-container" class="hidden"></div>
        <div id="conference-container" class="hidden"></div>

        <div id="ui-container">
            <div id="landing-page">
                <div class="content-box">
                    <h1>Corporate Office Tour</h1>
                    <p>Drag to look around and use the menu to navigate.</p>
                    <button id="enter-btn">Begin Tour</button>
                </div>
            </div>
            
            <div id="menu" class="hidden">
                <button id="btn-lobby" data-scene="lobby">Lobby</button>
                <button id="btn-ceo" data-scene="ceoOffice">CEO Office</button>
                <button id="btn-cto" data-scene="ctoOffice">CTO Office</button>
                <button id="btn-project" data-scene="projectRoom">Project Room</button>
                <button id="btn-conference" data-scene="conference">Conference Room</button>
                <button id="btn-map">Locations</button>
            </div>

            <div id="hotspot-container"></div>
        </div>
        
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

        <script>
            const scenes = {
                lobby: {
                    image: '/office_1.jpg',
                    hotspots: [
                        { position: new THREE.Vector3(40, 0, -20), target: 'ceoOffice', label: 'CEO Office' },
                        { position: new THREE.Vector3(-40, 0, -20), target: 'ctoOffice', label: 'CTO Office' }
                    ]
                },
                ceoOffice: { colors: ['#fceabb', '#f8b500'], hotspots: [ { position: new THREE.Vector3(-30, 0, 30), target: 'projectRoom', label: 'Project Room' }, { position: new THREE.Vector3(40, 0, 0), target: 'lobby', label: 'Back to Lobby' } ] },
                ctoOffice: { colors: ['#42275a', '#734b6d'], hotspots: [ { position: new THREE.Vector3(30, 0, 20), target: 'lobby', label: 'Back to Lobby' } ] },
                projectRoom: { colors: ['#34e89e', '#0f3443'], hotspots: [ { position: new THREE.Vector3(30, 0, 20), target: 'ceoOffice', label: 'Back to CEO Office' } ] }
            };

            let camera, scene, renderer, map;
            let isUserInteracting = false, onPointerDownMouseX = 0, onPointerDownMouseY = 0;
            let lon = 200, onPointerDownLon = 0, lat = 0, onPointerDownLat = 0;
            let isAnimationLoopRunning = false;
            const container = document.getElementById('container');
            const mapContainer = document.getElementById('map-container');
            const conferenceContainer = document.getElementById('conference-container');
            const hotspotContainer = document.getElementById('hotspot-container');
            let currentSceneKey = null;

            function init() {
                camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
                scene = new THREE.Scene();
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
                    button.addEventListener('click', (e) => loadScene(e.target.dataset.scene));
                });
                document.getElementById('btn-map').addEventListener('click', showMap);
            }

            function startTour() {
                document.getElementById('landing-page').style.opacity = '0';
                document.getElementById('menu').classList.remove('hidden');
                setTimeout(() => { document.getElementById('landing-page').style.display = 'none'; }, 500);
                loadScene('lobby');
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

                currentSceneKey = sceneKey;
                
                document.querySelectorAll('#menu button').forEach(b => b.classList.remove('active'));
                document.querySelector(\`#menu button[data-scene="\${sceneKey}"]\`).classList.add('active');

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
                if (map) return; 
                map = L.map('map-container').setView([27, -22], 2.5);
                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; OpenStreetMap &copy; CARTO',
                    subdomains: 'abcd',
                    maxZoom: 19
                }).addTo(map);

                L.marker([17.3850, 78.4867]).addTo(map).bindTooltip('<b>Hyderabad Office</b>', {permanent: true, direction: 'top'});
                L.marker([47.6290852, -122.1324821]).addTo(map).bindTooltip('<b>US Office (Washington)</b>', {permanent: true, direction: 'top'});
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
                    el.onclick = () => loadScene(hotspotData.target);
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
        </script>
    </body>
    </html>
  `;

  return (
    // This wrapper div ensures the iframe takes up the full screen.
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <iframe
        srcDoc={htmlContent}
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Virtual Office 360 Tour"
      />
    </div>
  );
}

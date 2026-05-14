import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============ GLOBALS ============
let scene, camera, renderer, controls;
let raycaster, mouse;
let interactiveObjects = [];
let hoveredObject = null;

// ============ MAIN MENU ============
document.getElementById('btn-play').addEventListener('click', startGame);
document.getElementById('btn-menu').addEventListener('click', () => {
  document.getElementById('main-menu').classList.remove('hidden');
  document.getElementById('game-hud').classList.add('hidden');
  document.getElementById('camera-views').classList.add('hidden');
});
document.getElementById('btn-help').addEventListener('click', () => alert('Drag to look around.\nClick colored objects to interact!'));
document.getElementById('btn-credits').addEventListener('click', () => alert('Made by Alifkha'));
document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !document.getElementById('main-menu').classList.contains('hidden')) startGame(); });

function startGame() {
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('loading-screen').classList.remove('hidden');
  simulateLoading();
}

function simulateLoading() {
  const fill = document.getElementById('load-fill');
  const pct = document.getElementById('load-percent');
  const status = document.getElementById('load-status');
  const steps = [
    [15, 'Loading 3D Engine...'],
    [35, 'Building room...'],
    [55, 'Placing furniture...'],
    [75, 'Setting up lighting...'],
    [90, 'Final touches...'],
    [100, 'Ready!']
  ];
  let i = 0;
  const iv = setInterval(() => {
    if (i >= steps.length) { clearInterval(iv); setTimeout(enterRoom, 400); return; }
    fill.style.width = steps[i][0] + '%';
    pct.textContent = steps[i][0] + '%';
    status.textContent = steps[i][1];
    i++;
  }, 500);
}

function enterRoom() {
  document.getElementById('loading-screen').classList.add('hidden');
  document.getElementById('game-hud').classList.remove('hidden');
  document.getElementById('camera-views').classList.remove('hidden');
  initScene();
}


// ============ THREE.JS SCENE ============
function initScene() {
  const container = document.getElementById('canvas-container');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1520);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 2, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2;
  controls.minDistance = 2;
  controls.maxDistance = 8;
  controls.target.set(0, 1.5, 0);

  // Raycaster
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Lighting - warm and cozy
  const ambient = new THREE.AmbientLight(0xfff5ee, 0.5);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffeedd, 0.6);
  dirLight.position.set(3, 5, 2);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // Warm point light (like sunset glow from window)
  const warmLight = new THREE.PointLight(0xffddbb, 0.5, 10);
  warmLight.position.set(-3, 2.5, -1.5);
  scene.add(warmLight);

  // Soft pink ambient from fairy lights
  const pinkLight = new THREE.PointLight(0xffccdd, 0.3, 8);
  pinkLight.position.set(0, 3.5, -2);
  scene.add(pinkLight);

  // Build room
  buildRoom();

  // Events
  window.addEventListener('resize', onResize);
  renderer.domElement.addEventListener('mousedown', onMouseDown);
  renderer.domElement.addEventListener('click', onClick);
  renderer.domElement.addEventListener('mousemove', onMouseMove);

  animate();
}

function buildRoom() {
  const roomSize = { w: 8, h: 4, d: 6 };

  // Floor - light wood / warm tone
  const floorGeo = new THREE.PlaneGeometry(roomSize.w, roomSize.d);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xd4a87a, roughness: 0.7 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Back wall - soft pink/blush
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5e1e8, roughness: 0.9 });
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(roomSize.w, roomSize.h), wallMat);
  backWall.position.set(0, roomSize.h / 2, -roomSize.d / 2);
  scene.add(backWall);

  // Left wall - soft lavender
  const wallMatL = new THREE.MeshStandardMaterial({ color: 0xede4f3, roughness: 0.9 });
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(roomSize.d, roomSize.h), wallMatL);
  leftWall.position.set(-roomSize.w / 2, roomSize.h / 2, 0);
  leftWall.rotation.y = Math.PI / 2;
  scene.add(leftWall);

  // Right wall - soft pink
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(roomSize.d, roomSize.h), wallMat);
  rightWall.position.set(roomSize.w / 2, roomSize.h / 2, 0);
  rightWall.rotation.y = -Math.PI / 2;
  scene.add(rightWall);

  // Ceiling - white/cream
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0xfff8f5, roughness: 0.9 });
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(roomSize.w, roomSize.d), ceilMat);
  ceiling.position.y = roomSize.h;
  ceiling.rotation.x = Math.PI / 2;
  scene.add(ceiling);

  // === FURNITURE ===
  createTV();
  createDesk();
  createBookshelf();
  createBed();
  createLamp();
  createCalendar();
  createWindow();
  createClock();
  createBedLamp();
  createPlant();
  createRug();
  createFairyLights();
  createWallDecor();
}


// ============ FURNITURE BUILDERS ============
function createTV() {
  const group = new THREE.Group();
  // TV body (frame)
  const tvBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 0.1), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
  tvBody.position.set(0, 0, 0);
  group.add(tvBody);

  // Screen - will be updated with video texture
  const screenGeo = new THREE.PlaneGeometry(1.6, 0.9);
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x050508 }); // OFF state
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 0, 0.06);
  screen.name = 'tv-screen';
  group.add(screen);

  // Power LED
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), new THREE.MeshStandardMaterial({ 
    color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.5 
  }));
  led.position.set(0.75, -0.45, 0.06);
  led.name = 'tv-led';
  group.add(led);

  // Stand
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.2), new THREE.MeshStandardMaterial({ color: 0x222222 }));
  stand.position.set(0, -0.85, 0);
  group.add(stand);
  // Cabinet
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(2, 0.4, 0.5), new THREE.MeshStandardMaterial({ color: 0x2d1f15 }));
  cabinet.position.set(0, -1.3, 0);
  group.add(cabinet);

  group.position.set(0, 2.1, -2.85);
  group.userData = { type: 'tv', tooltip: '📺 Click to turn on TV' };
  scene.add(group);
  interactiveObjects.push(group);
}

function createDesk() {
  const group = new THREE.Group();
  const deskColor = new THREE.MeshStandardMaterial({ color: 0xaaaaaa }); // Light gray
  const deskDark = new THREE.MeshStandardMaterial({ color: 0x888888 });
  const black = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

  // Main desk top (L-shaped)
  const topMain = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 1.0), deskColor);
  topMain.position.set(0, 0, 0);
  group.add(topMain);

  // Back panel (behind desk)
  const backPanel = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 0.04), deskColor);
  backPanel.position.set(0, -0.4, -0.48);
  group.add(backPanel);

  // Right side cabinet (drawers)
  const cabinetSide = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.85, 1.0), deskColor);
  cabinetSide.position.set(0.8, -0.42, 0);
  group.add(cabinetSide);

  // Drawer handles (3 drawers on right cabinet)
  for (let i = 0; i < 3; i++) {
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.03), handleMat);
    handle.position.set(0.8, -0.15 - i * 0.25, 0.52);
    group.add(handle);
  }

  // Left side panel
  const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.85, 1.0), deskColor);
  leftPanel.position.set(-1.08, -0.42, 0);
  group.add(leftPanel);

  // Laptop on desk
  const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.35), new THREE.MeshStandardMaterial({ color: 0x666666 }));
  laptopBase.position.set(-0.3, 0.04, 0.05);
  group.add(laptopBase);

  // Laptop screen (tilted)
  const laptopScreen = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.015), new THREE.MeshStandardMaterial({ color: 0x444444 }));
  laptopScreen.position.set(-0.3, 0.22, -0.13);
  laptopScreen.rotation.x = -0.25;
  group.add(laptopScreen);

  // Laptop screen display (colorful gradient - macOS style)
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 200; screenCanvas.height = 140;
  const sctx = screenCanvas.getContext('2d');
  const grad = sctx.createLinearGradient(0,0,200,140);
  grad.addColorStop(0, '#667eea'); grad.addColorStop(0.3, '#e06b9e');
  grad.addColorStop(0.6, '#f5c778'); grad.addColorStop(1, '#7ecbf5');
  sctx.fillStyle = grad; sctx.fillRect(0,0,200,140);
  // Dock icons
  const icons = ['🔵','🔵','🟢','🟢','🟠'];
  icons.forEach((c, i) => { sctx.fillStyle = ['#2563eb','#2563eb','#22c55e','#22c55e','#f59e0b'][i]; sctx.fillRect(60+i*18, 120, 14, 14); });
  const screenTex = new THREE.CanvasTexture(screenCanvas);
  const screenDisplay = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.3), new THREE.MeshBasicMaterial({ map: screenTex }));
  screenDisplay.position.set(-0.3, 0.22, -0.12);
  screenDisplay.rotation.x = -0.25;
  group.add(screenDisplay);

  // Trackpad
  const trackpad = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.005, 0.1), new THREE.MeshStandardMaterial({ color: 0x555555 }));
  trackpad.position.set(-0.3, 0.035, 0.25);
  group.add(trackpad);

  // Mug
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.12, 12), new THREE.MeshStandardMaterial({ color: 0xeeeeee }));
  mug.position.set(0.2, 0.09, 0.1);
  group.add(mug);

  // Small cactus plant
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.08, 10), new THREE.MeshStandardMaterial({ color: 0xc97a3a }));
  pot.position.set(-0.65, 0.07, -0.1);
  group.add(pot);
  const cactus = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshStandardMaterial({ color: 0x2ecc71 }));
  cactus.position.set(-0.65, 0.14, -0.1);
  group.add(cactus);

  // Desk lamp (black, curved arm) - facing towards laptop
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.03, 12), black);
  lampBase.position.set(0.5, 0.04, -0.15);
  group.add(lampBase);
  const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 8), black);
  lampArm.position.set(0.5, 0.3, -0.15);
  lampArm.rotation.z = -0.15;
  group.add(lampArm);
  const lampHead = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.12, 12), black);
  lampHead.position.set(0.4, 0.55, -0.15);
  lampHead.rotation.z = -0.8;
  group.add(lampHead);
  // Desk lamp light (starts OFF)
  const deskLight = new THREE.PointLight(0xffeedd, 0, 3);
  deskLight.position.set(0.4, 0.45, -0.15);
  deskLight.name = 'desk-lamp-light';
  group.add(deskLight);

  // Desk lamp interactive zone
  const deskLampGroup = new THREE.Group();
  const lampZone = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 }));
  lampZone.position.set(0.55, 0.55, -0.15);
  deskLampGroup.add(lampZone);
  deskLampGroup.position.set(-2.8, 0.85, -2.2);
  deskLampGroup.userData = { type: 'desk-lamp', tooltip: '💡 Click to toggle desk lamp' };
  scene.add(deskLampGroup);
  interactiveObjects.push(deskLampGroup);

  // Office chair
  const chairGroup = new THREE.Group();
  // Seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.45), black);
  seat.position.y = 0;
  chairGroup.add(seat);
  // Backrest
  const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.7, 0.05), black);
  backrest.position.set(0, 0.38, -0.2);
  chairGroup.add(backrest);
  // Armrests
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.3), new THREE.MeshStandardMaterial({ color: 0x444444 }));
  armL.position.set(-0.22, 0.12, -0.05);
  chairGroup.add(armL);
  const armR = armL.clone();
  armR.position.x = 0.22;
  chairGroup.add(armR);
  // Pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0x666666 }));
  pole.position.y = -0.23;
  chairGroup.add(pole);
  // Star base
  for (let i = 0; i < 5; i++) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.3), new THREE.MeshStandardMaterial({ color: 0x888888 }));
    leg.position.y = -0.43;
    leg.rotation.y = (i / 5) * Math.PI * 2;
    leg.position.x = Math.sin(leg.rotation.y) * 0.12;
    leg.position.z = Math.cos(leg.rotation.y) * 0.12;
    chairGroup.add(leg);
  }

  chairGroup.position.set(-0.3, -0.35, 0.8);
  chairGroup.rotation.y = Math.PI; // Face the desk/laptop
  group.add(chairGroup);

  group.position.set(-2.8, 0.85, -2.2);
  group.userData = { type: 'laptop', tooltip: '💻 Laptop - Photo Gallery' };
  scene.add(group);
  interactiveObjects.push(group);
}

function createBookshelf() {
  const group = new THREE.Group();
  const woodDark = new THREE.MeshStandardMaterial({ color: 0xf5e6d3 }); // Light cream
  const woodMed = new THREE.MeshStandardMaterial({ color: 0xede0d0 }); // Soft beige
  const woodLight = new THREE.MeshStandardMaterial({ color: 0xfff5ee }); // White-ish

  // Main frame (back panel)
  const back = new THREE.Mesh(new THREE.BoxGeometry(3, 3.2, 0.08), woodDark);
  back.position.z = -0.25;
  group.add(back);

  // Side panels
  const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.2, 0.55), woodMed);
  sideL.position.set(-1.5, 0, 0);
  group.add(sideL);
  const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.2, 0.55), woodMed);
  sideR.position.set(1.5, 0, 0);
  group.add(sideR);

  // Top panel
  const top = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.1, 0.55), woodMed);
  top.position.y = 1.6;
  group.add(top);

  // Shelves (4 shelves)
  const shelfPositions = [0.75, 0, -0.75];
  shelfPositions.forEach(y => {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.06, 0.5), woodMed);
    shelf.position.y = y;
    group.add(shelf);
  });

  // Bottom cabinet section
  const cabinetTop = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.06, 0.55), woodMed);
  cabinetTop.position.y = -1.1;
  group.add(cabinetTop);

  // Cabinet doors (3 drawers)
  for (let i = 0; i < 3; i++) {
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.06), woodLight);
    door.position.set(-0.95 + i * 0.95, -1.5, 0.25);
    group.add(door);
    // Knob
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), new THREE.MeshStandardMaterial({ color: 0x8b6530 }));
    knob.position.set(-0.95 + i * 0.95, -1.5, 0.3);
    group.add(knob);
  }

  // Bottom panel
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.1, 0.55), woodMed);
  bottom.position.y = -1.9;
  group.add(bottom);

  // Books on shelves (pastel colors to match feminine theme)
  const bookColors = [
    0xe8a0bf, 0xa8d8ea, 0xc3b1e1, 0xf8c8dc, 0xb5ead7,
    0xffdac1, 0xc9b1ff, 0x9dd6d0, 0xf0b6d3, 0xaec6cf,
    0xdab894, 0xb8d4e3, 0xf5cac3, 0xa2d2ff, 0xe2c2c6
  ];

  // Row 1 (top shelf: y = 0.75 to 1.6)
  let bx = -1.35;
  for (let i = 0; i < 12; i++) {
    const bh = 0.5 + Math.random() * 0.3;
    const bw = 0.08 + Math.random() * 0.08;
    const tilt = (Math.random() - 0.5) * 0.1;
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(bw, bh, 0.35),
      new THREE.MeshStandardMaterial({ color: bookColors[Math.floor(Math.random() * bookColors.length)] })
    );
    book.position.set(bx, 0.75 + bh/2 + 0.03, 0);
    book.rotation.z = tilt;
    group.add(book);
    bx += bw + 0.04;
    if (bx > 1.3) break;
  }

  // Some stacked books on top shelf
  for (let s = 0; s < 2; s++) {
    const stackX = 0.8 + s * 0.5;
    for (let j = 0; j < 2 + Math.floor(Math.random()*2); j++) {
      const sb = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.06, 0.2 + Math.random()*0.1),
        new THREE.MeshStandardMaterial({ color: bookColors[Math.floor(Math.random() * bookColors.length)] })
      );
      sb.position.set(stackX, 0.78 + j * 0.07 + 0.5, 0);
      group.add(sb);
    }
  }

  // Row 2 (middle shelf: y = 0 to 0.75)
  bx = -1.35;
  for (let i = 0; i < 14; i++) {
    const bh = 0.4 + Math.random() * 0.25;
    const bw = 0.06 + Math.random() * 0.1;
    const tilt = (Math.random() - 0.5) * 0.08;
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(bw, bh, 0.35),
      new THREE.MeshStandardMaterial({ color: bookColors[Math.floor(Math.random() * bookColors.length)] })
    );
    book.position.set(bx, bh/2 + 0.03, 0);
    book.rotation.z = tilt;
    group.add(book);
    bx += bw + 0.03;
    if (bx > 1.35) break;
  }

  // Some tilted/stacked books in middle
  const tiltedBook = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.06, 0.25),
    new THREE.MeshStandardMaterial({ color: 0xd4ac0d })
  );
  tiltedBook.position.set(0.3, 0.35, 0.05);
  tiltedBook.rotation.z = 0.3;
  group.add(tiltedBook);

  // Row 3 (bottom shelf: y = -0.75 to 0)
  bx = -1.35;
  for (let i = 0; i < 15; i++) {
    const bh = 0.35 + Math.random() * 0.3;
    const bw = 0.06 + Math.random() * 0.08;
    const tilt = (Math.random() - 0.5) * 0.06;
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(bw, bh, 0.35),
      new THREE.MeshStandardMaterial({ color: bookColors[Math.floor(Math.random() * bookColors.length)] })
    );
    book.position.set(bx, -0.75 + bh/2 + 0.03, 0);
    book.rotation.z = tilt;
    group.add(book);
    bx += bw + 0.03;
    if (bx > 1.35) break;
  }

  // Some horizontal stacked books on bottom shelf
  for (let j = 0; j < 3; j++) {
    const sb = new THREE.Mesh(
      new THREE.BoxGeometry(0.25 + Math.random()*0.1, 0.06, 0.2),
      new THREE.MeshStandardMaterial({ color: bookColors[Math.floor(Math.random() * bookColors.length)] })
    );
    sb.position.set(-0.5, -0.72 + j * 0.07, 0.05);
    group.add(sb);
  }

  group.position.set(3.7, 1.9, -1.2);
  group.rotation.y = -Math.PI / 2; // Face left (on right wall)
  group.userData = { type: 'book', tooltip: '📖 Click to read a message' };
  scene.add(group);
  interactiveObjects.push(group);
}

function createBed() {
  const group = new THREE.Group();
  const pink = new THREE.MeshStandardMaterial({ color: 0xf8c8dc });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const pinkDark = new THREE.MeshStandardMaterial({ color: 0xe8a0bf });
  const wood = new THREE.MeshStandardMaterial({ color: 0xf5e6d3 });

  // Mattress (white)
  const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.25, 2), white);
  group.add(mattress);
  // Bed frame (light wood)
  const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 2.1), wood);
  bedFrame.position.y = -0.18;
  group.add(bedFrame);
  // Blanket (pink) - on the side facing TV
  const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 1.3), pink);
  blanket.position.set(0, 0.15, -0.3);
  group.add(blanket);
  // Pillows - on headboard side (back, +Z)
  const pillow1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.5), white);
  pillow1.position.set(-0.3, 0.22, 0.75);
  group.add(pillow1);
  const pillow2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.5), white);
  pillow2.position.set(0.3, 0.22, 0.75);
  group.add(pillow2);
  // Decorative pillow (small, pink)
  const decoPillow = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.3), pinkDark);
  decoPillow.position.set(0, 0.25, 0.55);
  decoPillow.rotation.y = 0.1;
  group.add(decoPillow);
  // Plushie
  const plushie = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: 0xf5deb3 }));
  plushie.position.set(0.5, 0.25, -0.5);
  group.add(plushie);
  const plushieHead = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshStandardMaterial({ color: 0xf5deb3 }));
  plushieHead.position.set(0.5, 0.38, -0.5);
  group.add(plushieHead);
  // Headboard (white, behind pillows - will be against left wall after rotation)
  const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.1), new THREE.MeshStandardMaterial({ color: 0xfff5ee }));
  headboard.position.set(0, 0.5, 1.05);
  group.add(headboard);

  // Position: against left wall, facing right wall
  group.position.set(-2.9, 0.4, 1.5);
  group.rotation.y = -Math.PI / 2;
  scene.add(group);
}

function createLamp() {
  const group = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({ color: 0xfff5ee });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd4a87a });

  // Base (round, gold)
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.05, 16), gold);
  group.add(base);
  // Pole (thin, white)
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 8), white);
  pole.position.y = 0.72;
  group.add(pole);
  // Shade (soft fabric look - light pink/cream)
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.25, 0.3, 16, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xfff0f0, side: THREE.DoubleSide })
  );
  shade.position.y = 1.45;
  group.add(shade);
  // Warm light (starts OFF)
  const light = new THREE.PointLight(0xffeedd, 0, 4);
  light.position.y = 1.4;
  light.name = 'standing-lamp-light';
  group.add(light);

  group.position.set(-3.6, 0.03, 2.6);
  group.userData = { type: 'standing-lamp', tooltip: '💡 Click to toggle lamp' };
  scene.add(group);
  interactiveObjects.push(group);
}

function createCalendar() {
  const group = new THREE.Group();

  // Frame (dark border)
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.95, 0.03),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  group.add(frame);

  // Calendar face with canvas texture
  const canvas = document.createElement('canvas');
  canvas.width = 360;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 360, 480);

  // Red header
  ctx.fillStyle = '#d42020';
  ctx.fillRect(0, 0, 360, 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MAY', 180, 44);

  // Day headers
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 14px sans-serif';
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const colW = 360 / 7;
  days.forEach((d, i) => {
    ctx.fillText(d, colW * i + colW/2, 85);
  });

  // Line under headers
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(10, 92);
  ctx.lineTo(350, 92);
  ctx.stroke();

  // May 2026 starts on Friday (day index 5)
  // Days: 1-31, first day = Friday
  const startDay = 5; // 0=Sun, 5=Fri
  const totalDays = 31;
  const highlightDay = 13;

  ctx.font = 'bold 24px sans-serif';
  let row = 0;
  let col = startDay;

  for (let day = 1; day <= totalDays; day++) {
    const x = colW * col + colW/2;
    const y = 130 + row * 50;

    // Highlight circle for special day
    if (day === highlightDay) {
      ctx.fillStyle = '#f5b731';
      ctx.beginPath();
      ctx.arc(x, y - 8, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 26px sans-serif';
    } else {
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 24px sans-serif';
    }

    ctx.fillText(String(day), x, y);

    col++;
    if (col > 6) {
      col = 0;
      row++;
    }
  }

  // Apply canvas as texture
  const texture = new THREE.CanvasTexture(canvas);
  const calFace = new THREE.Mesh(
    new THREE.PlaneGeometry(0.62, 0.87),
    new THREE.MeshBasicMaterial({ map: texture })
  );
  calFace.position.z = 0.02;
  group.add(calFace);

  group.position.set(-2.8, 2.5, -2.95);
  group.rotation.y = 0; // Face forward (on back wall)
  group.userData = { type: 'calendar', tooltip: '📅 Calendar - May 2026' };
  scene.add(group);
  interactiveObjects.push(group);
}

function createWindow() {
  const group = new THREE.Group();
  // Frame (white)
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.8, 0.1), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  group.add(frame);
  // Glass (sky blue with warm light)
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.6), new THREE.MeshStandardMaterial({ 
    color: 0xa8d8ea, emissive: 0x88bbdd, emissiveIntensity: 0.4 
  }));
  glass.position.z = 0.06;
  group.add(glass);
  // Window cross (white divider)
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.04, 0.05), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  crossH.position.z = 0.07;
  group.add(crossH);
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.6, 0.05), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  crossV.position.z = 0.07;
  group.add(crossV);
  // Curtains (soft pink, on sides)
  const curtainMat = new THREE.MeshStandardMaterial({ color: 0xf8d8e8, side: THREE.DoubleSide });
  const curtainL = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 2.0), curtainMat);
  curtainL.position.set(-0.85, 0, 0.08);
  group.add(curtainL);
  const curtainR = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 2.0), curtainMat);
  curtainR.position.set(0.85, 0, 0.08);
  group.add(curtainR);

  group.position.set(-3.9, 2.2, -1.2);
  group.rotation.y = Math.PI / 2;
  scene.add(group);
}


// ============ ADDITIONAL FURNITURE ============
function createFairyLights() {
  // String of warm fairy lights along back wall top
  const lightMat = new THREE.MeshStandardMaterial({ 
    color: 0xfff5cc, emissive: 0xfff0aa, emissiveIntensity: 0.8 
  });
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

  // Wire along back wall (above TV area)
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 6, 4), wireMat);
  wire.position.set(0, 3.6, -2.92);
  wire.rotation.z = Math.PI / 2;
  scene.add(wire);

  // Light bulbs on back wall
  for (let i = 0; i < 12; i++) {
    const x = -2.5 + i * 0.45;
    const y = 3.5 + Math.sin(i * 0.8) * 0.08;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), lightMat);
    bulb.position.set(x, y, -2.88);
    scene.add(bulb);
    // Add point light for every 3rd bulb
    if (i % 3 === 0) {
      const pl = new THREE.PointLight(0xfff0aa, 0.15, 2);
      pl.position.set(x, y, -2.8);
      scene.add(pl);
    }
  }

  // Second string on left wall (higher up, not overlapping furniture)
  const wire2 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 4, 4), wireMat);
  wire2.position.set(-3.92, 3.4, 0.5);
  wire2.rotation.x = Math.PI / 2;
  scene.add(wire2);

  for (let i = 0; i < 8; i++) {
    const z = -1 + i * 0.4;
    const y = 3.3 + Math.sin(i * 0.7) * 0.08;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), lightMat);
    bulb.position.set(-3.88, y, z);
    scene.add(bulb);
  }
}

function createWallDecor() {
  // Mirror on right wall, between TV corner and bookshelf
  const mirror = new THREE.Mesh(new THREE.CircleGeometry(0.4, 24), new THREE.MeshStandardMaterial({ 
    color: 0xeeeeff, metalness: 0.8, roughness: 0.1 
  }));
  mirror.position.set(2, 2.5, -2.95);
  mirror.rotation.y = 0;
  scene.add(mirror);
  // Mirror frame (gold)
  const mirrorFrame = new THREE.Mesh(new THREE.RingGeometry(0.38, 0.44, 32), new THREE.MeshStandardMaterial({ color: 0xd4a87a, side: THREE.DoubleSide }));
  mirrorFrame.position.set(2, 2.5, -2.94);
  mirrorFrame.rotation.y = 0;
  scene.add(mirrorFrame);
}

function createClock() {
  const group = new THREE.Group();
  // Clock face
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.3, 32), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  group.add(face);
  // Border
  const border = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.32, 32), new THREE.MeshStandardMaterial({ color: 0x333333, side: THREE.DoubleSide }));
  border.position.z = 0.01;
  group.add(border);
  // Hour hand
  const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.15, 0.01), new THREE.MeshStandardMaterial({ color: 0x333333 }));
  hourHand.position.set(0, 0.06, 0.02);
  group.add(hourHand);
  // Minute hand
  const minHand = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.01), new THREE.MeshStandardMaterial({ color: 0x333333 }));
  minHand.position.set(0.05, 0.08, 0.02);
  minHand.rotation.z = -0.5;
  group.add(minHand);

  // Position clock on left wall above bed
  group.position.set(-3.95, 2.8, 1.5);
  group.rotation.y = Math.PI / 2; // Face right
  scene.add(group);
}

function createBedLamp() {
  const group = new THREE.Group();
  // Nightstand (white/cream to match theme)
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.4), new THREE.MeshStandardMaterial({ color: 0xfff5ee }));
  group.add(stand);
  // Small drawer handle
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.02), new THREE.MeshStandardMaterial({ color: 0xd4a87a }));
  handle.position.set(0, 0, 0.21);
  group.add(handle);
  // Lamp base (gold/rose gold)
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.04, 12), new THREE.MeshStandardMaterial({ color: 0xd4a87a }));
  base.position.y = 0.28;
  group.add(base);
  // Lamp pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0xd4a87a }));
  pole.position.y = 0.43;
  group.add(pole);
  // Lamp shade (soft pink)
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.18, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0xfff0f0, side: THREE.DoubleSide }));
  shade.position.y = 0.6;
  group.add(shade);
  // Warm light (starts OFF)
  const glow = new THREE.PointLight(0xffeedd, 0, 2.5);
  glow.position.y = 0.55;
  glow.name = 'nightstand-lamp-light';
  group.add(glow);

  // Position nightstand beside bed (front side, against left wall)
  group.position.set(-3.6, 0.25, 0.4);
  group.userData = { type: 'nightstand-lamp', tooltip: '💡 Click to toggle lamp' };
  scene.add(group);
  interactiveObjects.push(group);
}

function createPlant() {
  const group = new THREE.Group();
  // Pot (white ceramic)
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.2, 12), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  group.add(pot);
  // Soil
  const soil = new THREE.Mesh(new THREE.CircleGeometry(0.11, 12), new THREE.MeshStandardMaterial({ color: 0x3d2b1f }));
  soil.position.y = 0.1;
  soil.rotation.x = -Math.PI / 2;
  group.add(soil);
  // Leaves (spheres - fuller plant)
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
  const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), leafMat);
  leaf1.position.set(0, 0.28, 0);
  group.add(leaf1);
  const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), leafMat);
  leaf2.position.set(0.08, 0.38, 0.05);
  group.add(leaf2);
  const leaf3 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), leafMat);
  leaf3.position.set(-0.07, 0.35, -0.04);
  group.add(leaf3);

  // Position beside bookshelf (right wall area)
  group.position.set(3.8, 0.1, 0.5);
  scene.add(group);
}

function createRug() {
  // Pink fluffy rug
  const rug = new THREE.Mesh(
    new THREE.CircleGeometry(1.2, 32),
    new THREE.MeshStandardMaterial({ color: 0xf8c8dc, roughness: 1.0 })
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.01, 0);
  scene.add(rug);
}

// ============ CAMERA VIEWS ============
const cameraViews = {
  overview: { pos: [0, 2.5, 5.5], target: [0, 1.5, 0] },
  desk: { pos: [-1.5, 1.8, -0.5], target: [-2.8, 1, -2.2] },
  bed: { pos: [0, 2, 3], target: [-2.9, 0.8, 1.5] },
  tv: { pos: [0, 2.2, 0.5], target: [0, 2.1, -2.85] },
  bookshelf: { pos: [2, 2, 0.5], target: [3.7, 1.9, -1.2] },
};

function moveCameraTo(viewName) {
  const view = cameraViews[viewName];
  if (!view) return;

  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const endPos = new THREE.Vector3(...view.pos);
  const endTarget = new THREE.Vector3(...view.target);

  let progress = 0;
  const duration = 60; // frames

  function animateCamera() {
    progress++;
    const t = easeInOutCubic(progress / duration);

    camera.position.lerpVectors(startPos, endPos, t);
    controls.target.lerpVectors(startTarget, endTarget, t);
    controls.update();

    if (progress < duration) requestAnimationFrame(animateCamera);
  }
  animateCamera();
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Expose camera view switching to HUD buttons
window.moveCameraTo = moveCameraTo;

// ============ INTERACTION & EVENTS ============
let mouseDownPos = { x: 0, y: 0 };

function onMouseDown(event) {
  mouseDownPos.x = event.clientX;
  mouseDownPos.y = event.clientY;
}

function onClick(event) {
  // Only register as click if mouse didn't move much (not a drag)
  const dx = event.clientX - mouseDownPos.x;
  const dy = event.clientY - mouseDownPos.y;
  if (Math.sqrt(dx*dx + dy*dy) > 5) return; // Was a drag, not a click

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const allMeshes = [];
  interactiveObjects.forEach(obj => obj.traverse(child => { if (child.isMesh) allMeshes.push(child); }));
  const intersects = raycaster.intersectObjects(allMeshes);

  if (intersects.length > 0) {
    const hit = intersects[0].object;
    const parent = findInteractiveParent(hit);
    if (parent && parent.userData.type) {
      handleInteraction(parent.userData.type);
    }
  }
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const allMeshes = [];
  interactiveObjects.forEach(obj => obj.traverse(child => { if (child.isMesh) allMeshes.push(child); }));
  const intersects = raycaster.intersectObjects(allMeshes);

  const prompt = document.getElementById('interact-prompt');
  const promptText = document.getElementById('prompt-text');

  if (intersects.length > 0) {
    const parent = findInteractiveParent(intersects[0].object);
    if (parent && parent.userData.tooltip) {
      prompt.style.display = 'block';
      promptText.textContent = parent.userData.tooltip;
      renderer.domElement.style.cursor = 'pointer';
      // Highlight
      if (hoveredObject !== parent) {
        resetHighlight();
        hoveredObject = parent;
        parent.traverse(child => { if (child.isMesh && child.material) child.material.emissiveIntensity = 0.3; });
      }
      return;
    }
  }
  prompt.style.display = 'none';
  renderer.domElement.style.cursor = 'grab';
  resetHighlight();
  hoveredObject = null;
}

function resetHighlight() {
  if (hoveredObject) {
    hoveredObject.traverse(child => {
      if (child.isMesh && child.material && child.material.emissiveIntensity !== undefined) {
        child.material.emissiveIntensity = child.material.userData?.origEmissive || 0;
      }
    });
  }
}

function findInteractiveParent(obj) {
  let current = obj;
  while (current) {
    if (current.userData && current.userData.type) return current;
    current = current.parent;
  }
  return null;
}

function handleInteraction(type) {
  switch (type) {
    case 'tv': toggleTV(); break;
    case 'laptop': openLaptop(); break;
    case 'book': openModal('modal-message'); break;
    case 'calendar': openModal('modal-calendar'); break;
    case 'standing-lamp': toggleLamp('standing-lamp-light', 0.4); break;
    case 'nightstand-lamp': toggleLamp('nightstand-lamp-light', 0.3); break;
    case 'desk-lamp': toggleLamp('desk-lamp-light', 0.6); break;
  }
}

// ============ LAMP TOGGLE ============
function toggleLamp(lightName, maxIntensity) {
  let light = null;
  scene.traverse((child) => {
    if (child.name === lightName) light = child;
  });
  if (light) {
    light.intensity = light.intensity > 0 ? 0 : maxIntensity;
  }
}

// ============ LAPTOP (macOS Interface) ============
function openLaptop() {
  const overlay = document.getElementById('laptop-overlay');
  if (overlay) {
    overlay.classList.add('active');
    controls.enabled = false;
    loadPhotosGrid();
    loadSpotifyTracks();
    updateMacTime();
  }
}

function closeLaptop() {
  const overlay = document.getElementById('laptop-overlay');
  if (overlay) overlay.classList.remove('active');
  controls.enabled = true;
  // Close any open apps
  document.querySelectorAll('.app-window').forEach(w => w.classList.remove('active'));
}
window.closeLaptop = closeLaptop;

function openApp(name) {
  document.querySelectorAll('.app-window').forEach(w => w.classList.remove('active'));
  const app = document.getElementById('app-' + name);
  if (app) app.classList.add('active');
}
window.openApp = openApp;

function closeApp(name) {
  const app = document.getElementById('app-' + name);
  if (app) app.classList.remove('active');
}
window.closeApp = closeApp;

function updateMacTime() {
  const el = document.getElementById('macos-time');
  if (el) {
    const now = new Date();
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    el.textContent = days[now.getDay()] + ' ' + now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  }
}

// Photos App
let viewerIndex = 0;
function loadPhotosGrid() {
  const grid = document.getElementById('photos-grid');
  if (!grid || typeof CONFIG === 'undefined' || !CONFIG.photos) return;
  grid.innerHTML = '';
  CONFIG.photos.forEach((photo, i) => {
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.caption || '';
    img.onerror = function() { this.style.background = '#333'; this.alt = '?'; };
    img.addEventListener('click', () => openPhotoViewer(i));
    grid.appendChild(img);
  });
}

function openPhotoViewer(index) {
  viewerIndex = index;
  const viewer = document.getElementById('photo-viewer');
  const img = document.getElementById('photo-viewer-img');
  const info = document.getElementById('photo-viewer-info');
  if (!viewer || typeof CONFIG === 'undefined') return;
  viewer.classList.add('active');
  const photo = CONFIG.photos[index];
  img.src = photo.src;
  info.textContent = (photo.caption || 'Photo') + ' • ' + (index+1) + ' of ' + CONFIG.photos.length;
}
window.openPhotoViewer = openPhotoViewer;

function closePhotoViewer() {
  document.getElementById('photo-viewer')?.classList.remove('active');
}
window.closePhotoViewer = closePhotoViewer;

function viewerNext() {
  if (typeof CONFIG === 'undefined' || !CONFIG.photos) return;
  viewerIndex = (viewerIndex + 1) % CONFIG.photos.length;
  openPhotoViewer(viewerIndex);
}
window.viewerNext = viewerNext;

function viewerPrev() {
  if (typeof CONFIG === 'undefined' || !CONFIG.photos) return;
  viewerIndex = (viewerIndex - 1 + CONFIG.photos.length) % CONFIG.photos.length;
  openPhotoViewer(viewerIndex);
}
window.viewerPrev = viewerPrev;

// Spotify App
let spotifyPlaying2 = false;
function loadSpotifyTracks() {
  const list = document.getElementById('spotify-tracklist2');
  if (!list) return;
  list.innerHTML = '';
  const songs = ['First Song', 'Second Song', 'Third Song', 'Fourth Song', 'Fifth Song'];
  songs.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'spotify-track-row';
    row.innerHTML = `<span class="track-num">${i+1}</span><span class="track-play">♪</span><span class="track-name">${s}</span><span class="track-duration">${3+Math.floor(Math.random()*2)}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}</span>`;
    list.appendChild(row);
  });
}

function toggleSpotifyPlay() {
  const btn = document.getElementById('spotify-play-btn2');
  if (!btn) return;
  spotifyPlaying2 = !spotifyPlaying2;
  btn.textContent = spotifyPlaying2 ? '⏸' : '▶';
  // Also toggle actual music if available
  if (typeof CONFIG !== 'undefined' && CONFIG.audioSrc) {
    if (!window._spotifyAudio) {
      window._spotifyAudio = new Audio(CONFIG.audioSrc);
      window._spotifyAudio.loop = true;
      window._spotifyAudio.volume = 0.5;
    }
    if (spotifyPlaying2) window._spotifyAudio.play().catch(()=>{});
    else window._spotifyAudio.pause();
  }
}
window.toggleSpotifyPlay = toggleSpotifyPlay;

// ============ TV VIDEO ON 3D SCREEN ============
let tvOn = false;
let tvVideoEl = null;
let tvVideoTexture = null;
let tvScreenMesh = null;
let tvVideoIndex = 0;
let tvState = 'off'; // 'off', 'gallery', 'playing'
let tvGalleryCanvas = null;
let tvGalleryTexture = null;

function toggleTV() {
  // Find TV screen mesh in scene (recursive search)
  scene.traverse((child) => {
    if (child.name === 'tv-screen') tvScreenMesh = child;
  });
  if (!tvScreenMesh) {
    console.warn('TV screen mesh not found');
    return;
  }

  if (tvState === 'off') {
    showTVGalleryScreen();
  } else if (tvState === 'gallery') {
    // Play selected video
    playSelectedVideo();
  } else if (tvState === 'playing') {
    // Back to gallery
    stopVideo();
    showTVGalleryScreen();
  }
}

function showTVGalleryScreen() {
  tvState = 'gallery';
  tvOn = true;

  // Create gallery canvas
  if (!tvGalleryCanvas) {
    tvGalleryCanvas = document.createElement('canvas');
    tvGalleryCanvas.width = 640;
    tvGalleryCanvas.height = 360;
  }

  drawGalleryUI();

  // Apply canvas as texture
  tvGalleryTexture = new THREE.CanvasTexture(tvGalleryCanvas);
  tvScreenMesh.material = new THREE.MeshBasicMaterial({ map: tvGalleryTexture });

  // Change LED to green
  let led = null;
  scene.traverse((child) => { if (child.name === 'tv-led') led = child; });
  if (led) {
    led.material.color.setHex(0x00ff00);
    led.material.emissive.setHex(0x00ff00);
  }

  // Show gallery HUD controls
  showTVGalleryHUD(true);
  showTVControls(false);

  moveCameraTo('tv');
}

function drawGalleryUI() {
  if (!tvGalleryCanvas || typeof CONFIG === 'undefined' || !CONFIG.videos) return;
  const ctx = tvGalleryCanvas.getContext('2d');
  const w = tvGalleryCanvas.width;
  const h = tvGalleryCanvas.height;

  // Background
  ctx.fillStyle = '#0a1628';
  ctx.fillRect(0, 0, w, h);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('Video Gallery', 30, 45);
  ctx.fillStyle = '#667788';
  ctx.font = '14px sans-serif';
  ctx.fillText('Select a video to play', 30, 68);

  // Line separator
  ctx.strokeStyle = '#1a3050';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(30, 80);
  ctx.lineTo(w - 30, 80);
  ctx.stroke();

  // Video cards
  const videos = CONFIG.videos;
  const cardW = 140;
  const cardH = 120;
  const gap = 20;
  const totalW = videos.length * cardW + (videos.length - 1) * gap;
  const startX = (w - totalW) / 2;
  const cardY = 110;

  const colors = ['#5b9bd5', '#4ecdc4', '#d4a843', '#e06060', '#9b59b6'];

  videos.forEach((video, i) => {
    const x = startX + i * (cardW + gap);
    const isSelected = i === tvVideoIndex;

    // Card background
    const gradient = ctx.createLinearGradient(x, cardY, x + cardW, cardY + cardH);
    const color = video.color || colors[i % colors.length];
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, shadeColor(color, -30));
    
    // Selected border
    if (isSelected) {
      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 4, cardY - 4, cardW + 8, cardH + 8);
      ctx.shadowColor = 'rgba(78, 205, 196, 0.4)';
      ctx.shadowBlur = 15;
    }

    // Card fill
    ctx.fillStyle = gradient;
    roundRect(ctx, x, cardY, cardW, cardH, 10);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Play icon (circle + triangle) for selected
    if (isSelected) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(x + cardW/2, cardY + cardH/2 - 5, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.moveTo(x + cardW/2 - 6, cardY + cardH/2 - 13);
      ctx.lineTo(x + cardW/2 - 6, cardY + cardH/2 + 3);
      ctx.lineTo(x + cardW/2 + 8, cardY + cardH/2 - 5);
      ctx.closePath();
      ctx.fill();
    }

    // Title below card
    ctx.fillStyle = '#ffffff';
    ctx.font = isSelected ? 'bold 12px sans-serif' : '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(video.title, x + cardW/2, cardY + cardH + 20);
    ctx.textAlign = 'left';
  });

  // Bottom hint
  ctx.fillStyle = '#445566';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Use ◀ ▶ to navigate • Click TV or press ENTER to play', w/2, h - 20);
  ctx.textAlign = 'left';

  // Update texture
  if (tvGalleryTexture) tvGalleryTexture.needsUpdate = true;
}

function shadeColor(hex, amount) {
  try {
    let color = hex.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(color.slice(0,2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(color.slice(2,4), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(color.slice(4,6), 16) + amount));
    return `rgb(${r},${g},${b})`;
  } catch(e) { return hex; }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function playSelectedVideo() {
  if (typeof CONFIG === 'undefined' || !CONFIG.videos || !CONFIG.videos[tvVideoIndex]) return;

  tvState = 'playing';
  const videoData = CONFIG.videos[tvVideoIndex];

  // Create or reuse video element
  if (!tvVideoEl) {
    tvVideoEl = document.createElement('video');
    tvVideoEl.playsInline = true;
    tvVideoEl.loop = true;
    tvVideoEl.muted = false;
    tvVideoEl.crossOrigin = 'anonymous';
    tvVideoEl.style.display = 'none';
    document.body.appendChild(tvVideoEl);
  }

  tvVideoEl.src = videoData.src;

  tvVideoEl.addEventListener('loadedmetadata', function onMeta() {
    tvVideoEl.removeEventListener('loadedmetadata', onMeta);
    
    const videoW = tvVideoEl.videoWidth;
    const videoH = tvVideoEl.videoHeight;
    const videoAspect = videoW / videoH;
    const screenW = 1.6;
    const screenH = 0.9;
    const screenAspect = screenW / screenH;
    
    let planeW, planeH;
    if (videoAspect > screenAspect) {
      planeW = screenW;
      planeH = screenW / videoAspect;
    } else {
      planeH = screenH;
      planeW = screenH * videoAspect;
    }
    
    // Black background
    tvScreenMesh.material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    // Remove old video plane if exists
    const oldPlane = tvScreenMesh.parent?.getObjectByName('tv-video-plane');
    if (oldPlane) { oldPlane.geometry.dispose(); oldPlane.material.dispose(); tvScreenMesh.parent.remove(oldPlane); }

    // Create video plane
    tvVideoTexture = new THREE.VideoTexture(tvVideoEl);
    tvVideoTexture.minFilter = THREE.LinearFilter;
    tvVideoTexture.magFilter = THREE.LinearFilter;
    
    const videoMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(planeW, planeH),
      new THREE.MeshBasicMaterial({ map: tvVideoTexture })
    );
    videoMesh.position.copy(tvScreenMesh.position);
    videoMesh.position.z += 0.001;
    videoMesh.name = 'tv-video-plane';
    tvScreenMesh.parent.add(videoMesh);
  }, { once: true });

  tvVideoEl.play().catch(() => {
    tvVideoEl.muted = true;
    tvVideoEl.play().catch(() => {});
  });

  showTVGalleryHUD(false);
  showTVControls(true);
}

function stopVideo() {
  if (tvVideoEl) tvVideoEl.pause();
  // Remove video plane
  if (tvScreenMesh && tvScreenMesh.parent) {
    const videoPlane = tvScreenMesh.parent.getObjectByName('tv-video-plane');
    if (videoPlane) {
      videoPlane.geometry.dispose();
      videoPlane.material.dispose();
      tvScreenMesh.parent.remove(videoPlane);
    }
  }
  tvState = 'gallery';
}

function tvNextVideo() {
  if (typeof CONFIG === 'undefined' || !CONFIG.videos) return;
  tvVideoIndex = (tvVideoIndex + 1) % CONFIG.videos.length;
  if (tvState === 'playing') {
    stopVideo();
    playSelectedVideo();
  } else if (tvState === 'gallery') {
    drawGalleryUI();
  }
  updateTVHUD();
}

function tvPrevVideo() {
  if (typeof CONFIG === 'undefined' || !CONFIG.videos) return;
  tvVideoIndex = (tvVideoIndex - 1 + CONFIG.videos.length) % CONFIG.videos.length;
  if (tvState === 'playing') {
    stopVideo();
    playSelectedVideo();
  } else if (tvState === 'gallery') {
    drawGalleryUI();
  }
  updateTVHUD();
}

function tvTogglePause() {
  if (!tvVideoEl) return;
  if (tvVideoEl.paused) {
    tvVideoEl.play();
    document.getElementById('tv-hud-pause').textContent = '⏸ Pause';
  } else {
    tvVideoEl.pause();
    document.getElementById('tv-hud-pause').textContent = '▶ Play';
  }
}

function tvBackToGallery() {
  stopVideo();
  showTVGalleryScreen();
}

function turnOffTV() {
  if (tvVideoEl) tvVideoEl.pause();
  if (tvScreenMesh) {
    tvScreenMesh.material = new THREE.MeshBasicMaterial({ color: 0x050508 });
    if (tvScreenMesh.parent) {
      const videoPlane = tvScreenMesh.parent.getObjectByName('tv-video-plane');
      if (videoPlane) { videoPlane.geometry.dispose(); videoPlane.material.dispose(); tvScreenMesh.parent.remove(videoPlane); }
    }
  }
  let led = null;
  scene.traverse((child) => { if (child.name === 'tv-led') led = child; });
  if (led) { led.material.color.setHex(0xff0000); led.material.emissive.setHex(0xff0000); }
  tvState = 'off';
  tvOn = false;
  showTVControls(false);
  showTVGalleryHUD(false);
}

function showTVControls(show) {
  const hud = document.getElementById('tv-controls-hud');
  if (hud) hud.style.display = show ? 'flex' : 'none';
  if (show) updateTVHUD();
}

function showTVGalleryHUD(show) {
  const hud = document.getElementById('tv-gallery-hud');
  if (hud) hud.style.display = show ? 'flex' : 'none';
}

function updateTVHUD() {
  const title = document.getElementById('tv-hud-title');
  if (title && typeof CONFIG !== 'undefined' && CONFIG.videos[tvVideoIndex]) {
    title.textContent = '📺 ' + CONFIG.videos[tvVideoIndex].title;
  }
}

window.toggleTV = toggleTV;
window.turnOffTV = turnOffTV;
window.tvNextVideo = tvNextVideo;
window.tvPrevVideo = tvPrevVideo;
window.tvTogglePause = tvTogglePause;
window.tvBackToGallery = tvBackToGallery;
window.tvSelectPlay = playSelectedVideo;

// ============ MODALS ============
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
  controls.enabled = false;
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
  controls.enabled = true;
}

document.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', closeAllModals));
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeAllModals(); });
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllModals(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const laptop = document.getElementById('laptop-overlay');
    if (laptop && laptop.classList.contains('active')) { closeLaptop(); return; }
  }
  // Arrow keys for photo viewer
  const viewer = document.getElementById('photo-viewer');
  if (viewer && viewer.classList.contains('active')) {
    if (e.key === 'ArrowRight') { viewerNext(); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { viewerPrev(); e.preventDefault(); }
    else if (e.key === 'Escape') { closePhotoViewer(); e.preventDefault(); }
  }
});

// ============ PHOTO GALLERY (Laptop) ============
let galIndex = 0;
function loadGallery() {
  if (typeof CONFIG === 'undefined' || !CONFIG.photos || CONFIG.photos.length === 0) return;
  galIndex = 0;
  updateGallery();
}
function updateGallery() {
  const frame = document.getElementById('gallery-frame');
  const caption = document.getElementById('gallery-caption');
  const counter = document.getElementById('gal-counter');
  if (!frame || typeof CONFIG === 'undefined') return;
  const photo = CONFIG.photos[galIndex];
  if (photo) {
    frame.innerHTML = `<img src="${photo.src}" alt="${photo.caption || ''}" onerror="this.outerHTML='<span class=no-photo>Photo not found</span>'">`;
    if (caption) caption.textContent = photo.caption || '';
    if (counter) counter.textContent = `${galIndex + 1} / ${CONFIG.photos.length}`;
  }
}
document.getElementById('gal-prev').addEventListener('click', () => {
  if (typeof CONFIG !== 'undefined' && CONFIG.photos.length > 0) {
    galIndex = (galIndex - 1 + CONFIG.photos.length) % CONFIG.photos.length;
    updateGallery();
  }
});
document.getElementById('gal-next').addEventListener('click', () => {
  if (typeof CONFIG !== 'undefined' && CONFIG.photos.length > 0) {
    galIndex = (galIndex + 1) % CONFIG.photos.length;
    updateGallery();
  }
});

// ============ SPOTIFY / MUSIC ============
let bgMusic = null;
let isPlaying = false;
document.getElementById('spotify-play').addEventListener('click', () => {
  if (!bgMusic && typeof CONFIG !== 'undefined' && CONFIG.audioSrc) {
    bgMusic = new Audio(CONFIG.audioSrc);
    bgMusic.loop = true;
    bgMusic.volume = 0.5;
  }
  if (!bgMusic) return;
  if (isPlaying) { bgMusic.pause(); isPlaying = false; document.getElementById('spotify-play').textContent = '▶'; }
  else { bgMusic.play().then(() => { isPlaying = true; document.getElementById('spotify-play').textContent = '⏸'; }).catch(() => {}); }
});

// Populate spotify tracks
(function() {
  const tracks = document.getElementById('spotify-tracks');
  if (!tracks) return;
  const songs = ['First Song', 'Second Song', 'Third Song', 'Fourth Song', 'Fifth Song'];
  songs.forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'spotify-track';
    el.innerHTML = `<span class="track-num">${i+1}</span><span class="track-title">${s}</span><span class="track-dur">${3+Math.floor(Math.random()*2)}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}</span>`;
    tracks.appendChild(el);
  });
})();

// ============ ANIMATION LOOP ============
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

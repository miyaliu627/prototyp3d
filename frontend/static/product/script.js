// script.js

// Create a scene.
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Light blue sky

// Set up a perspective camera.
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.6, 5);

// Create a WebGL renderer and add it to the document.
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a ground plane.
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;  // Lay flat (horizontal)
scene.add(plane);

// Add ambient and directional light.
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Create a stylized 3D tree asset.
function createTree(position) {
  const tree = new THREE.Group();

  // Create the trunk
  const trunkHeight = 1;
  const trunkRadius = 0.15;
  const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown color
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = trunkHeight / 2;  // so that base touches ground
  tree.add(trunk);

  // Create the canopy
  const canopyRadius = 0.5;
  // Icosahedron used for a low-poly, stylized look
  const canopyGeometry = new THREE.IcosahedronGeometry(canopyRadius, 0);
  const canopyMaterial = new THREE.MeshStandardMaterial({ color: 0x2E8B57 }); // Green color
  const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
  canopy.position.y = trunkHeight + canopyRadius * 0.8;  // slightly overlap trunk
  tree.add(canopy);

  // Position the entire tree
  tree.position.copy(position);
  scene.add(tree);
}

// Generate a forest of trees on the ground plane.
function generateForest() {
  const numberOfTrees = 50;
  // Define boundaries to avoid placing trees at the very edge of the plane
  const boundary = 40;
  for (let i = 0; i < numberOfTrees; i++) {
    const x = Math.random() * (boundary * 2) - boundary;
    const z = Math.random() * (boundary * 2) - boundary;
    createTree(new THREE.Vector3(x, 0, z));
  }
}

// Call the forest generator function
generateForest();

// Add OrbitControls to allow mouse-based scene navigation.
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.6, 0); // Focus around the camera's eye level.
controls.update();

// --- WASD & Arrow Keys Movement Setup ---
const keys = { w: false, a: false, s: false, d: false };

// Listen for keydown events.
window.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW':
    case 'ArrowUp':
      keys.w = true;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      keys.a = true;
      break;
    case 'KeyS':
    case 'ArrowDown':
      keys.s = true;
      break;
    case 'KeyD':
    case 'ArrowRight':
      keys.d = true;
      break;
  }
});

// Listen for keyup events.
window.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW':
    case 'ArrowUp':
      keys.w = false;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      keys.a = false;
      break;
    case 'KeyS':
    case 'ArrowDown':
      keys.s = false;
      break;
    case 'KeyD':
    case 'ArrowRight':
      keys.d = false;
      break;
  }
});

// Create a clock to handle movement speed based on delta time.
const clock = new THREE.Clock();

// Animation loop.
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const moveSpeed = 5;

  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  direction.y = 0;
  direction.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(direction, camera.up).normalize();

  if (keys.w) camera.position.add(direction.clone().multiplyScalar(moveSpeed * delta));
  if (keys.s) camera.position.add(direction.clone().multiplyScalar(-moveSpeed * delta));
  if (keys.a) camera.position.add(right.clone().multiplyScalar(-moveSpeed * delta));
  if (keys.d) camera.position.add(right.clone().multiplyScalar(moveSpeed * delta));

  controls.target.copy(camera.position).add(direction);
  controls.update();

  renderer.render(scene, camera);
}
animate();

// Adjust camera and renderer on window resize.
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


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

// Create a mannequin group to hold all body parts
function createMannequin() {
  const mannequinGroup = new THREE.Group();
  
  // Materials
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xE0E0E0,
    roughness: 0.7,
    metalness: 0.1
  });

  // Torso
  const torsoGeometry = new THREE.CylinderGeometry(0.2, 0.15, 0.6, 8);
  const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
  torso.position.y = 0.3;
  mannequinGroup.add(torso);

  // Head
  const headGeometry = new THREE.SphereGeometry(0.15, 16, 16);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.y = 0.75;
  mannequinGroup.add(head);

  // Arms
  const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
  
  const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
  leftArm.position.set(0.35, 0.3, 0);
  leftArm.rotation.z = Math.PI / 2;
  mannequinGroup.add(leftArm);

  const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
  rightArm.position.set(-0.35, 0.3, 0);
  rightArm.rotation.z = -Math.PI / 2;
  mannequinGroup.add(rightArm);

  // Legs
  const legGeometry = new THREE.CylinderGeometry(0.07, 0.07, 0.4, 8);

  const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
  leftLeg.position.set(0.1, 0, 0);
  mannequinGroup.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
  rightLeg.position.set(-0.1, 0, 0);
  mannequinGroup.add(rightLeg);

  // Position the entire mannequin group
  mannequinGroup.position.y = 0.2; // Slightly above the ground plane
  mannequinGroup.rotation.x = Math.PI / 2; // Lay the mannequin on its back

  return mannequinGroup;
}

// Add the mannequin to the scene
const mannequin = createMannequin();
scene.add(mannequin);

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
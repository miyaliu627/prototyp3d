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

// Global array to track tree groups.
const treeObjects = [];

// Load grass texture.
const textureLoader = new THREE.TextureLoader();
const grassTexture = textureLoader.load('path/to/grass_texture.jpg'); // Replace with actual grass texture path
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({ map: grassTexture });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;  // Lay flat (horizontal)
scene.add(plane);

// Add ambient and directional light.
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Function to create a tree
function createTree(height) {
    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, height, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown color
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = height / 2; // Raise trunk to sit on ground

    // Tree leaves (canopy)
    const leavesGeometry = new THREE.ConeGeometry(0.5, 1, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // Green color
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = height + 0.5; // Position above trunk

    // Combine trunk and leaves into a group.
    const tree = new THREE.Group();
    tree.add(trunk);
    tree.add(leaves);

    return tree;
}

// Function to create a forest
function createForest(density, minHeight, maxHeight) {
    const count = density * 100; // Arbitrary scaling to control number of trees
    for (let i = 0; i < count; i++) {
        const height = Math.random() * (maxHeight - minHeight) + minHeight;
        const tree = createTree(height);
        // Position trees randomly within the plane
        tree.position.x = Math.random() * 100 - 50; // Random X position
        tree.position.z = Math.random() * 100 - 50; // Random Z position

        // Store the tree in our global list for click detection.
        treeObjects.push(tree);
        scene.add(tree);
    }
}

// Create and add a forest to the scene
createForest(0.1, 1, 2.5);

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

// Raycaster and mouse vector for tree removal on click.
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Function to handle click events to remove trees
function onTreeClick(event) {
  event.preventDefault();
  
  // Calculate normalized device coordinates (NDC) of the mouse.
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  
  // Update the picking ray with the camera and mouse position.
  raycaster.setFromCamera(mouse, camera);
  
  // Check intersections with all tree objects (search in children as well).
  const intersects = raycaster.intersectObjects(treeObjects, true);
  
  if (intersects.length > 0) {
    // Find the tree group that contains the clicked object.
    const intersectedObject = intersects[0].object;
    const clickedTree = treeObjects.find(tree => (tree === intersectedObject) || tree.children.includes(intersectedObject));
    
    if (clickedTree) {
      // Provide visual feedback: change all mesh materials within the tree to red.
      clickedTree.traverse(child => {
        if (child.material) {
          child.material.color.set(0xff0000);
        }
      });
      
      // Remove the tree after a brief pause.
      setTimeout(() => {
        scene.remove(clickedTree);
        const index = treeObjects.indexOf(clickedTree);
        if (index > -1) {
          treeObjects.splice(index, 1);
        }
      }, 200);
    }
  }
}
window.addEventListener('click', onTreeClick, false);

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
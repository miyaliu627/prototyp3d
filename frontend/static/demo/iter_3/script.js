// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Light blue sky

// Set up a perspective camera with bird's-eye view
const camera = new THREE.PerspectiveCamera(
  60, // Slightly wider FOV for better overhead visibility
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 0); // Position camera 5 units directly above
camera.lookAt(0, 0, 0); // Look at the center where mannequin is placed

// Create a WebGL renderer and add it to the document
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a ground plane
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;  // Lay flat (horizontal)
scene.add(plane);

// Add ambient and directional light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

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

// Modify OrbitControls settings for better overhead interaction
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0); // Set pivot point to mannequin's center
controls.minDistance = 3; // Prevent getting too close
controls.maxDistance = 10; // Prevent getting too far
controls.maxPolarAngle = Math.PI / 2.5; // Limit how low the camera can go
controls.minPolarAngle = 0; // Allow full upward rotation
controls.enableDamping = true; // Add smooth camera movement
controls.dampingFactor = 0.05;
controls.update();

// Update the keyboard controls to match the new perspective
const moveSpeed = 0.1; // Reduced speed for more precise movement
window.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW':
    case 'ArrowUp':
      camera.position.z -= moveSpeed;
      break;
    case 'KeyS':
    case 'ArrowDown':
      camera.position.z += moveSpeed;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      camera.position.x -= moveSpeed;
      break;
    case 'KeyD':
    case 'ArrowRight':
      camera.position.x += moveSpeed;
      break;
  }
  controls.target.set(0, 0, 0); // Keep focus on mannequin
  controls.update();
});


// Add these variables at the start of script.js
const cprSteps = [
  {
    id: 1,
    title: "Check Scene Safety",
    instruction: "Ensure the area around the patient is safe",
    completed: false
  },
  {
    id: 2,
    title: "Check Responsiveness",
    instruction: "Tap and shout 'Are you OK?'",
    completed: false
  },
  {
    id: 3,
    title: "Call for Help",
    instruction: "Call emergency services or ask someone to do it",
    completed: false
  },
  {
    id: 4,
    title: "Check Breathing",
    instruction: "Look for chest rise and fall for 10 seconds",
    completed: false
  },
  {
    id: 5,
    title: "Hand Position",
    instruction: "Place hands in center of chest, one on top of the other, interlocked",
    completed: false
  },
  {
    id: 6,
    title: "Begin Compressions",
    instruction: "Push hard and fast: 100-120 compressions per minute, 2-2.4 inches deep",
    completed: false
  }
];

let currentStep = 0;

// Create UI Elements
function createUIOverlay() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    background: rgba(255, 255, 255, 0.9);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    font-family: Arial, sans-serif;
    z-index: 1000;
  `;
  
  const title = document.createElement('h2');
  title.textContent = 'CPR Training Steps';
  title.style.cssText = `
    margin: 0 0 15px 0;
    color: #333;
    font-size: 18px;
  `;
  
  const stepDisplay = document.createElement('div');
  stepDisplay.id = 'step-display';
  
  const buttonContainer = document.createElement('div');
  buttonContainer.style.marginTop = '15px';
  
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next Step';
  nextButton.style.cssText = `
    background: #4CAF50;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    margin-right: 10px;
  `;
  
  const resetButton = document.createElement('button');
  resetButton.textContent = 'Reset';
  resetButton.style.cssText = `
    background: #f44336;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
  `;
  
  overlay.appendChild(title);
  overlay.appendChild(stepDisplay);
  buttonContainer.appendChild(nextButton);
  buttonContainer.appendChild(resetButton);
  overlay.appendChild(buttonContainer);
  document.body.appendChild(overlay);
  
  // Event Listeners
  nextButton.addEventListener('click', () => {
    if (currentStep < cprSteps.length - 1) {
      currentStep++;
      updateStepDisplay();
    }
  });
  
  resetButton.addEventListener('click', () => {
    currentStep = 0;
    cprSteps.forEach(step => step.completed = false);
    updateStepDisplay();
  });
  
  // Initial display
  updateStepDisplay();
}

// Update the step display
function updateStepDisplay() {
  const stepDisplay = document.getElementById('step-display');
  const currentStepData = cprSteps[currentStep];
  
  stepDisplay.innerHTML = `
    <div style="margin-bottom: 15px;">
      <div style="font-weight: bold; color: #2196F3; margin-bottom: 5px;">
        Step ${currentStepData.id}: ${currentStepData.title}
      </div>
      <div style="color: #666;">
        ${currentStepData.instruction}
      </div>
    </div>
    <div style="color: #888; font-size: 12px;">
      Step ${currentStep + 1} of ${cprSteps.length}
    </div>
  `;
}

createUIOverlay();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Adjust camera and renderer on window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
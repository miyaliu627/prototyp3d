// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Light blue sky

// Set up a perspective camera with bird's-eye view
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 0);
camera.lookAt(0, 0, 0);

// Create a WebGL renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a ground plane
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Define CPR steps
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

// Interaction tracking variables
let currentStep = 0;
let isDragging = false;
let dragCount = 0;
let breathingTimer = null;
let compressionCount = 0;
let compressionStartTime = null;
let canProgress = false;

// Create mannequin
function createMannequin() {
  const mannequinGroup = new THREE.Group();
  
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xE0E0E0,
    roughness: 0.7,
    metalness: 0.1
  });

  // Torso with interaction capability
  const torsoGeometry = new THREE.CylinderGeometry(0.2, 0.15, 0.6, 8);
  const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
  torso.position.y = 0.3;
  torso.name = 'torso';
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

  mannequinGroup.position.y = 0.2;
  mannequinGroup.rotation.x = Math.PI / 2;

  return mannequinGroup;
}

// Add mannequin to scene
const mannequin = createMannequin();
scene.add(mannequin);

// Setup raycaster for interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Orbit controls setup
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.minDistance = 3;
controls.maxDistance = 10;
controls.maxPolarAngle = Math.PI / 2.5;
controls.minPolarAngle = 0;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();

// Step validation
function validateStep() {
  const currentStepData = cprSteps[currentStep];
  
  switch (currentStepData.id) {
    case 1: return canProgress;
    case 2: return canProgress;
    case 3: return true;
    case 4: return canProgress;
    case 5: return canProgress;
    case 6: return canProgress;
    default: return false;
  }
}

// Reset step tracking
function resetStepTracking() {
  isDragging = false;
  dragCount = 0;
  compressionCount = 0;
  compressionStartTime = null;
  if (breathingTimer) clearTimeout(breathingTimer);
}

// Breathing check timer
function startBreathingCheck() {
  if (currentStep === 3) {
    breathingTimer = setTimeout(() => {
      canProgress = true;
      updateStepDisplay();
    }, 10000);
  }
}

// Handle chest compressions
function handleCompression() {
  if (currentStep === 5) {
    if (!compressionStartTime) {
      compressionStartTime = Date.now();
    }
    
    compressionCount++;
    const elapsedTime = (Date.now() - compressionStartTime) / 1000;
    
    if (elapsedTime <= 30) {
      if (compressionCount >= 50) {
        canProgress = true;
        updateStepDisplay();
      }
    } else {
      compressionCount = 0;
      compressionStartTime = Date.now();
      alert('Time exceeded. Please try compressions again.');
    }
  }
}

// Update step display
function updateStepDisplay() {
  const stepDisplay = document.getElementById('step-display');
  const currentStepData = cprSteps[currentStep];
  
  let progressInfo = '';
  switch (currentStepData.id) {
    case 1:
      progressInfo = `Drag view ${dragCount}/3 times to check scene`;
      break;
    case 2:
      progressInfo = 'Click on the mannequin to check responsiveness';
      break;
    case 3:
      progressInfo = 'Click Next to continue';
      break;
    case 4:
      progressInfo = 'Zoom in to check breathing (10 seconds)';
      startBreathingCheck();
      break;
    case 5:
      progressInfo = 'Click on the chest to position hands';
      break;
    case 6:
      progressInfo = `Compressions: ${compressionCount}/50 (30 seconds)`;
      break;
  }

  stepDisplay.innerHTML = `
    <div style="margin-bottom: 15px;">
      <div style="font-weight: bold; color: #2196F3; margin-bottom: 5px;">
        Step ${currentStepData.id}: ${currentStepData.title}
      </div>
      <div style="color: #666;">
        ${currentStepData.instruction}
      </div>
      <div style="color: #4CAF50; margin-top: 10px;">
        ${progressInfo}
      </div>
    </div>
    <div style="color: #888; font-size: 12px;">
      Step ${currentStep + 1} of ${cprSteps.length}
    </div>
  `;
}

// Create UI overlay
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
    if (validateStep()) {
      if (currentStep < cprSteps.length - 1) {
        currentStep++;
        canProgress = false;
        resetStepTracking();
        updateStepDisplay();
      }
    } else {
      alert('Please complete the current step before continuing');
    }
  });
  
  resetButton.addEventListener('click', () => {
    currentStep = 0;
    cprSteps.forEach(step => step.completed = false);
    canProgress = false;
    resetStepTracking();
    updateStepDisplay();
  });
  
  // Initial display
  updateStepDisplay();
}

// Add interaction event listeners
controls.addEventListener('start', () => {
  if (currentStep === 0) {
    isDragging = true;
    dragCount++;
    if (dragCount >= 3) {
      canProgress = true;
      updateStepDisplay();
    }
  }
});

window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(mannequin.children);

  if (intersects.length > 0) {
    const clickedPart = intersects[0].object;
    
    switch (currentStep) {
      case 1:
        if (clickedPart.name === 'torso') {
          canProgress = true;
          updateStepDisplay();
        }
        break;
      case 4:
        if (clickedPart.name === 'torso') {
          canProgress = true;
          updateStepDisplay();
        }
        break;
      case 5:
        if (clickedPart.name === 'torso') {
          handleCompression();
        }
        break;
    }
  }
});

// Window resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize UI
createUIOverlay();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
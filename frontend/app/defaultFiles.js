export const DEFAULT_FILES = {
  'index.html': `<!DOCTYPE html>
<html>
<head>
  <title>3D Model Preview</title>
  <style>
    /* Inline critical CSS for immediate cube visibility */
    #cube {
      width: 100px;
      height: 100px;
      background: #61dafb;
      margin: 50px auto;
      transform-style: preserve-3d;
      animation: rotate 5s infinite linear;
    }
    
    @keyframes rotate {
      from { transform: rotateX(0) rotateY(0); }
      to { transform: rotateX(360deg) rotateY(360deg); }
    }
  </style>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h2>3D Model Preview</h2>
    <div id="cube"></div>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
  'styles.css': `.container {
  text-align: center;
  padding: 20px;
}

h2 {
  color: #61dafb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}`,
  'script.js': `// Animation logic
console.log("3D model loaded");

// You can add more JavaScript functionality here
document.addEventListener('DOMContentLoaded', () => {
  // Initialize 3D scene
  const cube = document.getElementById('cube');
  if (cube) {
    console.log('Cube initialized');
  }
});`
};


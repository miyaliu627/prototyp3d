'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const TesseractScene = () => {
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.action === "redirectToDevTool" && !hasRedirected) {
        setHasRedirected(true);
        router.push('/devtool');
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, [hasRedirected, router]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <iframe 
        ref={iframeRef}
        src="/tesseract-scene.html"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
};

export default TesseractScene;


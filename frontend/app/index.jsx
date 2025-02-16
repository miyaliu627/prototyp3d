'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DevConsole from '@/app/DevConsole';

export default function Home() {
  const [isDevMode, setIsDevMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isDevMode) {
      const iframe = document.createElement('iframe');
      iframe.src = '/tesseract.html';
      iframe.style.width = '100vw';
      iframe.style.height = '100vh';
      iframe.style.border = 'none';

      document.body.innerHTML = '';
      document.body.appendChild(iframe);

      window.addEventListener('message', (event) => {
        if (event.data === 'enterDevMode') {
          setIsDevMode(true);
        }
      });
    }
  }, [isDevMode]);

  return (
    <div className="h-screen w-full">
      {isDevMode ? <DevConsole /> : null}
    </div>
  );
}


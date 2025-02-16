'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TesseractScene from '@/scene/TesseractScene';
import DevConsole from '@/app/DevConsole';

export default function Home() {
  const [isDevMode, setIsDevMode] = useState(false);
  const router = useRouter();

  return (
    <div className="h-screen w-full">
      {isDevMode ? (
        <DevConsole />
      ) : (
        <TesseractScene onEnterDevMode={() => setIsDevMode(true)} router={router} />
      )}
    </div>
  );
}


"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';

const VideoCall = dynamic(() => import('@/components/VideoCall'), { ssr: false });

const VideoCallPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomCode = searchParams.get('roomCode');

  useEffect(() => {
    if (!roomCode) {
      router.replace('/appointments');
    }
  }, [roomCode, router]);

  if (!roomCode) {
    return <div className="flex items-center justify-center min-h-screen">Loading video call...</div>;
  }

  return (
    <div className="w-full h-screen">
      <VideoCall roomCode={roomCode} />
    </div>
  );
};

export default VideoCallPage;

import React, { useState, useEffect } from 'react';

interface VideoCallProps {
  roomCode: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ roomCode }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get subdomain from env
  const subdomain = process.env.NEXT_PUBLIC_HMS_SUBDOMAIN || 'muhammad-videoconf-2107';

  // Validate room code
  useEffect(() => {
    if (!roomCode || typeof roomCode !== 'string' || roomCode.trim() === '') {
      setError('No room code provided.');
      setLoading(false);
    } else {
      setError(null);
      setLoading(true);
    }
  }, [roomCode]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#111',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flex: 1,
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: 0,
          minWidth: 0,
          display: 'flex',
        }}
      >
        {loading && !error && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.7)',
              zIndex: 2,
            }}
          >
            <div style={{ color: '#fff', fontSize: 20 }}>Loading video call...</div>
          </div>
        )}
        {error ? (
          <div
            style={{
              color: '#fff',
              textAlign: 'center',
              margin: '40px auto',
              fontSize: 20,
              width: '100%',
            }}
          >
            {error}
          </div>
        ) : (
          <iframe
            src={`https://${subdomain}.app.100ms.live/preview/${roomCode}`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              minHeight: 0,
              minWidth: 0,
              background: '#222',
              display: 'block',
              borderRadius: 0,
              overflow: 'hidden',
            }}
            allow="camera; microphone; fullscreen; display-capture"
            title="100ms Video Call"
            onLoad={handleIframeLoad}
            sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
          />
        )}
      </div>
      {/* Hide scrollbars globally for this overlay */}
      <style>{`
        html, body {
          overflow: hidden !important;
        }
        div[style*='position: fixed']::-webkit-scrollbar,
        div[style*='position: fixed'] {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        div[style*='position: fixed']::-webkit-scrollbar-thumb {
          background: transparent !important;
        }
        iframe {
          min-height: 0 !important;
          min-width: 0 !important;
          border-radius: 0 !important;
          overflow: hidden !important;
        }
        @media (max-width: 600px) {
          div[style*='position: fixed'] {
            font-size: 15px !important;
          }
          iframe {
            min-height: 0 !important;
            min-width: 0 !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default VideoCall;

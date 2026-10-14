import { useEffect, useState } from 'react';

interface RobotAvatarProps {
  state: 'idle' | 'speaking' | 'listening' | 'alert' | 'emergency' | 'happy';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function RobotAvatar({ state, size = 'lg' }: RobotAvatarProps) {
  const [blink, setBlink] = useState(false);
  const [waveOffset, setWaveOffset] = useState(0);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    if (state === 'speaking' || state === 'listening') {
      const waveInterval = setInterval(() => {
        setWaveOffset((prev) => (prev + 1) % 100);
      }, 80);
      return () => clearInterval(waveInterval);
    }
  }, [state]);

  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  const eyeSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
    xl: 'w-6 h-6',
  };

  const ringColors = {
    idle: 'ring-secondary-400/40',
    speaking: 'ring-primary-400/50',
    listening: 'ring-primary-400/50',
    alert: 'ring-warning-400/60',
    emergency: 'ring-error-500/70',
    happy: 'ring-success-400/50',
  };

  const bgColor = {
    idle: 'bg-gradient-to-br from-neutral-700 to-neutral-900',
    speaking: 'bg-gradient-to-br from-primary-700 to-primary-900',
    listening: 'bg-gradient-to-br from-primary-700 to-primary-900',
    alert: 'bg-gradient-to-br from-warning-600 to-warning-800',
    emergency: 'bg-gradient-to-br from-error-600 to-error-800',
    happy: 'bg-gradient-to-br from-success-600 to-success-800',
  };

  const eyeColor = {
    idle: 'bg-secondary-400',
    speaking: 'bg-primary-300',
    listening: 'bg-primary-300',
    alert: 'bg-warning-200',
    emergency: 'bg-error-200',
    happy: 'bg-success-300',
  };

  return (
    <div className={`relative ${sizes[size]} ${bgColor[state]} rounded-3xl ring-4 ${ringColors[state]} flex items-center justify-center transition-all duration-500 animate-glow`}>
      {/* Head shape */}
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Antenna */}
        <div className="absolute top-0 -translate-y-1/2 flex flex-col items-center">
          <div className={`w-1 h-3 ${state === 'emergency' ? 'bg-error-400' : state === 'alert' ? 'bg-warning-400' : 'bg-secondary-400'} rounded-full`} />
          <div className={`w-2 h-2 rounded-full ${state === 'emergency' ? 'bg-error-400' : state === 'alert' ? 'bg-warning-400' : 'bg-secondary-400'} ${state !== 'idle' && state !== 'happy' ? 'animate-blink' : ''}`} />
        </div>

        {/* Eyes */}
        <div className={`flex gap-3 mb-2 ${size === 'xl' ? 'gap-5' : ''}`}>
          <div
            className={`${eyeSizes[size]} rounded-full ${blink ? 'h-0.5' : ''} ${eyeColor[state]} transition-all duration-100`}
            style={state === 'speaking' || state === 'listening' ? { transform: `translateY(${Math.sin(waveOffset * 0.1) * 1}px)` } : {}}
          />
          <div
            className={`${eyeSizes[size]} rounded-full ${blink ? 'h-0.5' : ''} ${eyeColor[state]} transition-all duration-100`}
            style={state === 'speaking' || state === 'listening' ? { transform: `translateY(${Math.sin(waveOffset * 0.1 + 1) * 1}px)` } : {}}
          />
        </div>

        {/* Mouth / Speaker visualization */}
        {state === 'speaking' && (
          <div className="flex items-end gap-0.5 h-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 bg-primary-300 rounded-full"
                style={{
                  height: `${3 + Math.abs(Math.sin((waveOffset + i * 8) * 0.15)) * 8}px`,
                  transition: 'height 0.08s ease-out',
                }}
              />
            ))}
          </div>
        )}
        {state === 'listening' && (
          <div className="w-6 h-0.5 bg-primary-300 rounded-full animate-pulse" />
        )}
        {state === 'idle' && (
          <div className="w-6 h-1 bg-neutral-500 rounded-full" />
        )}
        {state === 'alert' && (
          <div className="w-6 h-1 bg-warning-200 rounded-full animate-blink" />
        )}
        {state === 'emergency' && (
          <div className="flex items-end gap-0.5 h-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-1 bg-error-200 rounded-full animate-blink"
                style={{ height: `${4 + (i % 2) * 6}px`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}
        {state === 'happy' && (
          <div className="w-8 h-4 border-b-2 border-success-300 rounded-b-full" />
        )}
      </div>

      {/* Side indicators */}
      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-neutral-600 rounded-l-full" />
      <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-neutral-600 rounded-r-full" />
    </div>
  );
}

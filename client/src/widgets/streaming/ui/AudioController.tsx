import React, { useEffect, useState } from 'react';

interface TestAudioControllerProps {
  audioRef: React.RefObject<HTMLMediaElement>;
}

export const AudioController = ({ audioRef }: TestAudioControllerProps) => {
  const songDuration = 98;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.controls = false;

    const updateProgress = () => {
      const progressPercent =
        ((songDuration - audio.duration + audio.currentTime) / songDuration) *
        100;
      setProgress(progressPercent);
    };

    audio.addEventListener('timeupdate', updateProgress);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
    };
  }, []);

  return (
    <div className="absolute bottom-0 z-50 w-full flex items-center space-x-2">
      <div className="flex-grow h-1  relative cursor-default">
        <div
          className={`absolute left-0 top-0 h-full bg-brand`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

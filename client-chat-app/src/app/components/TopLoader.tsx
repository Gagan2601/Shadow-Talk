'use client'
import { LinearProgress } from '@mui/material';
import { useEffect, useState } from 'react';

const TopLoader: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            return 0;
          }
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 100);
        });
      }, 500);
      return () => {
        clearInterval(timer);
      };
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 200);
    }
  }, [isLoading]);

  return (
    <div style={{ width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 1300 }}>
      {isLoading && <LinearProgress variant="determinate" value={progress} />}
    </div>
  );
};

export default TopLoader;

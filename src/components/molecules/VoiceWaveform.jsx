import React, { useEffect, useRef } from 'react';

const VoiceWaveform = ({ 
  isRecording = false, 
  amplitude = 0, 
  color = 'purple',
  width = 120,
  height = 40,
  bars = 8
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const barsData = useRef(Array(bars).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const barWidth = width / bars;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      if (isRecording) {
        // Update bars with random variation based on amplitude
        barsData.current = barsData.current.map((_, index) => {
          const baseHeight = amplitude * height * 0.8;
          const variation = Math.random() * 0.4 + 0.6; // 0.6 to 1.0
          const targetHeight = Math.max(2, baseHeight * variation);
          
          // Smooth transition
          const currentHeight = barsData.current[index];
          return currentHeight + (targetHeight - currentHeight) * 0.3;
        });
      } else {
        // Fade out when not recording
        barsData.current = barsData.current.map(height => height * 0.9);
      }

      // Draw bars
      barsData.current.forEach((barHeight, index) => {
        const x = index * barWidth + barWidth * 0.2;
        const y = (height - barHeight) / 2;
        const barActualWidth = barWidth * 0.6;

        // Set color based on prop
        const colors = {
          purple: '#8b5cf6',
          blue: '#3b82f6',
          green: '#10b981',
          red: '#ef4444'
        };

        ctx.fillStyle = colors[color] || colors.purple;
        ctx.fillRect(x, y, barActualWidth, barHeight);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, amplitude, color, width, height, bars]);

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-md"
        style={{ 
          background: isRecording ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
          transition: 'background 0.3s ease'
        }}
      />
    </div>
  );
};

export default VoiceWaveform;


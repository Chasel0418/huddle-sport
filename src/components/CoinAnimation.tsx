import React, { useEffect } from 'react';

export interface CoinAnimationState {
  startRect: DOMRect | null;
  endRect: DOMRect | null;
  type: 'gain' | 'spend';
  key: number;
  onComplete: () => void;
}

interface CoinAnimationProps {
  startRect: DOMRect;
  endRect: DOMRect;
  type: 'gain' | 'spend';
  onAnimationComplete: () => void;
}

const CoinAnimation: React.FC<CoinAnimationProps> = ({ startRect, endRect, onAnimationComplete }) => {
  const NUM_COINS = 10;
  const ANIMATION_DURATION = 800; // ms

  useEffect(() => {
    const particles: HTMLElement[] = [];
    for (let i = 0; i < NUM_COINS; i++) {
      const particle = document.createElement('div');
      particle.classList.add('coin-particle');
      
      const startX = startRect.left + startRect.width / 2;
      const startY = startRect.top + startRect.height / 2;
      
      // Randomize the initial position slightly around the center for a spray effect
      const offsetX = (Math.random() - 0.5) * startRect.width;
      const offsetY = (Math.random() - 0.5) * startRect.height;
      
      particle.style.left = `${startX + offsetX}px`;
      particle.style.top = `${startY + offsetY}px`;
      
      document.body.appendChild(particle);
      particles.push(particle);
      
      // Animate after a short delay
      setTimeout(() => {
        const endX = endRect.left + endRect.width / 2;
        const endY = endRect.top + endRect.height / 2;
        
        particle.style.transform = `translate(${endX - startX - offsetX}px, ${endY - startY - offsetY}px) scale(0.5)`;
        particle.style.opacity = '0';
      }, i * 30); // Stagger the animation start
    }
    
    // Cleanup and callback
    setTimeout(() => {
      particles.forEach(p => p.remove());
      onAnimationComplete();
    }, ANIMATION_DURATION + NUM_COINS * 30); // Wait for all animations to finish

    return () => {
        particles.forEach(p => p.remove());
    };
  }, [startRect, endRect, onAnimationComplete]);

  return null; // This component does not render anything itself
};

export default CoinAnimation;
'use client';

import React, { useEffect, useRef } from 'react';

export function MouseTrailEffect() {
  const followerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const follower = followerRef.current;
    if (!follower) return;

    let mouseX = -100;
    let mouseY = -100;
    let currentX = -100;
    let currentY = -100;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      // Smooth lerp (linear interpolation) for subtle spring physics
      currentX += (mouseX - currentX) * 0.12;
      currentY += (mouseY - currentY) * 0.12;

      follower.style.transform = `translate3d(${currentX - 16}px, ${currentY - 16}px, 0)`;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={followerRef}
      className="pointer-events-none fixed top-0 left-0 z-30 w-8 h-8 rounded-full border border-[#7C5CFC]/40 bg-[#7C5CFC]/10 backdrop-blur-[2px] shadow-[0_0_15px_rgba(124,92,252,0.25)] transition-opacity duration-300 hidden md:block"
    />
  );
}

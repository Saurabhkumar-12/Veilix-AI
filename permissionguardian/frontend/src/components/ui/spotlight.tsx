'use client';
import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring, SpringOptions } from 'framer-motion';
import { cn } from '@/lib/utils';

type SpotlightProps = {
  className?: string;
  size?: number;
  springOptions?: SpringOptions;
  fill?: string;
  gradient?: string;
};

export function Spotlight({
  className,
  size = 400,
  springOptions = { damping: 28, stiffness: 280, mass: 0.1, restDelta: 0.001 },
  fill,
  gradient = 'from-blue-500/30 via-purple-600/20 to-transparent',
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const parentRef = useRef<HTMLElement | null>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const prefersReducedMotion = useRef(false);

  // High-performance spring values with GPU translate
  const mouseX = useSpring(-size, springOptions);
  const mouseY = useSpring(-size, springOptions);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!containerRef.current) return;
    const parent = containerRef.current.parentElement;
    if (!parent) return;

    parentRef.current = parent;
    parent.style.position = 'relative';
    parent.style.overflow = 'hidden';

    const updateRect = () => {
      if (parentRef.current) {
        rectRef.current = parentRef.current.getBoundingClientRect();
      }
    };

    updateRect();

    const handleMouseEnter = () => {
      if (prefersReducedMotion.current) return;
      updateRect();
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    const updateCoordinates = (clientX: number, clientY: number) => {
      if (prefersReducedMotion.current) return;
      if (!rectRef.current) {
        updateRect();
      }
      if (!rectRef.current) return;

      const x = clientX - rectRef.current.left - size / 2;
      const y = clientY - rectRef.current.top - size / 2;

      mouseX.set(x);
      mouseY.set(y);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (prefersReducedMotion.current) return;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(() => {
        updateCoordinates(event.clientX, event.clientY);
        rafIdRef.current = null;
      });
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (prefersReducedMotion.current) return;
      updateRect();
      setIsHovered(true);
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        updateCoordinates(touch.clientX, touch.clientY);
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (prefersReducedMotion.current) return;
      if (event.touches.length === 0) return;
      const touch = event.touches[0];
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(() => {
        updateCoordinates(touch.clientX, touch.clientY);
        rafIdRef.current = null;
      });
    };

    const handleTouchEnd = () => {
      setIsHovered(false);
    };

    // Event listeners
    parent.addEventListener('mouseenter', handleMouseEnter);
    parent.addEventListener('mouseleave', handleMouseLeave);
    parent.addEventListener('mousemove', handleMouseMove, { passive: true });
    parent.addEventListener('touchstart', handleTouchStart, { passive: true });
    parent.addEventListener('touchmove', handleTouchMove, { passive: true });
    parent.addEventListener('touchend', handleTouchEnd, { passive: true });

    window.addEventListener('resize', updateRect, { passive: true });
    window.addEventListener('scroll', updateRect, { passive: true });

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      parent.removeEventListener('mouseenter', handleMouseEnter);
      parent.removeEventListener('mouseleave', handleMouseLeave);
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('touchstart', handleTouchStart);
      parent.removeEventListener('touchmove', handleTouchMove);
      parent.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [size, mouseX, mouseY]);

  return (
    <motion.div
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute top-0 left-0 rounded-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops),transparent_75%)] blur-2xl transition-opacity duration-300 will-change-transform',
        gradient,
        isHovered ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        width: size,
        height: size,
        x: mouseX,
        y: mouseY,
      }}
    />
  );
}

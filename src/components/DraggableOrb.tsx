// ============================================================
// ARC: AETHON — DRAGGABLE ORB
// Orb component with pointer event drag support.
// ============================================================

import { useRef, useState, useCallback } from 'react';
import { Orb } from '../types/game';
import { ELEMENT_EMOJI, ELEMENT_COLORS } from '../constants/gameConstants';

interface DraggableOrbProps {
  orb: Orb;
  onDragStart: () => void;
  onDragEnd: (orbId: string, dropPosition: { x: number; y: number }) => void;
  onDragMove: (position: { x: number; y: number }) => void;
  onDragCancel?: () => void;
  disabled?: boolean;
}

export default function DraggableOrb({
  orb,
  onDragStart,
  onDragEnd,
  onDragMove,
  onDragCancel,
  disabled = false,
}: DraggableOrbProps) {
  const orbRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const startPosition = useRef<{ x: number; y: number } | null>(null);
  const elementRect = useRef<DOMRect | null>(null);
  const activePointerId = useRef<number | null>(null);

  /**
   * Safely release pointer capture.
   * Checks hasPointerCapture before releasing to avoid errors.
   */
  const safeReleasePointerCapture = useCallback((target: HTMLElement, pointerId: number) => {
    try {
      if (target.hasPointerCapture(pointerId)) {
        target.releasePointerCapture(pointerId);
      }
    } catch {
      // Ignore errors if pointer capture was already released
    }
  }, []);

  /**
   * Reset all drag state to initial values.
   */
  const resetDragState = useCallback(() => {
    setIsDragging(false);
    setDragPosition(null);
    startPosition.current = null;
    activePointerId.current = null;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;

      e.preventDefault();
      e.stopPropagation();

      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);
      activePointerId.current = e.pointerId;

      elementRect.current = target.getBoundingClientRect();
      startPosition.current = { x: e.clientX, y: e.clientY };

      setIsDragging(true);
      setDragPosition({
        x: e.clientX - elementRect.current.width / 2,
        y: e.clientY - elementRect.current.height / 2,
      });

      onDragStart();
    },
    [disabled, onDragStart]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      e.preventDefault();
      e.stopPropagation();

      const newPosition = {
        x: e.clientX - 24, // Half of orb size (48px / 2)
        y: e.clientY - 24,
      };

      setDragPosition(newPosition);
      onDragMove({ x: e.clientX, y: e.clientY });
    },
    [isDragging, onDragMove]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      e.preventDefault();
      e.stopPropagation();

      const target = e.currentTarget as HTMLElement;
      safeReleasePointerCapture(target, e.pointerId);

      const dropPosition = { x: e.clientX, y: e.clientY };

      resetDragState();
      onDragEnd(orb.id, dropPosition);
    },
    [isDragging, orb.id, onDragEnd, safeReleasePointerCapture, resetDragState]
  );

  const handlePointerCancel = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      const target = e.currentTarget as HTMLElement;
      safeReleasePointerCapture(target, e.pointerId);

      resetDragState();

      // Notify parent that drag was cancelled
      if (onDragCancel) {
        onDragCancel();
      }
    },
    [isDragging, safeReleasePointerCapture, resetDragState, onDragCancel]
  );

  const color = ELEMENT_COLORS[orb.element];
  const emoji = ELEMENT_EMOJI[orb.element];

  // Static orb in tray
  if (!isDragging) {
    return (
      <div
        ref={orbRef}
        onPointerDown={handlePointerDown}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center text-xl
          border-2 bg-aethon-card cursor-grab select-none
          transition-transform duration-150 active:scale-95
          touch-none
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        `}
        style={{
          borderColor: color,
          boxShadow: `0 0 12px ${color}44`,
        }}
      >
        {emoji}
      </div>
    );
  }

  // Dragging orb (fixed position overlay)
  return (
    <>
      {/* Placeholder in tray */}
      <div className="w-12 h-12 rounded-full border-2 border-dashed border-aethon-border/30 bg-aethon-card/20" />

      {/* Dragging orb */}
      <div
        ref={orbRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="fixed z-50 w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 bg-aethon-card pointer-events-auto touch-none"
        style={{
          left: dragPosition?.x ?? 0,
          top: dragPosition?.y ?? 0,
          borderColor: color,
          boxShadow: `0 0 20px ${color}88, 0 0 40px ${color}44`,
          transform: 'scale(1.1)',
        }}
      >
        {emoji}
      </div>
    </>
  );
}

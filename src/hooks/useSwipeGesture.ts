import { useCallback, useRef } from "react";

interface SwipeGestureOptions {
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  minDistance?: number;
  edgeZone?: number;
}

export function useSwipeGesture({
  onSwipeRight,
  onSwipeLeft,
  minDistance = 50,
  edgeZone = 30,
}: SwipeGestureOptions) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const startX = touchStartRef.current.x;
      const startY = touchStartRef.current.y;
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      // Ignore vertical swipes
      if (Math.abs(deltaY) > Math.abs(deltaX)) return;

      // Swipe right from left edge
      if (deltaX > minDistance && startX < edgeZone + 40) {
        onSwipeRight?.();
      }
      // Swipe left
      else if (deltaX < -minDistance) {
        onSwipeLeft?.();
      }

      touchStartRef.current = null;
    },
    [minDistance, edgeZone, onSwipeRight, onSwipeLeft]
  );

  return { onTouchStart, onTouchEnd };
}

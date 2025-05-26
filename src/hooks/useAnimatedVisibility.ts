import { useEffect, useRef, useState } from "react";

/**
 * Custom hook to manage animated visibility state for UI elements.
 * @param isActive Whether the element should be visible (triggers enter/leave animation)
 * @param duration Animation duration in ms
 */
export default function useAnimatedVisibility(
  isActive: boolean,
  duration: number
) {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any previous timeout
    if (timeout.current) clearTimeout(timeout.current);

    if (isActive) {
      setShow(true);
      // Animate in after a tick
      timeout.current = setTimeout(() => setVisible(true), 10);
      setLeaving(false);
    } else {
      setLeaving(true);
      setVisible(false); // Start fade out immediately for pointerEvents
      timeout.current = setTimeout(() => {
        setShow(false);
        setLeaving(false);
      }, duration);
    }
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [isActive, duration]);

  return { show, visible, leaving, setLeaving, setShow, setVisible };
}

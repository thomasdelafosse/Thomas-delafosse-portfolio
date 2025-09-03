import { useState, useCallback, useEffect, useRef } from "react";
import { ModelData, FocusData } from "@/types/types"; // FocusData is now imported directly

// Debounce delay in milliseconds
const FOCUS_DEBOUNCE_DELAY = 150;

export function useFocusedModelInfo(
  models: ModelData[],
  onModelFocusStatusChange?: (focused: boolean) => void
) {
  const [focusedModelInfo, setFocusedModelInfo] = useState<FocusData | null>(
    null
  );
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  // Ref to store the timeout ID for debouncing
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleFocusChange = useCallback(
    (
      focusData: { description: string | null; path: string },
      modelIndex: number
    ) => {
      // Clear any existing debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set a new timeout to update the focus
      debounceTimeoutRef.current = setTimeout(() => {
        setFocusedModelInfo(focusData);
        setCurrentIndex(modelIndex);

        if (onModelFocusStatusChange) {
          // Path is guaranteed to be a string, so description determines focus for status change
          onModelFocusStatusChange(!!focusData.description);
        }
      }, FOCUS_DEBOUNCE_DELAY);
    },
    [onModelFocusStatusChange] // Removed models and currentIndex as they are handled by the call site
  );

  return { focusedModelInfo, handleFocusChange, currentIndex };
}

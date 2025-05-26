import { useState, useCallback } from "react";

export interface FocusData {
  description: string | null;
  path: string | null;
}

export function useFocusedModelInfo(
  onModelFocusStatusChange?: (focused: boolean) => void
) {
  const [focusedModelInfo, setFocusedModelInfo] = useState<FocusData | null>(
    null
  );

  const handleFocusChange = useCallback(
    (focusData: FocusData | null) => {
      setFocusedModelInfo(focusData);
      if (onModelFocusStatusChange) {
        onModelFocusStatusChange(!!focusData?.description);
      }
    },
    [onModelFocusStatusChange]
  );

  return { focusedModelInfo, handleFocusChange };
}

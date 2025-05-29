import { useEffect } from "react";
import { FocusData } from "@/types/types";

export default function useBodyOverflowOnFocus(
  isLandscapeMobile: boolean,
  focusedModelInfo: FocusData | null
) {
  useEffect(() => {
    if (isLandscapeMobile && focusedModelInfo?.description) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLandscapeMobile, focusedModelInfo?.description]);
}

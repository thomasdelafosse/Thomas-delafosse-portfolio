interface CloseButtonTypes {
  leaving: boolean;
  onClick: () => void;
}

const CloseButton = ({ leaving, onClick }: CloseButtonTypes) => (
  <div
    style={{
      position: "absolute",
      top: 8,
      right: 16,
      opacity: !leaving ? 1 : 0,
      transform: !leaving ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.5s ease-in-out, transform 0.5s ease-in-out`,
      zIndex: 10,
      pointerEvents: !leaving ? "auto" : "none",
    }}
  >
    <button
      className="bg-[#444] text-white px-2 py-1 rounded font-mono text-xs hover:bg-[#666] transition-colors"
      onClick={onClick}
    >
      Close
    </button>
  </div>
);

export default CloseButton;

interface AboutMeButtonTypes {
  visible: boolean;
  leaving: boolean;
  onClick: () => void;
}

const AboutMeButton = ({ visible, leaving, onClick }: AboutMeButtonTypes) => (
  <div
    style={{
      position: "fixed",
      bottom: "1rem",
      right: "1rem",
      zIndex: 10000,
      opacity: visible && !leaving ? 1 : 0,
      transform: visible && !leaving ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.5s ease-in-out, transform 0.5s ease-in-out`,
      pointerEvents: visible && !leaving ? "auto" : "none",
    }}
  >
    <button
      className="bg-[#2d2d2d] text-white px-4 py-2 rounded-lg shadow-lg font-mono text-sm hover:bg-[#444] transition-colors"
      onClick={onClick}
    >
      About me
    </button>
  </div>
);

export default AboutMeButton;

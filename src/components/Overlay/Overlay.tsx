interface OverlayProps {
  isVisible: boolean;
}

const Overlay = ({ isVisible }: OverlayProps) => (
  <div
    className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out pointer-events-none z-0 ${
      isVisible ? "opacity-10" : "opacity-0"
    }`}
  />
);

export default Overlay;

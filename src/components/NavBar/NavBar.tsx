import Image from "next/image";

interface NavBarTypes {
  style?: React.CSSProperties;
}

const NavBar = ({ style }: NavBarTypes) => (
  <nav className="relative w-full py-4 z-30" style={style}>
    <div className="relative pl-6 pt-2">
      <Image
        src="/images/logoBlanc.png"
        alt="Thomas Delafosse Logo"
        width={80}
        height={50}
        priority
      />
    </div>
  </nav>
);

export default NavBar;

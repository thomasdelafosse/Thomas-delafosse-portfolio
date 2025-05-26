import Image from "next/image";

const NavBar = () => (
  <nav className="relative w-full py-4 z-30">
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

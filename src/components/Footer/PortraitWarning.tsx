import Image from "next/image";

const PortraitWarning = () => (
  <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center text-white text-xl z-[9999] p-8 text-center">
    <div className="mb-6">
      <Image
        src="/images/logoBlanc.png"
        alt="Logo"
        width={100}
        height={60}
        priority
      />
    </div>
    <p>For a better experience, please rotate your phone.</p>
    <p className="text-base mt-2 text-gray-400">(Or view on a desktop)</p>
  </div>
);

export default PortraitWarning;

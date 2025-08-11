import { FaGithub, FaEnvelope } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const ContactSection = () => (
  <div className="flex flex-col gap-4 md:items-start md:justify-center border-white border-l pt-0 mt-4 pl-6  ">
    <a
      href="https://github.com/thomasdelafosse"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
      className="text-white hover:text-gray-300 transition-colors flex items-center"
    >
      <FaGithub size={20} className="mr-2" /> github.com/thomasdelafosse
    </a>
    <a
      href="https://x.com/ThomasDelafosse"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="x"
      className="text-white hover:text-gray-300 transition-colors flex items-center"
    >
      <FaXTwitter size={20} className="mr-2" /> @ThomasDelafosse
    </a>
    <a
      href="mailto:bonjour@thomasdelafosse.com"
      aria-label="Email"
      className="text-white hover:text-gray-300 transition-colors flex items-center"
    >
      <FaEnvelope size={20} className="mr-2" /> bonjour@thomasdelafosse.com
    </a>
  </div>
);

export default ContactSection;

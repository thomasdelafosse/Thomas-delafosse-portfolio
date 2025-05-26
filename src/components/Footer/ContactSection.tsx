import React from "react";
import { FaGithub, FaEnvelope, FaDiscord } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const ContactSection: React.FC = () => (
  <div className="flex flex-col gap-1 items-end mr-2 mt-10 lg:mt-0">
    <a
      href="https://x.com/ThomasDelafosse"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="x"
      className="text-white hover:text-gray-300 transition-colors flex items-center"
    >
      @ThomasDelafosse <FaXTwitter size={20} className="ml-1" />
    </a>
    <a
      href="https://github.com/thomasdelafosse"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
      className="text-white hover:text-gray-300 transition-colors flex items-center"
    >
      github <FaGithub size={20} className="ml-1" />
    </a>
    <a
      href="https://discord.gg/EPkpq95t"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discord"
      className="text-white hover:text-gray-300 transition-colors flex items-center"
    >
      discord <FaDiscord size={20} className="ml-1" />
    </a>
    <a
      href="mailto:bonjour@thomasdelafosse.com"
      aria-label="Email"
      className="text-white hover:text-gray-300 transition-colors flex items-center"
    >
      bonjour@thomasdelafosse.com <FaEnvelope size={20} className="ml-1" />
    </a>
  </div>
);

export default ContactSection;

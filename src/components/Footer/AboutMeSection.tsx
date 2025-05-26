interface AboutMeSectionProps {
  headingClassName?: string;
}

const AboutMeSection = ({ headingClassName }: AboutMeSectionProps) => (
  <div className="md:w-1/2">
    <h3 className={`text-3xl font-bold mb-2 ${headingClassName ?? ""}`}>
      Thomas Delafosse
    </h3>
    <div className="flex flex-col gap-0.5 text-base">
      <span style={{ whiteSpace: "pre-line" }}>
        {`Web Developer Full-Stack Freelance. React, Next.js, TypeScript, Node.js. \n Doing a course on Three.js + Blender to make a portfolio site in the form of a video game. \n Feel free to contact me for any question or collaboration opportunity. `}
      </span>
    </div>
  </div>
);

export default AboutMeSection;

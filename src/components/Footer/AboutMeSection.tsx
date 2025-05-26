interface AboutMeSectionProps {
  headingClassName?: string;
}

const AboutMeSection = ({ headingClassName }: AboutMeSectionProps) => (
  <div className="md:w-1/2">
    <h3 className={`text-3xl font-bold mb-2 ${headingClassName ?? ""}`}>
      Thomas Delafosse
    </h3>
    <div className="flex flex-col gap-0.5 text-base">
      <span>
        Web Développeur Full-Stack Freelance. React, Next.js, TypeScript,
        Node.js. Feel free to contact me for any question or collaboration
        opportunity.
      </span>
      <span>
        I&apos;m currently working on a portfolio site in the form of a video
        game with Three.js.
      </span>
    </div>
  </div>
);

export default AboutMeSection;

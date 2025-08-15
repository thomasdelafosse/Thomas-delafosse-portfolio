import Head from "next/head";
import { useRouter } from "next/router";
import InfoSection from "@/components/info-section/InfoSection";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  const handleDiscoverProjects = () => {
    router.push("/projects");
  };

  return (
    <>
      <Head>
        <title>Thomas Delafosse</title>
      </Head>
      <div className="relative min-h-[100svh] md:min-h-screen">
        <div className="fixed top-5 left-5 z-50">
          <Image
            src="/images/logoBlanc.png"
            alt="Portfolio Logo"
            width={80}
            height={50}
            priority
          />
        </div>
        <InfoSection onDiscoverProjects={handleDiscoverProjects} />
      </div>
    </>
  );
}

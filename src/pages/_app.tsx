import "@/styles/globals.css";
import Head from "next/head";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { useRouter } from "next/router";
import { useRef } from "react";
import { SwitchTransition, CSSTransition } from "react-transition-group";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const nodeRef = useRef<HTMLDivElement>(null);
  const pageTitle =
    router.pathname === "/"
      ? "Thomas Delafosse - portfolio"
      : router.pathname === "/projects"
      ? "Thomas Delafosse - projets"
      : "Thomas Delafosse";
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <SwitchTransition mode="out-in">
        <CSSTransition
          key={router.asPath}
          classNames="page-fade"
          timeout={150}
          nodeRef={nodeRef}
        >
          <div ref={nodeRef} className="min-h-[100svh] md:min-h-screen">
            <Component {...pageProps} />
          </div>
        </CSSTransition>
      </SwitchTransition>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

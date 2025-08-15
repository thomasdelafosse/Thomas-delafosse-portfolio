import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { useRouter } from "next/router";
import { createRef, useMemo } from "react";
import { SwitchTransition, CSSTransition } from "react-transition-group";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const nodeRef = useMemo(() => createRef<HTMLDivElement>(), [router.asPath]);
  return (
    <>
      <SwitchTransition mode="out-in">
        <CSSTransition
          key={router.asPath}
          classNames="page-fade"
          timeout={150}
          nodeRef={nodeRef}
        >
          <div
            ref={nodeRef as React.RefObject<HTMLDivElement>}
            className="min-h-screen"
          >
            <Component {...pageProps} />
          </div>
        </CSSTransition>
      </SwitchTransition>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

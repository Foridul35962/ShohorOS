"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Every route change starts at the top of the page. Browser back/forward still restores the old position. */
export function ScrollToTop() {
  const pathname = usePathname();
  const isPop = useRef(false);

  useEffect(() => {
    const onPop = () => { isPop.current = true; };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useLayoutEffect(() => {
    if (isPop.current) { isPop.current = false; return; }   // back/forward: keep browser's position
    if (window.location.hash) return;                        // /#faq style links: let the anchor scroll
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";                      // jump instantly, no smooth animation
    window.scrollTo(0, 0);
    html.style.scrollBehavior = prev;
  }, [pathname]);

  return null;
}
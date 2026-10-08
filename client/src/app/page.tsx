import { Header } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { Problem } from "@/components/home/Problem";
import { Features } from "@/components/home/Features";
import { Journey } from "@/components/home/Journey";
import { Board } from "@/components/home/Board";
import { Ecosystem } from "@/components/home/Ecosystem";
import { Faq } from "@/components/home/Faq";
import { Outcome } from "@/components/home/Outcome";
import { Footer } from "@/components/home/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Marquee />
        <Problem />
        <Features />
        <Journey />
        <Board />
        <Ecosystem />
        <Faq />
        <Outcome />
      </main>
      <Footer />
    </>
  );
}

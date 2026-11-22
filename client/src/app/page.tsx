import { Header } from "@/components/home/Header";
import { Problem } from "@/components/home/Problem";
import { Board } from "@/components/home/Board";
import { Faq } from "@/components/home/Faq";
import { Footer } from "@/components/home/Footer";
import CityExperience from "@/components/city/CityExperience";
import { Features, FinalCta, HowItWorks, Impact, Transparency } from "@/components/city/CitySections";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <CityExperience />
        <HowItWorks />
        <Features />
        <Impact />
        <Transparency />
        <Board />
        <Problem />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

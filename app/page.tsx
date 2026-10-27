import HeroSection from "./components/HeroSection/HeroSection";
import Section2 from "./components/Section2/Section2";
import Section3 from "./components/Section3/Section3";
import Section4 from "./components/Section4/Section4";
import Section5 from "./components/Section5/Section5";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Section2 />
      <div style={{
        background: "linear-gradient(180deg, #EEF0F4 0%, #e7ecf3 100%)",
        overflow: "hidden",
        position: "relative",
      }}>
        <Section3 />
        <Section4 />
        <Section5 />
وي 
      </div>
    </main>
  );
}

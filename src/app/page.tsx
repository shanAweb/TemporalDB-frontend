import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ArchitectureSection from "@/components/landing/ArchitectureSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <div className="glow-line" />
        <FeaturesSection />
        <div className="glow-line" />
        <HowItWorksSection />
        <div className="glow-line" />
        <ArchitectureSection />
        <div className="glow-line" />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

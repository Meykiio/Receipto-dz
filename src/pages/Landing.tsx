import { useEffect } from "react";
import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSolution from "@/components/landing/ProblemSolution";
import FeaturesSection from "@/components/landing/FeaturesSection";
import GlobalAdoption from "@/components/landing/GlobalAdoption";
import DashboardPreview from "@/components/landing/DashboardPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import VisionSection from "@/components/landing/VisionSection";
import Testimonials from "@/components/landing/Testimonials";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";

// Import AOS library for scroll animations
import AOS from 'aos';
import 'aos/dist/aos.css';

const Landing = () => {
  useEffect(() => {
    // Initialize AOS animation library
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out',
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <LandingNav />
      
      <main>
        <HeroSection />
        <ProblemSolution />
        <FeaturesSection />
        <GlobalAdoption />
        <DashboardPreview />
        <HowItWorks />
        <VisionSection />
        <Testimonials />
        <CtaSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Landing;

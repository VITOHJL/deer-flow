import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { HeroHunter } from "@/components/landing/hero-hunter";
import { MetricsSection } from "@/components/landing/sections/metrics-section";
import { LLMSection } from "@/components/landing/sections/llm-section";
import { FlywheelSection } from "@/components/landing/sections/flywheel-section";
import { GangSection } from "@/components/landing/sections/gang-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a]">
      <Header />
      <main className="flex w-full flex-col">
        <HeroHunter />
        <MetricsSection />
        <LLMSection />
        <FlywheelSection />
        <GangSection />
      </main>
      <Footer />
    </div>
  );
}
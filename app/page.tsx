import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Processes } from "@/components/Processes";
import { PrecisionVideo } from "@/components/PrecisionVideo";
import { Services } from "@/components/Services";
import { GarageExperience } from "@/components/GarageExperience";
import { BeforeAfterGallery } from "@/components/BeforeAfterGallery";
import { Location } from "@/components/Location";
import { MotoDashboard } from "@/components/MotoDashboard";
import { CtaFinal } from "@/components/CtaFinal";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <Processes />
      <PrecisionVideo />
      <Services />
      <GarageExperience />
      <BeforeAfterGallery />
      <Location />
      <MotoDashboard />
      <CtaFinal />
      <Footer />
    </>
  );
}

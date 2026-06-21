import React from 'react';
import Hero from '../components/Hero';
import FeaturesSection from '../components/FeaturesSection';
import WhatIsDermavision from '../components/WhatIsDermavision';
import DetectableDiseases from '../components/DetectableDiseases';
import PricingSection from '../components/PricingSection';
import ImpactStats from '../components/ImpactStats';
import FAQSection from '../components/FAQSection';

const Home = () => {
  return (
    <div>
      <Hero />
      <FeaturesSection />
      <WhatIsDermavision />
      <DetectableDiseases />
      <PricingSection />
      <ImpactStats />
      <FAQSection />
    </div>
  );
};

export default Home;
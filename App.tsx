import React from 'react';
import Navbar from './components/Layout/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Treatments from './components/Treatments';
import BeforeAfter from './components/BeforeAfter';
import InstagramFeed from './components/InstagramFeed';
import Contact from './components/Contact';
import Footer from './components/Layout/Footer';
import CustomCursor from './components/CustomCursor';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import LegalModal from './components/LegalModal';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-base selection:bg-gold selection:text-white">
      <CustomCursor />
      <Navbar />
      
      <main>
        <Hero />
        <About />
        <Treatments />
        <BeforeAfter />
        <InstagramFeed />
        <Contact />
      </main>

      <Footer />
      <FloatingWhatsApp />
      <LegalModal />
    </div>
  );
};

export default App;
import React from 'react';
import {
  ShieldCheck,
  Lock,
  Fingerprint,
  Activity,
  Cpu,
  AlertCircle,
  PlayCircle,
} from 'lucide-react';

interface LandingPageProps {
  onStartJourney: () => void;
  onLaunchApp: () => void;
}

export default function LandingPage({ onStartJourney, onLaunchApp }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-app-main text-app-primary">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-app-main/70 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold">ElevateOS</span>
        <nav className="flex items-center gap-6">
          <a href="#features" className="hover:underline">Features</a>
          <a href="#security" className="hover:underline">Security</a>
          <button
            onClick={onLaunchApp}
            className="ml-4 px-8 py-4 border-2 border-indigo-600 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
          >
            Launch App
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center bg-app-main">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Synchronize Your Vitality with AI-Driven Intelligence
        </h1>
        <p className="mt-4 text-lg max-w-xl mx-auto text-app-primary">
          Experience the future of holistic health with biometric security, real-time
          risk prediction, and personalized AI coaching.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onStartJourney}
            className="px-8 py-4 border-2 border-app-accent bg-app-accent text-white rounded-full hover:bg-indigo-700 transition"
          >
            Start Your Journey
          </button>
          <button
            onClick={onLaunchApp}
            className="px-8 py-4 bg-app-card text-app-accent border-2 border-app-accent rounded-full hover:bg-indigo-50 transition flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-8 h-8" /> Watch Demo
          </button>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="px-6 py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="bg-app-card rounded-2xl p-6 shadow-lg flex flex-col items-center text-center">
            <Fingerprint className="w-10 h-10 text-app-accent mb-4" />
            <h3 className="font-bold text-lg text-app-primary">Biometric UPI</h3>
            <p className="mt-2 text-sm text-app-primary">
              Secure payments up to ₹5,000 using FaceID/Fingerprint.
            </p>
          </div>
          <div className="bg-app-card rounded-2xl p-6 shadow-lg flex flex-col items-center text-center">
            <Activity className="w-10 h-10 text-app-accent mb-4" />
            <h3 className="font-bold text-lg text-app-primary">Predictive Risk Modeling</h3>
            <p className="mt-2 text-sm text-app-primary">
              ML-driven cardiac and diabetic risk assessments.
            </p>
          </div>
          <div className="bg-app-card rounded-2xl p-6 shadow-lg flex flex-col items-center text-center">
            <Cpu className="w-10 h-10 text-app-accent mb-4" />
            <h3 className="font-bold text-lg text-app-primary">AI Nutrition & Fitness</h3>
            <p className="mt-2 text-sm text-app-primary">
              Adaptive meal and workout plans using Random Forest models.
            </p>
          </div>
          <div className="bg-app-card rounded-2xl p-6 shadow-lg flex flex-col items-center text-center">
            <AlertCircle className="w-10 h-10 text-app-accent mb-4" />
            <h3 className="font-bold text-lg text-app-primary">Zero-Click SOS</h3>
            <p className="mt-2 text-sm text-app-primary">
              Emergency activation via voice, fall detection, or a single tap.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Compliance */}
      <section id="security" className="px-6 py-20 bg-app-card">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">Trust & Compliance</h2>
          <p className="text-app-primary mb-8">
            Your health data stays private and secure. We are UIDAI Aadhaar verified
            and use end-to-end encryption.
          </p>
          <div className="flex justify-center gap-12">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              <span className="text-sm">UIDAI Aadhaar Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-6 h-6 text-indigo-600" />
              <span className="text-sm">End-to-End Encryption</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center bg-app-card">
        <p className="mb-4">Built for the Future of Healthcare</p>
        <div className="flex justify-center gap-6 text-sm">
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
      </footer>
    </div>
  );
}

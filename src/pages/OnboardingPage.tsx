import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/brand/Logo';
import { useUIStore } from '../store/ui';

const slides = [
  {
    icon: Search,
    title: 'Report and Track',
    description: 'Report suspicious activity and track important safety cases.',
    color: 'from-secondary-500 to-secondary-700',
  },
  {
    icon: Users,
    title: 'Help Find Missing Persons',
    description: 'Join communities searching for missing people.',
    color: 'from-primary to-primary-600',
  },
  {
    icon: ShieldCheck,
    title: 'Community + Law Enforcement Collaboration',
    description: 'Connect citizens and authorities for safer communities.',
    color: 'from-success-500 to-success-700',
  },
];

export function OnboardingPage({ onDone }: { onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const setHasOnboarded = useUIStore((s) => s.setHasOnboarded);
  const last = idx === slides.length - 1;
  const slide = slides[idx];

  const next = () => (last ? finish() : setIdx((i) => i + 1));
  const skip = () => finish();
  const finish = () => {
    setHasOnboarded(true);
    onDone();
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex items-center justify-between px-5 pt-6 safe-bottom">
        <Logo size={32} />
        <button onClick={skip} className="text-sm font-medium text-ink-muted hover:text-primary">
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center text-center max-w-sm"
          >
            <div
              className={`h-28 w-28 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center text-white shadow-card mb-8`}
            >
              <slide.icon size={52} strokeWidth={1.8} />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-3 text-balance">{slide.title}</h2>
            <p className="text-ink-muted text-balance">{slide.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 pb-8 safe-bottom space-y-4">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? 'w-6 bg-primary' : 'w-1.5 bg-surface-border'
              }`}
            />
          ))}
        </div>
        <Button variant="primary" size="lg" className="w-full" onClick={next}>
          {last ? 'Get Started' : 'Continue'}
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Logo } from '../components/brand/Logo';

export function SplashPage({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary-700 to-secondary-700 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        onAnimationComplete={() => setTimeout(onDone, 900)}
      >
        <Logo size={88} className="mb-6" />
      </motion.div>
      <motion.h1
        className="text-3xl font-extrabold tracking-tight"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        TraceNet
      </motion.h1>
      <motion.p
        className="mt-2 text-sm text-white/80 font-medium"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Together for Safer Communities
      </motion.p>
      <motion.div
        className="absolute bottom-10 flex gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <span className="h-2 w-2 rounded-full bg-white/70 animate-pulse-soft" />
        <span className="h-2 w-2 rounded-full bg-white/40 animate-pulse-soft" style={{ animationDelay: '0.2s' }} />
        <span className="h-2 w-2 rounded-full bg-white/20 animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
      </motion.div>
    </motion.div>
  );
}

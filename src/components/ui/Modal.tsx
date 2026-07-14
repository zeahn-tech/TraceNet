import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-primary-900/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full sm:max-w-lg bg-surface-card rounded-t-3xl sm:rounded-2xl shadow-xl border border-surface-border max-h-[90vh] overflow-y-auto"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border sticky top-0 bg-surface-card rounded-t-3xl sm:rounded-t-2xl">
              <h2 className="text-base font-semibold text-primary">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-ink-muted hover:bg-surface-border/50 hover:text-primary transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4">{children}</div>
            {footer && (
              <div className="px-5 py-4 border-t border-surface-border flex gap-2 justify-end safe-bottom">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

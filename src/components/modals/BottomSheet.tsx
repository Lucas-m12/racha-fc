"use client";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

interface BottomSheetProps {
  title: string;
  sub?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function BottomSheet({ title, sub, onClose, children, footer }: BottomSheetProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-sheet"
          onClick={(e) => e.stopPropagation()}
          initial={{ y: reduce ? 0 : "100%" }}
          animate={{ y: 0 }}
          exit={{ y: reduce ? 0 : "100%" }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 28 }}
        >
          <div className="modal-header">
            <div className="title">
              <span className="date">{title.toUpperCase()}</span>
              {sub && <span className="lbl-serif">{sub}</span>}
            </div>
            <button type="button" className="close" onClick={onClose} aria-label="close">
              <Icon name="x" size={18} />
            </button>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

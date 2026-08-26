// v4 — 2026-08-18 — narrow Zustand subscriptions to required state slices
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import avatarImg from '../../assets/sonia-avatar.jpg';
import useUIStore from '../../store/useUIStore';

export default function TutorAvatar({ isSpeaking, size = 60, className = '' }) {
  const soniaAvatar = useUIStore((state) => state.soniaAvatar);
  const currentAvatar = soniaAvatar || avatarImg;

  // A smooth gradient for the neon spectrum using the UI color palette
  const glowGradient = 'conic-gradient(from 0deg, var(--accent-primary), var(--warning), var(--accent-primary), var(--warning), var(--accent-primary))';
  
  return (
    <div 
      className={`tutor-avatar ${className}`}
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Smooth glowing spectrum behind the image when speaking */}
      <AnimatePresence>
        {isSpeaking && (
          <>
            {/* Base smooth blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6, rotate: [0, 360], scale: [1, 1.15, 1] }}
              exit={{ opacity: 0 }}
              transition={{ 
                opacity: { duration: 0.5, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 4, ease: "linear" },
                scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
              }}
              style={{
                position: 'absolute',
                inset: -8,
                borderRadius: '50%',
                background: glowGradient,
                filter: 'blur(10px)',
                zIndex: 0
              }}
            />
            
            {/* Inner organic liquid distortion spectrum */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 0.8,
                rotate: [360, 0], 
                scale: [1, 1.1, 0.95, 1.05, 1],
                borderRadius: [
                  '50%', 
                  '40% 60% 70% 30% / 40% 50% 60% 50%', 
                  '60% 40% 30% 70% / 60% 30% 70% 40%', 
                  '50%'
                ]
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                opacity: { duration: 0.5, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 5, ease: "linear" },
                scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                borderRadius: { repeat: Infinity, duration: 2, ease: "easeInOut" }
              }}
              style={{
                position: 'absolute',
                inset: -4,
                background: glowGradient,
                filter: 'blur(4px)',
                zIndex: 1
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Avatar Image */}
      <motion.div
        animate={isSpeaking ? { scale: [1, 1.02, 1] } : { scale: 1 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          zIndex: 2,
          border: '2px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: '#141413',
          boxShadow: isSpeaking ? '0 0 20px rgba(0,0,0,0.5)' : 'none'
        }}
      >
        <img 
          src={currentAvatar} 
          alt="Sonia Tutor" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </motion.div>
    </div>
  );
}

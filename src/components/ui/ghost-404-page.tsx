'use client';

import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';
import { IdeaVaultLogo } from './idea-vault-logo';

const containerVariants = {
  hidden: { 
    opacity: 0,
    y: 30
  },
  visible: { 
    opacity: 1,
    y: 0
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1, 
    y: 0
  }
};

const numberVariants = {
  hidden: (direction: number) => ({
    opacity: 0,
    x: direction * 40,
    y: 15,
    rotate: direction * 5
  }),
  visible: {
    opacity: 0.8,
    x: 0,
    y: 0,
    rotate: 0
  }
};

const ghostVariants = {
  hidden: { 
    scale: 0.8,
    opacity: 0,
    y: 15,
    rotate: -5
  },
  visible: { 
    scale: 1,
    opacity: 1,
    y: 0,
    rotate: 0
  },
  hover: {
    scale: 1.1,
    y: -10,
    rotate: [0, -5, 5, -5, 0]
  },
  floating: {
    y: [-5, 5]
  }
};

export function NotFound() {
  return (
    <>
      <style>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(1.85);
          }
          50% {
            transform: scale(1.55);
          }
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
      <div className="min-h-screen w-full relative overflow-hidden scroll-smooth">
        {/* Background SVG - Same as landing page */}
        <div className="fixed inset-0 z-0">
          <div 
            className="absolute inset-0 scale-125 transform"
            style={{
              animation: 'breathe 8s ease-in-out infinite'
            }}
          >
            <svg 
              className="w-full h-full object-cover"
              xmlns="http://www.w3.org/2000/svg" 
              width="4000" 
              height="4000" 
              viewBox="-900 -900 4400 4400" 
              fill="none" 
              preserveAspectRatio="xMidYMid slice"
            >
            <g filter="url(#filter0_f)">
              <rect x="2143" y="455" width="1690" height="1690" rx="710.009" transform="rotate(90 2143 455)" fill="#84AE92" opacity="0.65" />
            </g>
            <g filter="url(#filter1_f)">
              <rect x="2126" y="474.675" width="1655.58" height="1653.6" rx="710.009" transform="rotate(90 2126 474.675)" fill="#B9D4AA" opacity="0.65" />
            </g>
            <g filter="url(#filter_common_f)">
              <rect x="2018" y="582.866" width="1439.21" height="1437.8" rx="710.009" transform="rotate(90 2018 582.866)" fill="#5A827E" />
              <rect x="2057" y="576.304" width="1452.32" height="1515.8" rx="710.009" transform="rotate(90 2057 576.304)" fill="#FAFFCA" />
              <rect x="2018" y="582.866" width="1439.21" height="1437.8" rx="710.009" transform="rotate(90 2018 582.866)" fill="#B9D4AA" opacity="0.65" />
            </g>
            <g filter="url(#filter5_f)">
              <rect x="1858" y="766.034" width="1084.79" height="1117.93" rx="483.146" transform="rotate(90 1858 766.034)" fill="#84AE92" />
            </g>
            <g filter="url(#filter6_f)">
              <rect x="1779" y="698.622" width="1178.25" height="962.391" rx="481.196" transform="rotate(90 1779 698.622)" fill="#5A827E" />
            </g>
            <defs>
              <filter id="filter0_f" x="0.074" y="2.074" width="2595.85" height="2595.85" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="140" />
              </filter>
              <filter id="filter1_f" x="250.311" y="252.587" width="2097.78" height="2099.76" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="60" />
              </filter>
              <filter id="filter_common_f" x="393" y="428" width="1812" height="1748" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="58" />
              </filter>
              <filter id="filter5_f" x="443.964" y="469.927" width="1710.14" height="1677" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="115" />
              </filter>
              <filter id="filter6_f" x="520.502" y="402.515" width="1554.6" height="1770.46" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="115" />
              </filter>
            </defs>
          </svg>
          </div>
        </div>
        
        {/* Gradient overlay for smoother fade like Lovable */}
        <div className="fixed inset-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/25"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/1 via-transparent to-black/15"></div>
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.2) 100%)'
          }}></div>
        </div>

        {/* Header - Same as landing page */}
        <header className="relative z-20 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                          <div className="flex items-center space-x-3">
              <Link to="/">
                <IdeaVaultLogo 
                  size="lg" 
                  variant="light" 
                  className="cursor-pointer hover:scale-105 transition-transform duration-200"
                />
              </Link>
            </div>
            </div>
          </div>
        </header>

        {/* 404 Content */}
        <div className="relative z-20 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <AnimatePresence mode="wait">
        <motion.div 
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-8 md:mb-12">
            <motion.span 
                  className="text-[80px] md:text-[120px] font-bold text-[#FAFFCA] select-none"
              variants={numberVariants}
              custom={-1}
            >
              4
            </motion.span>
            <motion.div
              variants={ghostVariants}
              whileHover="hover"
              animate={["visible", "floating"]}
            >
              <img
                src="https://i.postimg.cc/WzXD5tR0/image-Photoroom.png"
                alt="Ghost"
                width={120}
                height={120}
                className="w-[80px] h-[80px] md:w-[120px] md:h-[120px] object-contain select-none"
                draggable="false"
              />
            </motion.div>
            <motion.span 
                  className="text-[80px] md:text-[120px] font-bold text-[#FAFFCA] select-none"
              variants={numberVariants}
              custom={1}
            >
              4
            </motion.span>
          </div>
          
          <motion.h1 
                className="text-3xl md:text-5xl font-bold text-[#FAFFCA] mb-4 md:mb-6 select-none"
            variants={itemVariants}
          >
            Boo! Page missing!
          </motion.h1>
          
          <motion.p 
                className="text-lg md:text-xl text-[#B9D4AA] mb-8 md:mb-12 select-none"
            variants={itemVariants}
          >
            Whoops! This page must be a ghost - it&apos;s not here!
          </motion.p>

          <motion.div
            variants={itemVariants}
            whileHover={{
              scale: 1.05,
              transition: {
                duration: 0.3,
                ease: [0.43, 0.13, 0.23, 0.96]
              }
            }}
          >
            <Link
              to="/"
                  className="inline-block bg-[#5A827E] hover:bg-[#84AE92] text-[#FAFFCA] px-8 py-3 rounded-full text-lg font-medium transition-colors duration-300 select-none"
            >
              Find shelter
            </Link>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>

        {/* Footer - Same as landing page */}
        <footer className="relative z-20 mt-16 py-8 bg-black border-t border-[#5A827E]/30 transition-all duration-300">
                     <div className="max-w-full mx-auto px-8">
             <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 space-y-4 md:space-y-0">
               <div className="flex items-center">
                 <IdeaVaultLogo 
                   size="sm" 
                   variant="dark" 
                 />
               </div>
              <div className="flex items-center space-x-6">
                <span>© 2024 IdeaVault. All rights reserved.</span>
                <div className="flex items-center space-x-4">
                  <span className="hover:text-[#B9D4AA] cursor-pointer transition-colors duration-300">Privacy</span>
                  <span className="hover:text-[#B9D4AA] cursor-pointer transition-colors duration-300">Terms</span>
                  <span className="hover:text-[#B9D4AA] cursor-pointer transition-colors duration-300">Contact</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

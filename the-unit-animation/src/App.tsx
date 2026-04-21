/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";

export default function App() {
  return (
    <div 
      className="min-h-screen bg-white flex items-center justify-center overflow-hidden font-sans"
      style={{ perspective: "1000px" }}
    >
      <motion.div
        animate={{
          rotateX: [0, 25, -8, 2, 0],
          y: [0, 8, -2, 0, 0]
        }}
        transition={{
          duration: 1.5,
          times: [0, 0.3, 0.6, 0.8, 1],
          repeat: Infinity,
          repeatDelay: 3.5,
          ease: "easeInOut",
          delay: 4
        }}
        className="flex items-center"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="relative flex items-center drop-shadow-sm">
          {/* SVG for "T H E" */}
          <svg 
            viewBox="0 0 180 80" 
            className="w-[180px] h-[80px]" 
            stroke="currentColor" 
            strokeWidth="10" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none"
          >
            {/* T */}
            <motion.path
              d="M 15 15 L 55 15 M 35 15 L 35 65"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 1, transition: { duration: 1, ease: "easeInOut" } }
              }}
              initial="hidden"
              animate="visible"
            />
            {/* H */}
            <motion.path
              d="M 75 15 L 75 65 M 75 40 L 115 40 M 115 15 L 115 65"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 1, transition: { duration: 1, ease: "easeInOut", delay: 0.5 } }
              }}
              initial="hidden"
              animate="visible"
            />
            {/* E */}
            <motion.path
              d="M 165 15 L 135 15 L 135 65 L 165 65 M 135 40 L 155 40"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 1, transition: { duration: 1, ease: "easeInOut", delay: 1 } }
              }}
              initial="hidden"
              animate="visible"
            />
          </svg>

          {/* Sliding "unit" text */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            transition={{ delay: 1.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden whitespace-nowrap flex items-center ml-1"
          >
            <span className="text-[54px] font-bold tracking-tight text-slate-900 pb-[2px] pr-4">
              unit
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

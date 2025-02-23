"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const Collapsable = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg shadow-md overflow-hidden bg-white">
      {/* Header with toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-all"
      >
        <span className="text-lg text-black font-medium">{isOpen ? `▼ ${title}` : `► ${title}`}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Collapsible content with animation */}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden px-4"
      >
        <div className="py-3">{children}</div>
      </motion.div>
    </div>
  );
};

export default Collapsable;

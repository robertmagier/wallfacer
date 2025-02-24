"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const Collapsable = ({
  title,
  children,
  open,
}: {
  title: string;
  children: React.ReactNode;
  open: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(open);

  return (
    <div className="bg-gray-100 border rounded-lg shadow-md overflow-hidden py-4">
      {/* Header with toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center  transition-all "
      >
        <span className="text-2xl text-black font-medium text-center w-full bg-gray-100">
          {isOpen ? `▼ ${title}` : `► ${title}`}
        </span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Collapsible content with animation */}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden bg-gray-100"
      >
        <div className="py-3">{children}</div>
      </motion.div>
    </div>
  );
};

export default Collapsable;

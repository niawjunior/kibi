"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Header() {
  return (
    <header className="w-full py-4 px-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo_iig-white.svg"
            alt="IIG Logo"
            width={80}
            height={20}
            className="object-contain"
            priority
          />
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/generate"
            className={`relative px-2 py-1 text-sm text-white font-medium transition-colors`}
          >
            <motion.div
              layoutId="nav-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            Generate
          </Link>

          {/* <Link
            href="/visitors"
            className={`relative px-2 py-1 text-sm text-white font-medium transition-colors`}
          >
            <motion.div
              layoutId="nav-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            Visitors
          </Link> */}
        </nav>
      </div>
    </header>
  );
}

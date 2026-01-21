"use client";

import { Menu, X } from "lucide-react";

interface MobileMenuButtonProps {
    mobileMenuOpen: boolean;
    onToggle: () => void;
    darkMode: boolean;
}

export function MobileMenuButton({ mobileMenuOpen, onToggle, darkMode }: MobileMenuButtonProps) {
    return (
        <button
            onClick={onToggle}
            className={`md:hidden fixed top-4 left-4 z-50 p-3 ${
                darkMode ? "hover:bg-[#2D3748]" : "hover:bg-gray-100"
            } rounded-lg`}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
        >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
    );
}


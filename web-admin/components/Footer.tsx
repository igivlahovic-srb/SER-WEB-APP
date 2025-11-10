"use client";

import React from "react";

export default function Footer() {
  const version = "1.0.0";
  const developer = "IV Software Engineering";

  return (
    <footer className="mt-auto py-4 px-6 border-t border-gray-200 bg-white">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="font-medium">Verzija {version}</span>
        </div>

        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span>Developed by <span className="font-semibold text-blue-600">{developer}</span></span>
        </div>
      </div>
    </footer>
  );
}

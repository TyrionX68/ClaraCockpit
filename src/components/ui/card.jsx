/**
 * card.jsx
 * UI Card Components - Clara360 Design System
 * MANUS A Phase 2.1 - Saubere UI-Komponenten
 */
import React from "react";

export function Card({ children, ...props }) {
  return <div className="bg-white shadow rounded-xl p-4" {...props}>{children}</div>;
}

export function CardHeader({ children }) {
  return <div className="mb-2">{children}</div>;
}

export function CardTitle({ children }) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}

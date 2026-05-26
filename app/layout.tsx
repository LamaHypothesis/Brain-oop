import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brain OOP Visualizer",
  description: "OOP Polymorphism & Inheritance visualized: BrainADT → Brain → Cerebrum / Diencephalon / Brainstem / Cerebellum",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

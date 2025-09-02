import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Speqq DSL Demo — PRD + Prototype Copilot",
  description: "Flash demo: draft PRDs and generate clickable prototypes with an AI copilot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased bg-[radial-gradient(1200px_800px_at_80%_-200px,rgba(99,102,241,0.18),transparent_60%),radial-gradient(1000px_700px_at_-200px_80%,rgba(16,185,129,0.18),transparent_60%)]`}
      >
        {children}
      </body>
    </html>
  );
}

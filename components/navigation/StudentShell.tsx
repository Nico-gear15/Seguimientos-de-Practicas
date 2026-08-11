"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface StudentShellProps {
  children: React.ReactNode;
  nombreEstudiante?: string;
  correoEstudiante?: string;
  title?: string;
}

export function StudentShell({
  children,
  nombreEstudiante,
  correoEstudiante,
  title,
}: StudentShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      <Sidebar nombreEstudiante={nombreEstudiante} correoEstudiante={correoEstudiante} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import SidebarNav from "@/components/layout/SidebarNav";

export default function PublicLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[var(--app-bg)]">
            {/* Sidebar - Desktop */}
            <aside className="hidden w-[280px] shrink-0 lg:block">
                <div className="sticky top-0 h-screen overflow-y-auto border-r border-[var(--app-border)] bg-[var(--app-bg-soft)]">
                    <SidebarNav />
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex min-w-0 flex-1 flex-col">
                <Header onMenuToggle={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-[1280px]">
                        {children}
                    </div>
                </main>

                <Footer />
            </div>

            {/* Sidebar - Mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-[70] lg:hidden">
                    <div
                        className="absolute inset-0 bg-sky-950/20 backdrop-blur-[2px]"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="absolute left-0 top-0 h-full w-[280px] overflow-y-auto bg-[var(--app-bg-soft)] shadow-2xl">
                        <SidebarNav onNavigate={() => setSidebarOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}

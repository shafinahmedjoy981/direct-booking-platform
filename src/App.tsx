/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { ToastContainer } from './components/common/Toast';
import { QrCodeModal } from './components/common/QrCodeModal';
import { GuidedTour } from './components/common/GuidedTour';

// Screens
import { DashboardView } from './components/dashboard/DashboardView';
import { CalendarView } from './components/calendar/CalendarView';
import { BookingsView } from './components/bookings/BookingsView';
import { BookingDetailDrawer } from './components/bookings/BookingDetailDrawer';
import { AddBookingModal } from './components/add-booking/AddBookingModal';
import { RoomsPricingView } from './components/rooms/RoomsPricingView';
import { PaymentsView } from './components/payments/PaymentsView';
import { CommissionCalculatorView } from './components/calculator/CommissionCalculatorView';
import { GuestsView } from './components/guests/GuestsView';
import { MessagesView } from './components/messages/MessagesView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { PublicBookingPage } from './components/public-booking/PublicBookingPage';

const AppContent: React.FC = () => {
  const { activeScreen, language } = useApp();

  // Dev check that logs a single grouped summary for Bangla letters and digits found on screen in English mode
  useEffect(() => {
    // Disable in production
    if (import.meta.env.PROD || language !== 'en') return;

    const checkDomForBangla = () => {
      if (typeof document === 'undefined') return;
      // Scan only Bangla letters and digits, explicitly excluding U+09F3 (৳)
      const bengaliLetterOrDigitRegex = /[\u0985-\u09B9\u09BC-\u09CE\u09E6-\u09EF]/;
      const foundItems: string[] = [];
      const seen = new Set<string>();

      const walk = (node: Node) => {
        if (!node) return;
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const tagName = el.tagName?.toLowerCase();
          if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
            return;
          }
          if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
            if (el.placeholder && bengaliLetterOrDigitRegex.test(el.placeholder) && !seen.has(el.placeholder)) {
              seen.add(el.placeholder);
              foundItems.push(`placeholder: "${el.placeholder}"`);
            }
          }
        }
        if (node.nodeType === Node.TEXT_NODE) {
          const text = (node.textContent || '').trim();
          if (text && bengaliLetterOrDigitRegex.test(text) && !seen.has(text)) {
            seen.add(text);
            const parent = node.parentElement;
            const tagDesc = parent ? `<${parent.tagName.toLowerCase()}${parent.className ? ' class="' + String(parent.className).slice(0, 30) + '"' : ''}>` : 'unknown';
            foundItems.push(`"${text}" in ${tagDesc}`);
          }
        } else {
          for (let i = 0; i < node.childNodes.length; i++) {
            walk(node.childNodes[i]);
          }
        }
      };

      walk(document.body);

      // Log one grouped summary instead of one warning per element
      if (foundItems.length > 0) {
        console.warn(
          `[DevCheck] ${foundItems.length} Bangla strings found on screen in English mode:\n` +
          foundItems.map((item, idx) => `  ${idx + 1}. ${item}`).join('\n')
        );
      }
    };

    // Run once after render (not on every DOM mutation)
    const timer = setTimeout(checkDomForBangla, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [language, activeScreen]);

  // If viewing the guest-facing public booking page
  if (activeScreen === 'public_booking') {
    return (
      <>
        <PublicBookingPage />
        <QrCodeModal />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#F4FEFF] text-[#0A0A0A] overflow-hidden select-none font-sans">
      {/* Desktop Solid Navy Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 md:pb-8 focus:outline-none">
          {activeScreen === 'today' && <DashboardView />}
          {activeScreen === 'calendar' && <CalendarView />}
          {activeScreen === 'bookings' && <BookingsView />}
          {activeScreen === 'rooms_pricing' && <RoomsPricingView />}
          {activeScreen === 'payments' && <PaymentsView />}
          {activeScreen === 'calculator' && <CommissionCalculatorView />}
          {activeScreen === 'guests' && <GuestsView />}
          {activeScreen === 'messages' && <MessagesView />}
          {activeScreen === 'reports' && <ReportsView />}
          {activeScreen === 'settings' && <SettingsView />}
        </main>

        {/* Mobile Fixed Bottom Navigation Bar */}
        <MobileNav />
      </div>

      {/* Global Drawers, Modals & Toast Notifications */}
      <BookingDetailDrawer />
      <AddBookingModal />
      <QrCodeModal />
      <GuidedTour />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

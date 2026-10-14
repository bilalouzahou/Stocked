/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { ActivePage, Product } from './types/inventory';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { ProductsView } from './views/ProductsView';
import { StockView } from './views/StockView';
import { MovementsView } from './views/MovementsView';
import { LoginView } from './views/LoginView';
import { ProductModal } from './components/ProductModal';
import { SettingsModal } from './views/SettingsModal';
import { Toast, ToastMessage } from './components/Toast';
import { Logo } from './components/Logo';

const MainLayout: React.FC = () => {
  const { currentUser } = useInventory();
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (t: ToastMessage) => {
    setToast(t);
    setTimeout(() => {
      setToast((current) => (current?.id === t.id ? null : current));
    }, 4000);
  };

  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setProductToEdit(prod);
    setIsProductModalOpen(true);
  };

  // Auth Gate: If not logged in, show Login view
  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#f7f5ed] flex flex-col md:flex-row antialiased selection:bg-[#0f5b43]/15 selection:text-[#0f5b43]">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#f4f1e8] border-b border-[#e6e1d3]">
        <Logo size="sm" />

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-1.5 rounded-lg text-[#556059] hover:text-[#17211d] hover:bg-[#eae5d8]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl">
        {activePage === 'dashboard' && (
          <DashboardView
            onNavigate={setActivePage}
            onOpenAddModal={handleOpenAddModal}
          />
        )}

        {activePage === 'products' && (
          <ProductsView
            onOpenAddModal={handleOpenAddModal}
            onEditProduct={handleEditProduct}
          />
        )}

        {activePage === 'stock' && (
          <StockView onShowToast={showToast} />
        )}

        {activePage === 'movements' && (
          <MovementsView onNavigate={setActivePage} />
        )}
      </main>

      {/* Product Modal (Add & Edit) */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};

export default function App() {
  return (
    <InventoryProvider>
      <MainLayout />
    </InventoryProvider>
  );
}

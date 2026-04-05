import React from 'react';
import { ViewState } from '../types';
import { Sparkles, ShoppingBag, Camera, GraduationCap, MessageCircleHeart, LogOut, ScanFace, Smile, History, ScanBarcode, Layers } from 'lucide-react';
import AbstractText from './AbstractText';

interface NavBarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  cartCount: number;
  onLogout: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentView, setView, cartCount, onLogout }) => {
  const navItems = [
    { id: ViewState.HOME, icon: Sparkles, label: 'Inicio' },
    { id: ViewState.ANALYSIS, icon: Camera, label: 'Análisis' },
    { id: ViewState.INGREDIENTS, icon: ScanBarcode, label: 'Scanner' },
    { id: ViewState.ROUTINE_BUILDER, icon: Layers, label: 'Rutina' },
    { id: ViewState.SMART_MIRROR, icon: ScanFace, label: 'Mirror' },
    { id: ViewState.ADVISOR, icon: MessageCircleHeart, label: 'Emma' },
    { id: ViewState.SHOP, icon: ShoppingBag, label: 'Tienda', badge: cartCount },
    { id: ViewState.EDUCATION, icon: GraduationCap, label: 'Aprende' },
    { id: ViewState.REACTION, icon: Smile, label: 'Reacción' },
    { id: ViewState.PRODUCT_HISTORY, icon: History, label: 'Historia' },
  ];

  return (
    <nav className="fixed bottom-0 md:bottom-auto md:top-0 w-full z-50 glass-panel md:rounded-b-[2rem] border-t md:border-t-0 md:border-b-2 border-white/60 shadow-lg shadow-pink-100/40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16 md:h-24">
            {/* Logo for Desktop */}
            <div className="hidden md:flex items-center space-x-3 cursor-pointer group" onClick={() => setView(ViewState.HOME)}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emma-almond to-emma-tickled flex items-center justify-center text-white font-serif font-bold text-3xl shadow-md group-hover:scale-110 transition-transform border-2 border-white ring-2 ring-pink-100">
                    E
                </div>
                <div className="text-emma-tickled mt-2 transform group-hover:translate-x-1 transition-transform">
                  <AbstractText text="Emma Glow" baseSize="md" align="left" className="tracking-wide"/>
                </div>
            </div>

            {/* Nav Links */}
            {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2 p-2.5 rounded-2xl transition-all ${
                currentView === item.id
                  ? 'text-white bg-[#ec4899] scale-105 font-bold shadow-lg shadow-pink-200'
                  : 'text-gray-500 hover:text-[#ec4899] hover:bg-pink-50'
              }`}
            >
              <div className="relative">
                <item.icon size={20} />
              </div>
              <span className="text-xs md:text-sm font-medium">{item.label}</span>
            </button>
          ))}

          
                  <LogOut size={20} />
                </button>
            </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

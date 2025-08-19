'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  LogOut, 
  Menu, 
  X, 
  Calendar, 
  Stethoscope, 
  Users, 
  Home,
  Settings,
  Bell,
  Heart
} from 'lucide-react';

const Navigation: React.FC = () => {
  const { user, logout, isAuthenticated, isDoctor, isAdmin, isPatient } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const navItems = [
    
    // Only show 'Doctors' if not authenticated or isPatient
    ...((!isAuthenticated || isPatient) ? [
      { href: '/doctors', label: 'Doctors', icon: Stethoscope },
    ] : []),
    ...(isAuthenticated && isPatient ? [
      { href: '/appointments', label: 'My Appointments', icon: Calendar },
      { href: '/book-appointment', label: 'Book Appointment', icon: Calendar },
      { href: '/patient/profile', label: 'Profile', icon: User },
    ] : []),
    ...(isAuthenticated && isDoctor ? [
      { href: '/doctor/dashboard', label: 'Dashboard', icon: Stethoscope },
      { href: '/doctor/appointments', label: 'Appointments', icon: Calendar },
      { href: '/doctor/availability', label: 'Availability', icon: Settings },
      { href: '/doctor/profile', label: 'Profile', icon: User },
    ] : []),
    ...(isAuthenticated && isAdmin ? [
      { href: '/admin/dashboard', label: 'Admin Dashboard', icon: Users },
      { href: '/admin/doctors', label: 'Manage Doctors', icon: Stethoscope },
      { href: '/admin/users', label: 'Manage Users', icon: Users },
    ] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/20 shadow-professional">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-elevated">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <Link href="/" className="text-2xl font-bold heading-font text-[#0E6BA8]">
              Eshaafi
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="flex items-center space-x-2 text-[#1F2937] hover:text-[#0E6BA8] transition-colors duration-300 font-medium"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-professional border border-white/20">
                  <div className="w-8 h-8 gradient-secondary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-[#1F2937]">
                      {user?.name}
                    </div>
                    <div className="text-xs text-[#4B5563] capitalize">
                      {user?.role}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-[#DC2626] hover:text-[#B91C1C] transition-colors duration-200 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-4"
              >
                <Link
                  href="/login"
                  className="btn-outline"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn-primary"
                >
                  Register
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#1F2937] hover:text-[#0E6BA8] transition-colors duration-200 p-2 rounded-lg hover:bg-white/20"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-effect border-t border-white/20"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 text-[#1F2937] hover:text-[#0E6BA8] transition-colors duration-200 py-3 px-4 rounded-lg hover:bg-white/20"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              
              {isAuthenticated ? (
                <div className="pt-4 border-t border-white/20 space-y-4">
                  <div className="flex items-center space-x-3 text-[#1F2937] p-4 bg-white/40 rounded-lg">
                    <div className="w-10 h-10 gradient-secondary rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">{user?.name}</div>
                      <div className="text-sm text-[#4B5563] capitalize">{user?.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 text-[#DC2626] hover:text-[#B91C1C] transition-colors duration-200 w-full p-3 rounded-lg hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/20 space-y-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-outline w-full justify-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-primary w-full justify-center"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;

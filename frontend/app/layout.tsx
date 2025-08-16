import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { ToastProvider } from "@/components/ui/Toaster";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "Eshaafi - Professional Healthcare Platform",
  description: "Connect with expert doctors, book appointments seamlessly, and manage your healthcare journey with our comprehensive platform.",
  keywords: "healthcare, appointments, doctors, patients, medical, telemedicine, professional",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${poppins.variable}`}>
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen gradient-bg flex flex-col">
              <Navigation />
              <main className="pt-16 flex-1">
                {children}
              </main>
              {/* Footer */}
              <footer className="glass-effect border-t border-white/20 shadow-lg mt-12">
                <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
                  {/* Logo & Description */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-elevated">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /><path d="M12 6v6l4 2" /></svg>
                      </div>
                      <span className="text-2xl font-bold heading-font text-[#0E6BA8]">Eshaafi</span>
                    </div>
                    <p className="text-gray-600 text-sm">Your trusted platform for professional healthcare, online doctor consultations, and seamless appointment booking.</p>
                  </div>
                  {/* Quick Links */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#0E6BA8] mb-3">Quick Links</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li><a href="/" className="hover:text-[#1CA7A6] transition-colors">Home</a></li>
                      <li><a href="/doctors" className="hover:text-[#1CA7A6] transition-colors">Doctors</a></li>
                      <li><a href="/book-appointment" className="hover:text-[#1CA7A6] transition-colors">Book Appointment</a></li>
                      <li><a href="/login" className="hover:text-[#1CA7A6] transition-colors">Login</a> / <a href="/register" className="hover:text-[#1CA7A6] transition-colors">Register</a></li>
                    </ul>
                  </div>
                  {/* Contact Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#0E6BA8] mb-3">Contact Us</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-center gap-2"><svg className="w-4 h-4 text-[#1CA7A6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10.5a8.38 8.38 0 01-.9 3.8c-.5 1-.9 1.7-1.6 2.4-.7.7-1.4 1.1-2.4 1.6-.9.4-2 .7-3.1.7s-2.2-.3-3.1-.7c-1-.5-1.7-.9-2.4-1.6-.7-.7-1.1-1.4-1.6-2.4-.4-.9-.7-2-.7-3.1s.3-2.2.7-3.1c.5-1 .9-1.7 1.6-2.4.7-.7 1.4-1.1 2.4-1.6.9-.4 2-.7 3.1-.7s2.2.3 3.1.7c1 .5 1.7.9 2.4 1.6.7.7 1.1 1.4 1.6 2.4.4.9.7 2 .7 3.1z" /><circle cx="12" cy="12" r="3" /></svg> 123 Medical Ave, City, Country</li>
                      <li className="flex items-center gap-2"><svg className="w-4 h-4 text-[#1CA7A6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 2H8a2 2 0 00-2 2v16a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2z" /><path d="M16 2v2a2 2 0 01-2 2H8a2 2 0 01-2-2V2" /></svg> info@eshaafi.com</li>
                      <li className="flex items-center gap-2"><svg className="w-4 h-4 text-[#1CA7A6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v2.08" /><path d="M16 2v2a2 2 0 01-2 2H8a2 2 0 01-2-2V2" /></svg> +1 234 567 890</li>
                    </ul>
                  </div>
                  {/* Social Media */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#0E6BA8] mb-3">Follow Us</h3>
                    <div className="flex gap-4">
                      <a href="#" aria-label="Twitter" className="hover:text-[#1CA7A6] transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4.36a9.09 9.09 0 01-2.88 1.1A4.52 4.52 0 0016.11 0c-2.5 0-4.52 2.02-4.52 4.52 0 .35.04.7.11 1.03C7.69 5.4 4.07 3.67 1.64 1.15c-.38.65-.6 1.4-.6 2.2 0 1.52.77 2.86 1.94 3.65A4.48 4.48 0 01.96 6v.06c0 2.13 1.52 3.9 3.54 4.3-.37.1-.76.16-1.16.16-.28 0-.55-.03-.81-.08.55 1.7 2.16 2.94 4.07 2.97A9.05 9.05 0 010 19.54a12.8 12.8 0 006.95 2.04c8.34 0 12.9-6.91 12.9-12.9 0-.2 0-.39-.01-.58A9.22 9.22 0 0023 3z" /></svg></a>
                      <a href="#" aria-label="Facebook" className="hover:text-[#1CA7A6] transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 2h-3a6 6 0 00-6 6v3H5v4h4v8h4v-8h3l1-4h-4V8a2 2 0 012-2h2z" /></svg></a>
                      <a href="#" aria-label="LinkedIn" className="hover:text-[#1CA7A6] transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" /><circle cx="2" cy="9" r="2" /><rect x="2" y="11" width="4" height="11" /></svg></a>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/10 mt-8 pt-6 text-center text-gray-500 text-sm">
                  &copy; {new Date().getFullYear()} Eshaafi. All rights reserved. | Designed & Developed by Eshaafi Team
                </div>
              </footer>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

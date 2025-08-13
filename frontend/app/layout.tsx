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
            <div className="min-h-screen gradient-bg">
              <Navigation />
              <main className="pt-16">
                {children}
              </main>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

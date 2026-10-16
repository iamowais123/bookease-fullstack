import React from 'react';
import { Scissors, MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand info */}
          <div className="space-y-4">
            <div
              onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 cursor-pointer group"
              title="Back to top"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-md shadow-purple-900/30">
                <Scissors className="w-5 h-5 -rotate-45" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight group-hover:text-purple-400 transition-colors">
                Perfect Darshan
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Experience modern luxury hair care, beauty artistry, and rejuvenating wellness tailored specifically for your unique style.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#instagram"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-slate-900 hover:bg-purple-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#facebook"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-slate-900 hover:bg-purple-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#twitter"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full bg-slate-900 hover:bg-purple-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Salon Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#services" className="hover:text-purple-400 transition-colors">
                  Signature Haircut & Styling
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-purple-400 transition-colors">
                  Balayage & Creative Coloring
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-purple-400 transition-colors">
                  Hydra Glow Facial Therapy
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-purple-400 transition-colors">
                  Keratin Smooth Treatment
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-purple-400 transition-colors">
                  Bridal & Event Glam
                </a>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Opening Hours
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Monday – Sunday</p>
                  <p className="text-xs text-slate-400">10:00 AM – 8:00 PM</p>
                </div>
              </li>
              <li className="pt-2 text-xs text-purple-300 bg-purple-950/40 p-2.5 rounded-lg border border-purple-800/30">
                ✨ Open 7 days a week. Appointments and walk-ins welcome!
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Visit & Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span className="text-slate-400 text-xs leading-relaxed">
                  104 Boulevard Luxury Avenue, Central District, Salon Suite 302
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-slate-300 text-xs">+1 (555) 382-7264</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-slate-300 text-xs">hello@bookease-salon.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BookEase Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for exceptional salon experiences
          </p>
        </div>
      </div>
    </footer>
  );
};

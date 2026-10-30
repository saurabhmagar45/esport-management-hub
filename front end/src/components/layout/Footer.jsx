import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Shield, Heart, MessageSquare } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#08090f] border-t border-slate-800/80 mt-20 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                ESPORT<span className="text-purple-500">HUB</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Complete Full-Stack Esports Tournament Management Platform for BGMI & Free Fire competitions. Built for competitive players, collegiate organizers, and esports leagues.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Competitive Titles</h4>
            <ul className="space-y-2">
              <li><Link to="/tournaments?game=BGMI" className="hover:text-purple-400 transition">BGMI (Battlegrounds Mobile India)</Link></li>
              <li><Link to="/tournaments?game=Free Fire" className="hover:text-purple-400 transition">Free Fire (MAX & Clash Squad)</Link></li>
              <li><span className="text-slate-600">Valorant (Coming Soon)</span></li>
              <li><span className="text-slate-600">Call of Duty: Mobile (Coming Soon)</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Features & System</h4>
            <ul className="space-y-2">
              <li><Link to="/tournaments" className="hover:text-purple-400 transition">Single-Elimination Brackets</Link></li>
              <li><Link to="/organizer" className="hover:text-purple-400 transition">Tournament Creation Wizard</Link></li>
              <li><Link to="/teams" className="hover:text-purple-400 transition">Squad Roster Management</Link></li>
              <li><span className="hover:text-purple-400 transition">Encrypted Room ID & Password Vault</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Platform & Support</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400" /> AES-256 Vault Protection</li>
              <li className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> College CS Final Year Capstone</li>
              <li className="text-slate-500">Built strictly following ethical fair-play standards.</li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500">
            © 2026 Esport Hub. Full-stack tournament management system.
          </p>
          <div className="flex items-center gap-6 text-slate-500">
            <span>Terms of Service</span>
            <span>Tournament Rules</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

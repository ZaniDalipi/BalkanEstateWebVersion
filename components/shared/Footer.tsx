import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1e3a5f] text-white py-4 mt-4 w-full">
      <div className="px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
          {/* Company Info */}
          <div className="text-center md:text-left">
            <h3 className="font-bold text-sm mb-1">Balkan Estate</h3>
            <p className="text-neutral-300">Premium Real Estate Services</p>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <p className="text-neutral-300">
              <span className="font-semibold">Contact:</span> info@balkanestate.com
            </p>
            <p className="text-neutral-300">
              <span className="font-semibold">Phone:</span> +383 XXX XXX
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-4 text-center">
            <a href="#" className="text-neutral-300 hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="text-neutral-300 hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="text-neutral-300 hover:text-white transition-colors">
              Messages
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-3 pt-3 border-t border-white/20">
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} Balkan Estate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

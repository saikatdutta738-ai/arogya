import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-12 px-6 text-center border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto">
        <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/20 leading-loose">
          developed by <span className="text-accent/40">saikat dutta</span> <span className="mx-2 opacity-50">|</span> all rights reserved! <span className="mx-2 opacity-50">|</span> Test and tailed only
        </p>
      </div>
    </footer>
  );
};

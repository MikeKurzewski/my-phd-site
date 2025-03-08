import React from 'react';
import { Menu } from 'lucide-react';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}


export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const closeMenuHandler = () => setIsMenuOpen(false);
    window.addEventListener('closeMenu', closeMenuHandler);
  
    return () => window.removeEventListener('closeMenu', closeMenuHandler);
  }, []);

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      <header className="bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-border-primary))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">My PhD Website</h1>
              </div>
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[rgb(var(--color-primary-400))]"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <Navigation isOpen={isMenuOpen} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
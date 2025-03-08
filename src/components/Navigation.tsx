import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, Briefcase, BookOpen, Settings } from 'lucide-react';

interface NavigationProps {
  isOpen: boolean;
}

const Navigation = ({ isOpen }: NavigationProps) => {
  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Briefcase, label: 'Projects', href: '/projects' },
    { icon: BookOpen, label: 'Publications', href: '/publications' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const handleLinkClick = () => {
    // Logic to close the menu
    const closeMenuEvent = new Event('closeMenu');
    window.dispatchEvent(closeMenuEvent);
  };

  return (
    <nav
      className={`${
        isOpen ? 'block' : 'hidden'
      } md:block w-64 bg-[rgb(var(--color-bg-secondary))] shadow-sm rounded-lg h-fit transform transition-transform duration-300`}
    >
      <div className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.href}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[rgb(var(--color-bg-tertiary))] ${
                    isActive
                      ? 'bg-[rgb(var(--color-primary-900))] text-[rgb(var(--color-primary-600))] dark:text-[rgb(var(--color-primary-400))]'
                      : 'text-[rgb(var(--color-bg-secondary))] dark:text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
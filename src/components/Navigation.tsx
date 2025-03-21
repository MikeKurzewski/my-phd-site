import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, Briefcase, BookOpen, FileText, Settings, Plus } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface NavigationProps {
  isOpen: boolean;
}

interface CustomPageNav {
  id: string;
  title: string;
}

const Navigation = ({ isOpen }: NavigationProps) => {
  const { user } = useAuth();
  const [customPages, setCustomPages] = useState<CustomPageNav[]>([]);

  useEffect(() => {
    if (user?.id) {
      supabase
        .from('custom_pages')
        .select('id, title')
        .eq('user_id', user.id)
        .order('position', { ascending: true })
        .then(({ data, error }) => {
          if (!error) {
            setCustomPages(data || []);
          } else {
            console.error('Error fetching custom pages:', error);
          }
        });
    }
  }, [user]);

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Briefcase, label: 'Projects', href: '/projects' },
    { icon: BookOpen, label: 'Publications', href: '/publications' },
    { icon: FileText, label: 'Custom Pages', href: '/custom-pages' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const handleLinkClick = () => {
    // Logic to close the menu
    const closeMenuEvent = new Event('closeMenu');
    window.dispatchEvent(closeMenuEvent);
  };

  // Simple slugify function: replace spaces with hyphens and convert to lowercase
  const slugify = (str: string) => {
    return str.trim().replace(/\s+/g, '-').toLowerCase();
  };

  return (
    <nav
      className={`${
        isOpen ? 'block' : 'hidden'
      } md:block w-64 bg-[rgb(var(--color-bg-secondary))] shadow-sm rounded-lg h-fit border border-[rgb(var(--color-border-primary))] transform transition-transform duration-300`}
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
                      ? 'bg-[rgb(var(--color-primary-900))] text-[rgb(var(--color-primary-400))]'
                      : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
          {customPages.length > 0 && (
            <li>
              <p className="px-4 py-2 text-sm font-bold text-[rgb(var(--color-text-primary))]">
                Custom Pages
              </p>
              <ul className="space-y-1">
                {customPages.map((page) => (
                  <li key={page.id}>
                    <NavLink
                      // Use the slugified title as the route parameter
                      to={`/custom-pages/${slugify(page.title)}`}
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-6 py-2 rounded-md hover:bg-[rgb(var(--color-bg-tertiary))] ${
                          isActive
                            ? 'bg-[rgb(var(--color-primary-900))] text-[rgb(var(--color-primary-400))]'
                            : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                        }`
                      }
                    >
                      <FileText className="h-5 w-5" />
                      <span>{page.title}</span>
                    </NavLink>
                  </li>
                ))}
                {/* Optionally, include an "Add New Page" link here */}
                {/* 
                <li>
                  <NavLink
                    to="/custom-pages"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-6 py-2 rounded-md hover:bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add New Page</span>
                  </NavLink>
                </li>
                */}
              </ul>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;

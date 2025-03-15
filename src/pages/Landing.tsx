import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, Sparkles, BookOpen, Palette, Lock } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {/* Navigation */}
      <div className="fixed top-0 inset-x-0 z-50 bg-[rgb(var(--color-bg-primary))] bg-opacity-80 backdrop-blur-lg border-b border-[rgb(var(--color-border-primary))]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-[rgb(var(--color-primary-400))]" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-[rgb(var(--color-primary-400))] to-[rgb(var(--color-primary-300))] text-transparent bg-clip-text">
                My PhD Website
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/demo"
                className="text-[rgb(var(--color-text-primary))] hover:text-[rgb(var(--color-primary-400))] transition-colors"
              >
                View Demo
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all
                  bg-[rgb(var(--color-primary-400))] hover:bg-[rgb(var(--color-primary-500))] 
                  text-white shadow-lg shadow-[rgb(var(--color-primary-900))] hover:shadow-[rgb(var(--color-primary-900))] hover:shadow-xl
                  hover:scale-105 active:scale-95"
              >
                Launch App
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1>
                <span className="block text-base font-semibold text-[rgb(var(--color-primary-400))]">
                  MyPhD Site
                </span>
                <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                  <span className="block text-[rgb(var(--color-text-primary))]">Your Academic</span>
                  <span className="block text-[rgb(var(--color-primary-400))]">Presence Online</span>
                </span>
              </h1>
              <p className="mt-3 text-base text-[rgb(var(--color-text-secondary))] sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Effortlessly create a professional personal website to showcase your projects, publications, and profile.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left">
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 rounded-lg text-base font-medium transition-all
                    bg-[rgb(var(--color-primary-400))] hover:bg-[rgb(var(--color-primary-500))] 
                    text-white shadow-lg shadow-[rgb(var(--color-primary-900))] hover:shadow-[rgb(var(--color-primary-900))] hover:shadow-xl
                    hover:scale-105 active:scale-95"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6">
              <div className="bg-[rgb(var(--color-bg-secondary))] sm:max-w-md sm:w-full sm:mx-auto sm:rounded-lg sm:overflow-hidden">
                <div className="px-4 py-8 sm:px-10">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[rgb(var(--color-border-primary))]" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))]">
                        Preview
                      </span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="space-y-6">
                      <div className="h-2 bg-[rgb(var(--color-bg-tertiary))] rounded w-3/4" />
                      <div className="h-2 bg-[rgb(var(--color-bg-tertiary))] rounded" />
                      <div className="h-2 bg-[rgb(var(--color-bg-tertiary))] rounded w-5/6" />
                    </div>
                  </div>
                </div>
                <div className="px-4 py-6 bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] sm:px-10">
                  <div className="flex items-center space-x-3">
                    <div className="h-6 w-6 bg-[rgb(var(--color-primary-400))] rounded-full" />
                    <div className="h-2 bg-[rgb(var(--color-bg-secondary))] rounded w-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
          <h2 className="text-base font-semibold uppercase tracking-wider text-[rgb(var(--color-primary-400))]">
            Everything you need
          </h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-[rgb(var(--color-text-primary))] sm:text-4xl">
            Built for Academics
          </p>
          <p className="mx-auto mt-5 max-w-prose text-xl text-[rgb(var(--color-text-secondary))]">
            Create a professional academic website with all the features you need to showcase your work.
          </p>
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root rounded-lg bg-[rgb(var(--color-bg-secondary))] px-6 pb-8 border border-[rgb(var(--color-border-primary))]">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center rounded-md bg-[rgb(var(--color-primary-400))] p-3 shadow-lg">
                        <Sparkles className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-[rgb(var(--color-text-primary))]">
                    Integration with Google Scholar
                    </h3>
                    <p className="mt-5 text-base text-[rgb(var(--color-text-secondary))]">
                    Automatically import and display your publications, ensuring your website stays current with your latest research.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root rounded-lg bg-[rgb(var(--color-bg-secondary))] px-6 pb-8 border border-[rgb(var(--color-border-primary))]">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center rounded-md bg-[rgb(var(--color-primary-400))] p-3 shadow-lg">
                        <BookOpen className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-[rgb(var(--color-text-primary))]">
                    Customizable Design
                    </h3>
                    <p className="mt-5 text-base text-[rgb(var(--color-text-secondary))]">
                    Choose from a variety of color schemes and layouts to reflect your personal brand and aesthetic preferences.​
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root rounded-lg bg-[rgb(var(--color-bg-secondary))] px-6 pb-8 border border-[rgb(var(--color-border-primary))]">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center rounded-md bg-[rgb(var(--color-primary-400))] p-3 shadow-lg">
                        <Palette className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-[rgb(var(--color-text-primary))]">
                    Professional Presentation
                    </h3>
                    <p className="mt-5 text-base text-[rgb(var(--color-text-secondary))]">
                    Highlight your academic achievements, projects, and publications in a clean, organized, and visually appealing manner.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-lg bg-[rgb(var(--color-primary-900))] shadow-xl lg:grid lg:grid-cols-2 lg:gap-4">
            <div className="px-6 pt-10 pb-12 sm:px-16 sm:pt-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
              <div className="lg:self-center">
                <h2 className="text-3xl font-extrabold text-[rgb(var(--color-text-primary))] sm:text-4xl">
                  <span className="block">Ready to dive in?</span>
                  <span className="block text-[rgb(var(--color-primary-400))]">
                    Build your website in a few clicks, for free, today.
                  </span>
                </h2>
                <p className="mt-4 text-lg leading-6 text-[rgb(var(--color-text-secondary))]">
                  Join thousands of academics who have already created their professional online presence.
                </p>
                <Link
                  to="/login"
                  className="mt-8 inline-flex items-center px-6 py-3 rounded-lg text-base font-medium transition-all
                    bg-[rgb(var(--color-primary-400))] hover:bg-[rgb(var(--color-primary-500))] 
                    text-white shadow-lg shadow-[rgb(var(--color-primary-900))] hover:shadow-[rgb(var(--color-primary-900))] hover:shadow-xl
                    hover:scale-105 active:scale-95"
                >
                  Get started for free
                </Link>
              </div>
            </div>
            <div className="aspect-w-5 aspect-h-3 -mt-6 md:aspect-w-2 md:aspect-h-1">
              <div className="translate-x-6 translate-y-6 transform rounded-md object-cover object-left-top sm:translate-x-16 lg:translate-y-20">
                <div className="flex items-center justify-center h-full">
                  <GraduationCap className="h-24 w-24 text-[rgb(var(--color-primary-400))]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
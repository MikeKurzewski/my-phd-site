import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Palette, Lock, ArrowRight, Check } from 'lucide-react';

export default function Landing() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-200 to-indigo-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Your Academic Journey, Presented Beautifully
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Effortlessly build a professional website to showcase your research, projects, and publications. Designed for PhD Candidates—no coding skills required.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                to="/login"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get Started for Free
              </Link>
              <a href="#features" className="text-sm font-semibold leading-6 text-gray-900">
                Explore Features <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <img
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="App screenshot"
                className="w-[76rem] rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Why Choose Us?</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to showcase your work
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {[
              {
                name: 'Effortless Personal Websites',
                description: 'Just fill out your profile, and we\'ll handle the rest—your website is ready in minutes!',
                icon: Sparkles,
              },
              {
                name: 'Tailored for Academics',
                description: 'Highlight your research, projects, and publications with sections designed specifically for PhD candidates.',
                icon: BookOpen,
              },
              {
                name: 'Customizable & Professional',
                description: 'Choose from beautiful, modern templates to match your style. Add a custom domain to make it truly yours.',
                icon: Palette,
              },
            ].map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24 sm:pt-48">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Affordable Plans for Every Academic
            </p>
          </div>
          <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {[
              {
                name: 'Free',
                id: 'free',
                price: '$0',
                description: 'Perfect to get started!',
                features: [
                  'Subdomain hosting',
                  'Basic templates',
                  'Up to 3 projects',
                  'Up to 3 publications',
                ],
              },
              {
                name: 'Pro',
                id: 'pro',
                price: '$9',
                description: 'Most Popular',
                features: [
                  'Custom domain support',
                  'Unlimited projects',
                  'Unlimited publications',
                  'Advanced analytics',
                  'Priority support',
                ],
              },
              {
                name: 'Team',
                id: 'team',
                price: '$25',
                description: 'For labs or research groups',
                features: [
                  'Everything in Pro',
                  'Team profiles',
                  'Shared projects',
                  'Collaboration tools',
                  'Admin dashboard',
                ],
              },
            ].map((tier) => (
              <div
                key={tier.id}
                className="rounded-3xl p-8 ring-1 ring-gray-200 xl:p-10"
              >
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg font-semibold leading-8 text-gray-900">{tier.name}</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">{tier.price}</span>
                  {tier.id !== 'free' && <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>}
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/login"
                  className="mt-8 block rounded-md bg-indigo-600 px-3.5 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900" aria-labelledby="footer-heading">
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8">
              <h3 className="text-sm font-semibold leading-6 text-white">PhD Website Builder</h3>
              <p className="text-sm leading-6 text-gray-300">
                Making academic websites beautiful and professional.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold leading-6 text-white">Product</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li>
                      <a href="#features" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Features
                      </a>
                    </li>
                    <li>
                      <Link to="/login" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Get Started
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm font-semibold leading-6 text-white">Support</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li>
                      <a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Contact
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
            <p className="text-xs leading-5 text-gray-400">
              &copy; {new Date().getFullYear()} PhD Website Builder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
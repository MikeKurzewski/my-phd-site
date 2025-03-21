import React from 'react';

interface BasicSectionLayoutProps {
  title: string;
  content: string;
}

const BasicSectionLayout: React.FC<BasicSectionLayoutProps> = ({ title, content }) => {
  return (
    <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))] mb-8">
      <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-4">{title}</h2>
      <div
        className="text-[rgb(var(--color-text-secondary))]"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default BasicSectionLayout;
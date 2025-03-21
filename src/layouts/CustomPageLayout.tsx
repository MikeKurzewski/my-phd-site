import React from 'react';
import BasicSectionLayout from '../components/BasicSectionLayout';

interface CustomSection {
  id: string;
  section_title: string;
  content: string;
  section_type: string;
}

interface CustomPageLayoutProps {
  title: string;
  sections: CustomSection[];
}

const CustomPageLayout: React.FC<CustomPageLayoutProps> = ({ title, sections }) => {
  return (
    <div>
      {sections.map((section) => {
        switch (section.section_type) {
          case 'basic':
          default:
            return (
              <BasicSectionLayout
                key={section.id}
                title={section.section_title}
                content={section.content}
              />
            );
        }
      })}
    </div>
  );
};

export default CustomPageLayout;
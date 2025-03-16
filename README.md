# Development Roadmap

## High Priority (Core UX Improvements)
1. **Authentication Enhancements**
   - [x] Add confirm password field + show/hide toggle
   - [x] Password validation rules
   - [x] Error message improvements

2. **Modal & Interaction Fixes**
   - [ ] Close modals on outside click
   - [ ] Fix preprint button colors
   - [ ] Align add project/publication button colors

3. **Theme Improvements**
   - [ ] Fix minimal theme contrast ratios
   - [ ] Audit button/text contrast across themes
   - [ ] Ensure dark theme text meets WCAG AA

4. **Publication Management**
   - [ ] Add "Delete All" button with confirmation
   - [ ] Bulk selection functionality
   - [ ] Export CSV capability

## Medium Priority (Key Feature Polish)
5. **Dashboard Improvements**
   - [ ] Add stats cards framework
   - [ ] Implement dummy data/loading states
   - [ ] Add chart.js integration for trends

6. **Project Enhancements**
   - [ ] Create project detail page routing
   - [ ] Improve image grid styling
   - [ ] Add hover/focus states
   - [ ] Responsive image handling

## Lower Priority (Nice-to-Haves)
7. **Demo Project Polish**
   - [ ] Curate sample content
   - [ ] Add onboarding tooltips
   - [ ] Create exportable demo state

8. **Social Logins**
   - [ ] Google OAuth integration
   - [ ] LinkedIn profile parsing
   - [ ] Account linking UI

9. **Layout Audits**
   - [ ] Mobile-first responsive fixes
   - [ ] Tablet breakpoint optimization
   - [ ] Touch target sizing checks

## Implementation Order Rationale:
1. Start with authentication fixes - critical for first impressions
2. Fix visual bugs hurting current UX
3. Strengthen theme foundations before adding features
4. Core content management features next
5. Build on stable base for dashboard/projects
6. Leave demo/social for last as they depend on core being solid

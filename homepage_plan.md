# Eventy360 Homepage Design Plan (Revised)

## Executive Summary

This document outlines the UI/UX design strategy for the Eventy360 homepage. The revised approach focuses on a clean, modern, visually striking single-page design with a reactive navigation system that adapts to user authentication state. The design emphasizes contemporary aesthetics, fluid animations, accessibility, responsiveness, and cultural relevance for the Algerian academic community. The goal is to create a homepage that stands out with a premium, cutting-edge look that elevates the platform above typical academic websites.

## Design Principles

- **Bold & Contemporary**: Utilize modern design trends with vibrant visuals, thoughtful negative space, and dynamic elements
- **User-Centric**: Clear pathways for researchers and organizers with targeted content
- **Visual Hierarchy**: Guide users' attention through carefully designed information flow with sophisticated visual cues
- **Responsive & Accessible**: Full device compatibility and WCAG 2.1 AA compliance with fluid transitions between screen sizes
- **Cultural Sensitivity**: RTL support with proper spacing and typography and professional academic translations for Arabic
- **Performance-Optimized**: Fast loading with minimal CLS (Cumulative Layout Shift)
- **Motion & Life**: Strategic animations and micro-interactions that add delight without overwhelming users
- **Elevated Academic Design**: Transcend traditional academic website aesthetics with a design that feels contemporary and professional

## Color Palette & Typography

### Primary Colors

- **Primary Blue**: #0D47A1 (Light theme) / #90CAF9 (Dark theme)
- **Secondary Amber**: #F57C00 (Light theme) / #FFD54F (Dark theme)
- **Background**: #FFFFFF (Light theme) / #121212 (Dark theme)
- **Foreground**: #212121 (Light theme) / #F5F5F5 (Dark theme)

### Accent Colors

- **Success**: #388E3C (Light) / #81C784 (Dark)
- **Info**: #0288D1 (Light) / #81D4FA (Dark)
- **Warning**: #E65100 (Light) / #FFB74D (Dark)
- **Error**: #D32F2F (Light) / #E57373 (Dark)

### Typography

- **Primary Font**: Inter (Latin) / Noto Kufi Arabic (Arabic)
- **Hierarchy**:
  - Headings: 2.5rem/3rem (40px/48px) for h1, scaling down appropriately
  - Body: 1rem (16px) with 1.5 line height for Latin, 1.6 for Arabic
  - Small Text: 0.875rem (14px) for secondary information

## Key Components

### 1. Reactive Navigation Bar (Single-Page Navigation)

- **Logo**: Positioned on the left (RTL-aware), using image from `public/png/logo.png`
- **Center Links**: Anchor links to sections within the same homepage (e.g., Hero, Features, Pricing, etc.)

#### For Non-Authenticated Users

- **Logo**: Positioned on the left (RTL-aware)
- **Center Links**: Section anchor links to parts of the homepage (Hero, About, Features, Pricing, etc.)
- **Right Actions**:
  - Login button (Primary color)
  - Sign Up button (Secondary color, more prominent)
  - Language switcher (Icon-based dropdown with language emoji flags, dynamically loaded, currently only Arabic)
  - Theme toggle (Icon-based Sun/Moon icon)

#### For Authenticated Users

- **Logo**: Positioned on the left (RTL-aware)
- **Center Links**: Section anchor links to parts of the homepage (Hero, Features, Pricing, etc.)
- **Right Actions**:
  - User dropdown (Icon-based):
    - User's name displayed at the top
    - **For Researchers**: Links to Profile, Events, Submissions, Bookmarks, Repository
    - **For Organizers**: Links to Profile, My Events, Create Event, Submissions, Repository
    - Logout option at bottom of dropdown
  - Language switcher (Icon-based dropdown with language emoji flags, dynamically loaded)
  - Theme toggle (Icon-based Sun/Moon icon)

### 2. Hero Section

- **Split-Panel Design**:
  - Left: Platform value proposition with headline, subheadline, and CTA
  - Right: Dynamic illustration/animation of academic event lifecycle
  - Background subtle gradient using primary colors
  - Prominent CTA buttons for both user roles

### 3. User Pathway Section

- **Role Selection Cards**:
  - Two prominent cards (Researcher vs. Organizer)
  - Icon-based feature highlights for each role
  - "Get Started" CTAs leading to role-specific flows
  - Micro-animation on hover (subtle lift effect)

### 4. Feature Highlights

- **Feature Grid**:
  - 6 key platform features with Lucide icons
  - Brief, benefit-focused descriptions
  - Responsive layout (grid to single column)

### 5. Pricing Preview Section

- **Dynamic Pricing Cards**:
  - Pricing data dynamically fetched from Supabase database app_settings record
  - Different options for researchers and organizers
  - Billing periods with Arabic labels retrieved from translation files
  - Discounts dynamically calculated based on app_settings from database
  - Visual indication of savings for longer subscription periods
  - "Subscribe" CTA buttons leading to detailed pricing modal

#### Pricing Structure

- **Researcher Plans**:

  - Base price: Dynamically fetched from app_settings.base_price_researcher_monthly
  - Calculated prices with dynamic discounts from app*settings.discount*\* fields
  - Value-focused messaging highlighting benefits

- **Organizer Plans**:
  - Base price: Dynamically fetched from app_settings.base_price_organizer_monthly
  - Calculated prices with dynamic discounts from app*settings.discount*\* fields
  - Institution-focused benefits highlighted

### 6. Call to Action

- **Final Conversion Section**:
  - Reinforcement of key value proposition
  - Large, prominent CTA buttons for signup
  - Background that contrasts with above sections

### 7. Footer

- **Minimal Information**:
  - Copyright information
  - Terms of Service & Privacy Policy links
  - Contact link

## Reference Data Types

The homepage will reference these categorizations:

### Billing Periods

- Retrieved from translation files using `useTranslations` hook
- No hardcoded values - all billing periods and translations dynamically loaded from locale files

### Institution Types

- Retrieved from translation files using `useTranslations` hook
- No hardcoded values - all institution types and translations dynamically loaded from locale files

### Event Types

- Retrieved from translation files using `useTranslations` hook
- No hardcoded values - all event types and translations dynamically loaded from locale files

## Standardized Hooks Integration

### Authentication and User Profile

The homepage will leverage these standardized hooks:

1. **`useAuth`**

   - Purpose: Provides authentication state and Supabase client access
   - Usage: Determine if user is logged in, handle authentication operations
   - Implementation areas: Reactive navigation, conditional rendering, auth-protected actions

2. **`useUserProfile`**

   - Purpose: Access user profile data including user type (researcher/organizer/admin)
   - Usage: Render role-specific navigation and content
   - Implementation areas: User dropdown, role-specific navigation items

3. **`useTranslations`**

   - Purpose: Access translation strings for internationalization
   - Usage: All text content throughout the homepage
   - Implementation areas: Navigation labels, hero content, feature descriptions, CTAs

4. **`useLocale`**

   - Purpose: Access current locale for language-aware formatting
   - Usage: RTL/LTR layout detection, date/number formatting
   - Implementation areas: Layout direction, language switcher, locale-specific formatting

5. **`useSubscription`**
   - Purpose: Access subscription data and pricing information
   - Usage: Display pricing information and subscription status
   - Implementation areas: Pricing preview section, subscription-based feature access

### Hook Integration Strategy

- **Authentication Flow**:

  - Use `useAuth` to detect authentication state
  - Show login/signup buttons for unauthenticated users
  - Display user dropdown for authenticated users

- **Role-Based UI**:

  - Use `useUserProfile` to access user type
  - Render different dropdown options based on role (researcher vs. organizer)
  - Adjust CTAs and content emphasis based on user role

- **Internationalization**:

  - Use `useTranslations` for all text content
  - Organize translations in namespaces (Navigation, Hero, Features, etc.)
  - Support contextual translations for different user roles

- **Locale Awareness**:

  - Use `useLocale` to detect current language
  - Apply RTL layout for Arabic
  - Set appropriate typography rules based on locale
  - Language dropdown to show emoji flags with language names, dynamically loaded from locale files

- **Dynamic Pricing**:
  - Use app_settings record from Supabase database to access current pricing parameters
  - Use locale translations from translation files for billing period labels
  - Use actual record fields for calculations:
    - Monthly: app*settings.base_price*\*\_monthly
    - Quarterly: base_price × 3 × (1-app_settings.discount_quarterly)
    - Biannual: base_price × 6 × (1-app_settings.discount_biannual)
    - Annual: base_price × 12 × (1-app_settings.discount_annual)
  - Display prices in DZD with appropriate formatting
  - Provide visual comparison between different subscription periods

## Micro-interactions & Visual Appeal

1. **Navigation Hover/Focus**:

   - Subtle underline animation (0.2s duration)
   - Color transition on hover (0.15s duration)
   - Subtle lift effect with shadow increase

2. **Button Interactions**:

   - Scale effect (1.03x) on hover
   - Color darkening/brightening on hover
   - Ripple effect on click
   - Custom focus state animations

3. **Dropdown Interactions**:

   - Smooth reveal animation (0.2s)
   - Subtle shadow increase on open
   - Fade transition for menu items
   - Staggered entrance animations for dropdown items

4. **Theme Toggle Animation**:

   - Smooth rotation/morphing between sun and moon icons
   - Color transition for the entire UI (0.3s duration)
   - Particle effects on theme change

5. **Language Switcher**:

   - Icon-based dropdown with emoji flags
   - Subtle hover effect
   - Feedback animation on selection
   - Globe rotation animation

6. **Pricing Card Interactions**:
   - Subtle elevation on hover with dynamic shadow
   - Highlight effect for recommended plan with subtle pulse
   - Visual feedback on plan selection
   - Animated price transitions when changing period

7. **Scroll-Based Animations**:
   - Reveal animations for content sections as they enter viewport
   - Parallax effects for background elements
   - Smooth scroll behavior for section navigation
   - Progress indicator showing scroll position

8. **Hero Section Dynamics**:
   - Subtle background gradient shifts
   - Floating element animations
   - Interactive illustration that responds to cursor movement
   - Strategic highlights that draw attention to key information

## Modern Visual Elements

- **Glassmorphism**: Subtle frosted glass effects for card backgrounds and overlays
- **Subtle Gradients**: Modern color transitions instead of flat colors where appropriate
- **Depth Layers**: Create visual hierarchy through layering techniques with shadows and overlapping elements
- **Custom Illustrations**: Unique, branded illustrations that convey academic concepts in a modern way
- **Micro-copy**: Thoughtful, conversational text elements that guide and delight
- **Dynamic Backgrounds**: Subtle animated background elements that don't distract from content
- **Custom Icons**: Cohesive icon system with subtle animations
- **High-Quality Imagery**: Professional imagery that elevates the academic focus
- **3D Elements**: Subtle 3D touches to create depth without overwhelming the interface

## RTL Considerations

1. **Navigation Layout**:

   - Logo and primary navigation elements properly positioned based on language direction
   - Dropdown menus open in the correct direction (right-to-left for Arabic)

2. **Typography Adjustments**:

   - Line height: 1.6 for Arabic
   - Letter spacing: 0 for Arabic
   - Appropriate font size adjustments

3. **Icon Directionality**:
   - Directional icons (arrows, back/forward) automatically flipped
   - Proper icon alignment with text

## Responsive Behavior

1. **Navigation Transformations**:

   - Full navbar on desktop
   - Collapsible hamburger menu on tablet/mobile
   - Stacked dropdown menus on mobile
   - Full-width language/theme toggles on mobile menu

2. **Content Adjustments**:
   - Hero: Split panels stack vertically on mobile
   - Features: Grid becomes single column
   - Pricing: Cards stack vertically on mobile
   - Typography scales down proportionally

## Implementation Checklist

### Phase 1: Navigation System

- [x] Create base Navbar component structure
- [x] Integrate logo from `public/png/logo.png`
- [x] Set up anchor links to homepage sections (not separate pages)
- [x] Integrate `useAuth` hook for authentication state
- [x] Implement conditional rendering based on authentication state
- [x] Integrate `useUserProfile` for role-specific menu items
- [x] Build icon-based ThemeToggle component with animation
- [x] Develop icon-based LanguageSwitcher with emoji flags using `useLocale`
- [x] Create icon-based UserDropdown showing name and role-specific links
- [x] Apply translations using `useTranslations`
- [x] Ensure proper RTL support for all navigation elements

### Phase 2: Homepage Content

- [x] Implement hero section with role-based CTAs
- [x] Build role selector component with interactive cards
- [x] Develop feature grid with Lucide icons
- [x] Create pricing preview section with dynamic calculations
- [x] Create final CTA section
- [x] Design minimal footer
- [x] Apply translations to all content sections

### Phase 3: Interactivity & Refinement

- [x] Add authentication flow integration with `useAuth`
- [x] Implement micro-interactions and hover effects
- [x] Apply theme switching functionality
- [x] Optimize component styling for both LTR and RTL
- [x] Implement dynamic pricing calculations from app_settings

### Phase 4: Testing & Optimization

- [x] Test navigation behavior in all authentication states
- [x] Verify theme switching works correctly
- [x] Validate RTL implementation in Arabic
- [x] Test pricing calculations and display
- [ ] Ensure proper keyboard accessibility (See homepage-completion-plan.md)
- [ ] Optimize performance (Lighthouse scoring) (See homepage-completion-plan.md)

## Technical Implementation Notes

### Authentication Integration

- Use the `useAuth` hook to determine authentication state
- Access user profile information through `useUserProfile` to determine role (researcher/organizer)
- Handle authentication state changes reactively

### Language Switching

- Implement with `useLocale` and `useTranslations` hooks
- Icon-based dropdown with emoji flags for languages
- Support Arabic (ar) only for now, with infrastructure for adding more languages later
- Languages dynamically loaded from locale files

### User Dropdown Implementation

- Icon-based dropdown with the user's name displayed at the top
- Different navigation links based on user type (researcher/organizer)
- Logout option at the bottom of the dropdown

### Dynamic Pricing Implementation

- Fetch app_settings record from Supabase database to access current pricing parameters
- Retrieve billing period labels from translation files using `useTranslations` hook
- Use actual record fields for calculations:
  - Monthly: app*settings.base_price*\*\_monthly
  - Quarterly: base_price × 3 × (1-app_settings.discount_quarterly)
  - Biannual: base_price × 6 × (1-app_settings.discount_biannual)
  - Annual: base_price × 12 × (1-app_settings.discount_annual)
- Display prices in DZD with appropriate formatting
- Provide visual comparison between different subscription periods

### Theme Toggling

- Icon-based theme toggle (Sun/Moon)
- Leverage existing ThemeProvider for state management
- Ensure smooth transitions between light and dark themes
- Persist theme preference in localStorage

## Technology Stack

- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS with Flowbite components
- **Icons**: Lucide React
- **Animations**: CSS transitions/keyframes
- **Internationalization**: next-intl via standardized hooks
- **State Management**: React hooks + context (existing AuthProvider)
- **Data Fetching**: Supabase client via `useAuth`

## Conclusion

This revised design plan provides a focused approach to implementing the Eventy360 homepage as a single-page design with section anchor links in the navigation. The reactive navigation system adapts to user authentication state and uses icon-based UI elements for the theme toggle, language switcher, and user dropdown. By leveraging the project's standardized hooks and implementing modern, aesthetically pleasing design elements, the implementation will create a visually stunning, contemporary experience that stands apart from traditional academic websites while maintaining consistency with the rest of the application.

The implementation will prioritize beautiful animations, thoughtful interactions, and elevated visual design to create a homepage that feels premium, modern, and engaging—setting a new standard for academic platform interfaces while ensuring a seamless user experience.

The implementation checklist provides a clear roadmap for building the homepage in logical phases, ensuring that all requirements are addressed systematically.

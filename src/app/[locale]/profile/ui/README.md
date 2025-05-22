# Profile UI Components: Standardized UI System

This folder contains standardized UI components for the profile section of Eventy360. These components provide consistent styling, proper RTL support, and a cohesive look-and-feel across all profile pages.

## Key Components

### ProfilePageHeader

A reusable header component for profile pages with standardized styling, icon support, and RTL awareness.

```tsx
import ProfilePageHeader from '../ui/ProfilePageHeader';

// Basic usage
<ProfilePageHeader 
  title="Edit Profile" 
  iconName="user"
  locale={locale} 
/>

// Custom colors
<ProfilePageHeader 
  title="Verification" 
  iconName="shield"
  iconBgColor="bg-indigo-100 dark:bg-indigo-900"
  iconTextColor="text-indigo-600 dark:text-indigo-300"
  locale={locale} 
/>
```

Available icon names:
- `home` - Dashboard icon
- `user` - User profile icon
- `document` - Documents/submissions icon 
- `shield` - Verification/security icon
- `creditCard` - Payments/subscriptions icon
- `lock` - Security/password icon
- `id` - Identity/profile icon
- `documentText` - Text documents/forms icon

### ProfileCard

A standardized card component with consistent styling, padding, and RTL support.

```tsx
import ProfileCard from '../ui/ProfileCard';

// Basic usage
<ProfileCard locale={locale}>
  <p>Card content goes here</p>
</ProfileCard>

// With title and icon
<ProfileCard 
  title="Change Password" 
  iconName="lock"
  iconBgColor="bg-blue-100 dark:bg-blue-900"
  iconTextColor="text-blue-600 dark:text-blue-300"
  locale={locale}
>
  <p>Card content here</p>
</ProfileCard>
```

## UI Guidelines for Profile Pages

### Page Structure

All profile pages should follow this general structure for consistency:

```tsx
function ProfileFeaturePage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  
  return (
    <div className="space-y-6">
      {/* Standard page header */}
      <ProfilePageHeader
        title="Feature Name"
        iconName="featureIcon"
        locale={locale}
      />
      
      {/* Content cards */}
      <div className="grid grid-cols-1 gap-6">
        <ProfileCard 
          title="Section Title" 
          iconName="lock"
          iconBgColor="bg-blue-100 dark:bg-blue-900"
          iconTextColor="text-blue-600 dark:text-blue-300"
          locale={locale}
        >
          {/* Section content */}
        </ProfileCard>
      </div>
    </div>
  );
}
```

### Styling Guidelines

- **Shadows**: Use `shadow-sm` for all cards
- **Padding**: Use `p-4 md:p-5` for responsive padding
- **Colors**: 
  - Use semantic colors: blue for general UI, green for success/active, red for errors, yellow for warnings
  - Match icon background colors to their purpose

### RTL Support

All UI components should properly handle Right-to-Left (RTL) languages:

- Use string-based icons in headers to avoid server/client component issues
- The `ProfilePageHeader` and `ProfileCard` components handle RTL automatically when provided the `locale` prop
- For custom layouts within cards, use the `isRtl` variable (`locale === 'ar'`) to conditionally apply styles
- Use classes like `flex-row-reverse` for RTL layouts
- Switch `mr-` to `ml-` for RTL layouts
- Use `text-right` for text alignment in RTL

### Icon Usage

We primarily use Heroicons (react-icons/hi) for consistency. Follow these guidelines:

- Page headers: Use string-based icon names with `ProfilePageHeader` component
- Card titles: Use string-based icon names with `ProfileCard` component
- Interface elements: Use 16x16px icons (h-4 w-4)
- Match icon colors to their context (e.g., green for success actions)

## Example Code

For more examples, refer to existing pages:
- Profile Dashboard: `src/app/[locale]/profile/page.tsx`
- Edit Profile: `src/app/[locale]/profile/edit/page.tsx`
- Verification: `src/app/[locale]/profile/verification/page.tsx`
- Subscriptions: `src/app/[locale]/profile/subscriptions/page.tsx`
- Security: `src/app/[locale]/profile/security/page.tsx`
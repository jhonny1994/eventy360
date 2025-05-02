# Development Guidelines for Eventy360

## Project Overview

- Eventy360 is an academic event management and research discovery platform for Algeria
- Primary features include event discovery, submissions management, verification systems, and research repository
- Must support three languages: Arabic (RTL), French, and English
- Three distinct user types: Researchers, Organizers, and Administrators
- Three subscription tiers: free_researcher, paid_researcher, paid_organizer
- Current focus on offline payments with future online payment integration
- Focus on Algeria-specific context with international expansion planned

## Project Architecture

### Directory Structure

- `/app` - Next.js App Router pages and layouts
  - `/app/[locale]` - Multilingual routes for each language (ar, fr, en)
  - `/app/api` - API routes for client components
  - `/app/actions` - Server actions for data mutations
- `/components` - React components organized by feature
  - `/components/common` - Reusable UI components
  - `/components/[feature]` - Feature-specific components
- `/lib` - Utility functions and shared logic
  - `/lib/validations` - Zod validation schemas
  - `/lib/supabase` - Supabase client and helpers
  - `/lib/utils` - General utility functions
- `/types` - TypeScript type definitions
- `/public` - Static assets
- `/messages` - Internationalization message files

### Component Organization

- Server Components must be used by default
- Client Components (with "use client" directive) only when necessary
- Feature folders must contain index.ts barrel exports
- Layout components must be kept separate from page content
- Shared components must be placed in `/components/common`

## Coding Standards

### Naming Conventions

- **MUST** use PascalCase for React components: `EventCard.tsx`, `SubmissionForm.tsx`
- **MUST** use camelCase for functions, variables, and file names (except components)
- **MUST** use kebab-case for CSS class names with Tailwind
- **MUST** use UPPER_SNAKE_CASE for constants
- **MUST** prefix interfaces with `I` and types with `T`: `IUser`, `TSubmissionStatus`
- **MUST** use prefix `use` for custom hooks: `useEventData`, `useSubmissionStatus`
- **MUST** use `page.tsx` suffix for Next.js App Router pages
- **MUST** use `layout.tsx` for layout components in the App Router

### File Organization

- **MUST** group files by feature rather than type
- **MUST** place reusable components in `components/common`
- **MUST** put feature-specific components in feature-specific folders
- **MUST** keep pages clean by moving logic to hooks and components
- **MUST** use barrel exports (index.ts) to simplify imports
- **MUST** place server actions in `/app/actions` directory
- **MUST** keep validation schemas in `/lib/validations` directory
- **MUST** store types and interfaces in `/types` directory

### Code Style

- **MUST** use functional components with hooks over class components
- **MUST** use TypeScript for all new code
- **MUST** destructure props at the beginning of components
- **MUST** add explicit return types to functions
- **MUST** use async/await for asynchronous operations
- **MUST** prefer named exports over default exports
- **MUST** organize imports in groups separated by blank lines:
  1. React and Next.js imports
  2. Third-party library imports
  3. Project imports

### Database Operations

- **MUST** use Row Level Security (RLS) policies for access control
- **MUST** create helper functions for common database operations
- **MUST** implement soft deletes using the `deleted_at` timestamp pattern
- **MUST** use PostgreSQL enums for predefined values
- **MUST** document relationships between tables in comments
- **MUST** use appropriate indexes for frequently queried columns

## Feature Implementation Standards

### User Management

- **MUST** implement separate profile types based on `user_type_enum`
- **MUST** create default subscription on user registration
- **MUST** use verification flow for researcher and organizer credentials
- **MUST** enforce subscription tier feature access restrictions

#### Example: Creating a new user
```typescript
// DO THIS
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      user_type: 'researcher', // Use enum values
      preferred_language: 'en' // Use enum values
    }
  }
});

// Then create profile in a separate call or via database trigger
```

### Event Management

- **MUST** enforce limit of 5 active events per organizer
- **MUST** implement status flow: published → active → completed
- **MUST** associate events with topics for discoverability
- **MUST** implement multilingual event information
- **MUST** validate all date fields to ensure chronological order

#### Example: Event Status Check
```typescript
// DO THIS
if (event.status === 'published' && new Date() >= new Date(event.event_date)) {
  // Update status to active
}

// DON'T DO THIS
if (event.status === 'published' && Date.now() > event.event_date) {
  // Incorrect date comparison
}
```

### Submission System

- **MUST** implement status flow: received → under_review → accepted/rejected
- **MUST** trigger email notifications on status changes
- **MUST** validate file uploads for type and size restrictions
- **MUST** store submissions in the correct storage bucket

#### Example: Submission Status Change
```typescript
// DO THIS
const { data, error } = await supabase
  .from('submissions')
  .update({ 
    status: 'under_review',
    updated_at: new Date().toISOString()
  })
  .eq('id', submissionId)
  .select();

// Then trigger notification in a separate call or via database trigger
```

### Internationalization

- **MUST** use next-intl for all user-facing text
- **MUST** implement RTL layout support for Arabic
- **MUST** organize translations by feature in message files
- **MUST** use locale-specific formatting for dates, numbers, and currency

#### Example: Using Translations
```tsx
// DO THIS
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations('EventPage');
  return <h1>{t('title')}</h1>;
}

// DON'T DO THIS
export default function Component() {
  return <h1>Event Details</h1>; // Hardcoded text
}
```

## Framework and Library Usage Standards

### Next.js

- **MUST** use App Router for all new routes
- **MUST** implement language routes with `/app/[locale]` pattern
- **MUST** use Server Components by default
- **MUST** use Client Components only when necessary
- **MUST** use server actions for data mutations
- **MUST** implement proper error handling and loading states
- **MUST** use the new data fetching methods with `fetch` and cache options
- **MUST** use appropriate cache strategies (`force-cache`, `no-store`, or `revalidate`)
- **MUST** use dynamic metadata generation for SEO

### Supabase

- **MUST** use separate clients for server and client components
- **MUST** implement Row Level Security (RLS) policies for all tables
- **MUST** use storage buckets with appropriate access rules
- **MUST** use Edge Functions for serverless operations
- **MUST** implement Realtime subscriptions for live updates where required
- **MUST** use the latest Supabase JS client patterns for authentication and database operations
- **MUST** use the new error handling pattern returning data and error

#### Example: Supabase Client Usage
```typescript
// Server Component (DO THIS)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function ServerComponent() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.from('events').select('*');
  return <div>{/* render data */}</div>;
}

// Client Component (DO THIS)
'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ClientComponent() {
  const supabase = createClientComponentClient();
  // use supabase client
}

// Authentication (DO THIS)
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      user_type: 'researcher',
      preferred_language: 'en'
    }
  }
});

// Error handling (DO THIS)
const { data, error } = await supabase.from('todos').select('*');
if (error) console.log(error);
```

### Internationalization with next-intl

- **MUST** use next-intl for all user-facing text
- **MUST** implement RTL layout support for Arabic
- **MUST** organize translations by feature in message files
- **MUST** use locale-specific formatting for dates, numbers, and currency
- **MUST** set up middleware using `createMiddleware` for locale detection
- **MUST** use `NextIntlClientProvider` in root layout
- **MUST** use `setRequestLocale` to enable static rendering
- **MUST** create custom navigation helpers using `createNavigation`
- **MUST** generate localized metadata using `getTranslations`

#### Example: Using Translations
```tsx
// DO THIS - Server Component
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations('EventPage');
  return <h1>{t('title')}</h1>;
}

// DO THIS - Metadata Generation
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({params}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Metadata'});

  return {
    title: t('title')
  };
}

// DO THIS - Language Switching
'use client';
import { usePathname, useRouter } from '@/i18n/navigation';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  
  const switchLanguage = (locale) => {
    router.replace(pathname, {locale});
  };
}

// DON'T DO THIS
export default function Component() {
  return <h1>Event Details</h1>; // Hardcoded text
}
```

### Shadcn UI

- **MUST** use Shadcn UI components for consistent design
- **MUST** customize components in `/components/ui` directory
- **MUST** maintain dark mode compatibility
- **MUST** ensure RTL support for all UI components
- **MUST** use React Hook Form with Shadcn UI form components
- **MUST** implement proper form validation using Zod resolvers
- **MUST** use the `cn` utility for conditional class names
- **MUST** configure CSS variables for theming in globals.css

#### Example: Form Implementation with Shadcn UI
```tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})

export function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Submit form
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

## Workflow Standards

### User Registration Flow

1. User registers with email/password
2. Base profile created with user type
3. Role-specific profile created based on user type
4. Default subscription created (free_researcher or trial for others)
5. Welcome email sent

### Event Creation Flow

1. Verify organizer has active subscription
2. Check active event limit (maximum 5)
3. Create event with 'published' status
4. Associate event with selected topics
5. Process event image uploads
6. Publish event notification to interested users

### Submission Flow

1. Verify researcher has active subscription
2. Validate submission data and file uploads
3. Create submission record with 'received' status
4. Store files in the submission_files bucket
5. Send confirmation email to researcher
6. Notify event organizers of new submission

### Payment Verification Flow

1. User uploads payment proof
2. Generate unique payment reference
3. Admin reviews payment proof
4. If approved, update payment status to 'verified'
5. Update subscription status to 'active'
6. Send confirmation email to user

## Key File Interaction Standards

### Multilingual File Dependencies

- **When modifying any user-facing text**:
  - **MUST** update corresponding messages in all language files:
    - `/messages/ar/[feature].json`
    - `/messages/fr/[feature].json`
    - `/messages/en/[feature].json`

### Component Dependencies

- **When creating/modifying a form component**:
  - **MUST** update corresponding validation schema in `/lib/validations/`
  - **MUST** update corresponding server action in `/app/actions/`

### Database Schema Changes

- **When modifying database schema**:
  - **MUST** update corresponding TypeScript types in `/types/`
  - **MUST** update affected RLS policies
  - **MUST** update associated helper functions

### Feature Flags

- **When implementing features behind subscription tiers**:
  - **MUST** update corresponding checks in `/lib/subscriptions/`
  - **MUST** update associated UI components to show/hide based on tier

## AI Decision Standards

### Feature Implementation Priority

1. First, check if the feature affects core user flows (registration, event creation, submission)
2. Then, evaluate if it's tied to a subscription tier feature
3. Next, determine if it impacts multiple user types
4. Finally, assess implementation complexity

### Multilingual Support Decision Tree

- **If modifying user-facing content**:
  - Is it dynamic content from database? → Use locale formatting functions
  - Is it static UI text? → Use next-intl messages
  - Does it contain dates/numbers/currency? → Use locale-specific formatting

### Component Type Decision Tree

- Does component need client-side interactivity? → Client Component
- Does component only display data? → Server Component
- Does component use hooks or browser APIs? → Client Component
- Is component part of static UI? → Server Component

### Error Handling Priority

1. First, handle user input validation errors
2. Then, handle authentication/authorization errors
3. Next, handle database operation errors
4. Finally, handle unexpected system errors

## Prohibitions

- **NEVER** hardcode user-facing text without using next-intl
- **NEVER** use `any` type in TypeScript unless absolutely necessary
- **NEVER** implement direct database queries in client components
- **NEVER** use direct DOM manipulation instead of React patterns
- **NEVER** store sensitive information in client-side state
- **NEVER** bypass RLS policies
- **NEVER** implement features that contradict the subscription tier system
- **NEVER** use default exports for components or functions
- **NEVER** modify database schema without updating TypeScript types
- **NEVER** implement server-side code in client components or vice versa
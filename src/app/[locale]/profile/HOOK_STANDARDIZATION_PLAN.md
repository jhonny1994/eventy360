# Hook Standardization Plan

This document outlines the plan to standardize hook usage across the Eventy360 application.

## Standardized Hooks to Use

- ✅ `useAuth` - For authentication state and Supabase client access
- ✅ `useUserProfile` - For profile data access
- ✅ `useSubscription` - For subscription data and status
- ✅ `useSubscriptionCheck` - For premium feature protection
- ✅ `useTranslations` - For i18n translations
- ✅ `useLocale` - For locale-aware formatting and rendering

## Already Standardized Components

- ✅ `ui/ProfileDataProvider.tsx` - Wrapper for `useUserProfile`
- ✅ `ui/PremiumFeatureGuard.tsx` - Wrapper for `useSubscriptionCheck`
- ✅ `ui/VerificationSection.tsx` - Updated to use standardized useAuth hook instead of createClient
- ✅ `ui/SubscriptionActions.tsx` - Using `useSubscription` hook
- ✅ `ui/TopicSubscriptionsCard.tsx` - Using `PremiumFeatureGuard` and other hooks
- ✅ `ui/README.md` - Documentation for standardized hook patterns

## Components To Standardize

### Profile Core UI Components

- ✅ `ui/EditProfileForm.tsx` - Updated to use standardized useTranslations hook
- ✅ `ui/ProfileSidebarClient.tsx` - Added documentation for proper hook usage
- ✅ `ui/ClientVerificationWrapper.tsx` - Added documentation for hook delegation to VerificationSection
- ✅ `ui/VerifiedBadgeClient.tsx` - Added documentation for presentational component
- ✅ `ui/ProfilePageActions.tsx` - Already using standardized hooks, added documentation
- ✅ `ui/ProfileSidebar.tsx` - Updated to use standardized useAuth hook

### Submissions Section

- ✅ `submissions/ui/ActionButtons.tsx` - Updated to use standardized useTranslations hook
- ✅ `submissions/ui/SubmissionsList.tsx` - Updated to use standardized useTranslations hook
- ✅ `submissions/ui/SubmissionFilters.tsx` - Updated to use standardized useTranslations hook
- ✅ `submissions/ui/NoSubmissions.tsx` - Updated to use standardized useTranslations hook
- ✅ `submissions/ui/FullPaperUploadSection.tsx` - Updated to use standardized useTranslations hook and added documentation
- ✅ `submissions/ui/RevisionUploadSection.tsx` - Updated to use standardized useTranslations hook and added documentation
- ✅ `submissions/ui/SubmissionDetails.tsx` - Updated to use standardized useTranslations and useLocale hooks and added documentation
- ✅ `submissions/create/SubmissionFormWithCheck.tsx` - Already using standardized useSubscriptionCheck hook, added documentation
- ✅ `submissions/[id]/submit-paper/page.tsx` - Only uses server components and standardized client components
- ✅ `submissions/[id]/submit-revision/page.tsx` - Only uses server components and standardized client components

### Events Section

- ✅ `components/events/creation/CreateEventForm.tsx` - Updated to use standardized useAuth, useTranslations hooks
- ✅ `components/events/creation/steps/BasicInfoStep.tsx` - Updated to use standardized useAuth, useTranslations, and useLocale hooks
- ✅ `components/events/creation/steps/ContentDetailsStep.tsx` - Updated to use standardized useTranslations and useLocale hooks
- ✅ `components/events/creation/steps/DatesStep.tsx` - Updated to use standardized useTranslations hook
- ✅ `components/events/creation/steps/TopicSelectionStep.tsx` - Updated to use standardized useAuth, useTranslations, and useLocale hooks
- ✅ `events/[id]/manage/components/EventStatisticsTab.tsx` - Updated to use standardized useAuth and useTranslations hooks
- ✅ `events/[id]/manage/components/charts/MetricsGrid.tsx` - Updated to use standardized useTranslations and useLocale hooks
- ✅ `events/[id]/manage/components/charts/SubmissionStatusChart.tsx` - Updated to use standardized useTranslations and useLocale hooks
- ✅ `events/[id]/manage/components/charts/SubmissionTimelineChart.tsx` - Updated to use standardized useAuth, useTranslations, and useLocale hooks
- ✅ `events/[id]/submissions/EventSubmissionsTable.tsx` - Updated to use standardized useTranslations and useLocale hooks
- ✅ `events/[id]/submissions/[submissionId]/review-abstract/AbstractReviewForm.tsx` - Updated to use standardized useAuth, useTranslations, and useLocale hooks
- ✅ `events/[id]/submissions/[submissionId]/review-abstract/page.tsx` - Uses standardized AbstractReviewComponent
- ✅ `events/[id]/submissions/[submissionId]/review-paper/page.tsx` - Uses standardized FullPaperReviewComponent
- ✅ `events/[id]/submissions/[submissionId]/review-revision/page.tsx` - Uses standardized RevisionReviewComponent
- ✅ `components/events/discovery/EventDiscoveryContainer.tsx` - Updated to use standardized useAuth hook
- ✅ `components/events/discovery/EventFilters.tsx` - Updated to use standardized useAuth hook

### Bookmarks Section

- ✅ `bookmarks/actions.ts` - Checked and confirmed no client-side hooks needed
- ✅ `bookmarks/page.tsx` - Uses standardized hooks for authentication and translations
- ✅ `components/events/discovery/EventCardGrid.tsx` - Updated to use standardized useTranslations and useLocale hooks
- ✅ `components/ui/BookmarkButton.tsx` - Updated to use standardized useTranslations hook

### Topics Section

- ✅ `ui/TopicSubscriptionsCard.tsx` - Already using standardized hooks (useAuth, useTranslations, useLocale)
- ✅ `topics/page.tsx` - Server component using standardized client components
- ✅ `components/ui/TopicSelector.tsx` - Updated to use standardized useAuth hook

### Verification Section

- ✅ `ui/VerificationSection.tsx` - Updated to use standardized useAuth hook instead of createClient
- ✅ `verification/page.tsx` - Server component using standardized client components
- ✅ `components/profile/VerificationDocumentUploader.tsx` - Updated to use standardized useAuth hook

### Subscriptions Section

- ✅ `subscriptions/page.tsx` - Server component using standardized client components
- ✅ `components/payment/PaymentSection.tsx` - Updated to use standardized useTranslations and useLocale hooks
- ✅ `components/payment/PaymentHistoryDisplay.tsx` - Updated to use standardized useAuth, useTranslations, and useLocale hooks
- ✅ `components/payment/ReportPaymentForm.tsx` - Updated to use standardized useTranslations and useLocale hooks
- ✅ `components/payment/PaymentProofUpload.tsx` - Updated to use standardized useAuth, useTranslations, and useLocale hooks

### Security Section

- ✅ `security/page.tsx` - Server component with no client-side components needing standardization

### Admin Section

- ✅ `components/admin/auth/AdminCreateAccountForm.tsx` - Updated to use standardized useAuth hook
- ✅ `components/admin/ui/ApproveRejectActions.tsx` - Updated to use standardized useAuth hook
- ✅ `components/admin/ui/DocumentPreview.tsx` - Updated to use standardized useAuth hook
- ✅ `components/admin/ui/DownloadDocumentButton.tsx` - Updated to use standardized useAuth hook

### Utility Files

- ✅ `utils/admin/auth-forms.ts` - Updated to accept Supabase client as parameter
- ✅ `utils/admin/topics.ts` - Updated to accept Supabase client as parameter

## Implementation Strategy

1. **First Pass**: Update all direct Supabase client creations (`createClient()`) to use `useAuth()`
   ```tsx
   // BEFORE
   const supabase = createClient();
   
   // AFTER
   const { supabase } = useAuth();
   ```

2. **Second Pass**: Replace direct profile data fetching with `useUserProfile` or `ProfileDataProvider`
   ```tsx
   // BEFORE
   const [profile, setProfile] = useState(null);
   useEffect(() => {
     // fetch profile data
   }, []);
   
   // AFTER
   const { profile, loading, error } = useUserProfile();
   // OR
   <ProfileDataProvider>
     {(profile) => (
       /* Component using profile data */
     )}
   </ProfileDataProvider>
   ```

3. **Third Pass**: Apply `PremiumFeatureGuard` to premium features
   ```tsx
   // BEFORE
   const { canAccessPremiumFeature } = useSubscription();
   if (!canAccessPremiumFeature()) {
     return <SubscriptionRequired />;
   }
   
   // AFTER
   <PremiumFeatureGuard>
     {/* Premium feature content */}
   </PremiumFeatureGuard>
   ```

4. **Fourth Pass**: Standardize translations using the custom `useTranslations` hook
   ```tsx
   // BEFORE
   import { useTranslations } from 'next-intl';
   const t = useTranslations('Namespace');
   
   // AFTER
   import useTranslations from '@/hooks/useTranslations';
   const t = useTranslations('Namespace');
   ```

## Testing Approach

1. After updating each component:
   - Check for linting errors
   - Verify component rendering
   - Test functionality with authenticated and unauthenticated states
   - Test with different subscription statuses

2. After completing each section:
   - Test the entire user flow for that feature
   - Verify that premium features are properly protected
   - Check for any regressions

## Progress Tracking

| Section | Total Components | Completed | Progress |
|---------|-----------------|-----------|----------|
| Core UI | 11              | 11        | 100%     |
| Submissions | 10          | 10        | 100%     |
| Events   | 16             | 16        | 100%     |
| Bookmarks | 4             | 4         | 100%     |
| Topics   | 2              | 2         | 100%     |
| Verification | 2          | 2         | 100%     |
| Subscriptions | 4         | 4         | 100%     |
| Security | 0              | 0         | N/A      |
| Admin    | 4              | 4         | 100%     |
| Utility Files | 2         | 2         | 100%     |
| **TOTAL**| **55**         | **55**    | **100%** |
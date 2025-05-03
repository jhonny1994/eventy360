# Product Context: Eventy360

## 1. Why Eventy360 Exists (The Problem Space)

The Algerian academic landscape suffers from:
*   **Scattered Information**: No single source for discovering academic events (conferences, seminars, workshops).
*   **Credibility Concerns**: Difficulty for researchers to assess the quality and legitimacy of events.
*   **Inefficient Processes**: Manual submission via email is cumbersome for tracking, reviews, and feedback.
*   **Limited Research Visibility**: Post-event papers are often inaccessible, hindering knowledge sharing.
*   **Organizer Burden**: Managing events requires juggling multiple, non-integrated tools.

## 2. How Eventy360 Solves This (The Solution)

Eventy360 provides a centralized, trusted SaaS platform featuring:

*   **Targeted Roles**: Distinct interfaces/functionality for Researchers, Organizers, and Administrators.
*   **Arabic First & RTL (MVP)**: UI designed primarily for Arabic users. English/French UI is a future enhancement.
*   **Event Hub**: Organizers publish detailed event information (topics, deadlines, formats, location using data from `wilayas`/`dairas` tables).
*   **Discovery Tools**: Researchers search/filter events (keywords, topics, dates, location).
*   **Streamlined Submissions (Paid Researchers)**: Direct upload of abstracts/papers (PDF/DOC/DOCX, 5MB limit) via the platform.
*   **Review Management (Organizers)**: Tools to download submissions, update status (Accepted/Rejected), and provide mandatory rejection feedback.
*   **Research Repository**: Access to accepted papers from completed events (MVP search/filter: title/abstract, topic/event).
*   **Manual MVP Workflows**: User verification and paid subscription activation rely on admin actions triggered by offline/email communication.
    *   *Verification*: User emails admin -> Admin verifies externally -> Admin updates user status in platform.
    *   *Payment*: User emails admin -> Admin provides offline instructions (bank/check/cash) -> User confirms payment via email -> Admin verifies offline -> Admin records payment & activates subscription in platform.
*   **Automated Notifications (Arabic MVP)**: Email system (using DB templates `email_templates` populated with Arabic text in `ar` key of JSONB fields, and Resend API via Edge Functions) informs users of key status changes and deadlines, managed via a queue (`notification_queue`).
*   **Admin Control Panel**: Tools for managing users, payments, subscriptions, events, topics, email templates (Arabic only in MVP, editing `ar` key), and logs.
*   **i18n-Ready Database (Mixed Strategy)**: Uses JSONB for most dynamic translatable fields (only `ar` key used in MVP), but standard TEXT columns (`name_ar`, `name_other`) for `wilayas`/`dairas`.

## 3. High-Level User Experience Goals

*   **Build Trust**: Through transparent verification and clear information.
*   **Increase Efficiency**: For researchers finding events/submitting work, and organizers managing events/submissions.
*   **Improve Accessibility**: Centralize access to event opportunities and research outputs.
*   **Ensure Clarity**: Provide a clear, intuitive interface with appropriate feedback during operations (loading states, error messages), especially given the multi-lingual (Arabic primary **for MVP**) nature.
*   **Become the Central Hub**: For Algerian academic events and related research.

## 4. User Flows (High-Level)

*(Refer to detailed User Flows in Eventy360_Project_Summary.md for specifics)*

*   **Researcher**: Register -> Complete Profile -> (Optional: Verify/Pay via Email/Admin) -> Discover Events -> Bookmark -> Submit Papers (Paid) -> Track Submissions.
*   **Organizer**: Register -> Complete Profile -> (Optional: Verify/Pay via Email/Admin) -> Create/Manage Events -> Review Submissions -> Manage Event Lifecycle.
*   **Administrator**: Manage Users (Verify, Suspend) -> Manage Payments (Verify, Record) -> Oversee Platform Content (Events, Submissions, Topics) -> Manage Email Templates/Logs.

## 5. Core Principles (UX Goals)

*   **Trustworthiness**: Build user confidence through clear verification processes and reliable information.
*   **Efficiency**: Streamline common tasks for all user types, reducing manual effort.
*   **Accessibility**: Ensure easy access to event information and research outputs.
*   **Clarity**: Provide a clear, intuitive interface, especially given the multi-lingual (Arabic primary **for MVP**) nature.
*   **Centralization**: Serve as the go-to platform for academic events and research in Algeria. 
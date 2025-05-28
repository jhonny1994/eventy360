# Project Brief: Eventy360

## 1. Project Goal
To create a centralized SaaS platform for academic event management and research discovery specifically tailored for the Algerian academic community, addressing issues of information fragmentation, trust, and inefficient workflows.

## 2. Core Problems Addressed
Based on the Algerian academic context:
1.  **Information Fragmentation**: Event announcements are scattered across university sites, social media, etc., making discovery difficult.
2.  **Limited Trust**: Difficulty distinguishing reputable, high-quality academic events.
3.  **Manual Submissions**: Reliance on email/manual tracking for paper submissions is inefficient for organizers and researchers.
4.  **Research Access Barriers**: Post-event research papers are hard to find and access.
5.  **Organizer Workflow Inefficiency**: Lack of integrated tools forces organizers to use disconnected systems.

## 3. Target Audience
*   **Researchers (Algeria)**: Students (all levels), professors, scientists needing to find events, submit papers, and access research.
*   **Organizing Institutions (Algeria)**: Universities, research centers, national schools, labs, activity services, research teams hosting events.
*   **Administrators**: Platform managers handling quality control, manual user/payment verification (MVP), and system maintenance.

## 4. MVP Scope & Key Features
*   **User Management**: 3 roles (researcher, organizer, admin), profiles, manual admin verification (email comms -> platform update).
*   **Internationalization**: Arabic-only UI for MVP with RTL support.
*   **Subscription System**: Tiered (free/paid/trial for researcher/organizer), manual offline payment processing & admin verification.
*   **Event Management**: Detailed event creation, topic association, lifecycle (published -> active -> completed).
*   **Submission System**: Abstract/full paper workflow (PDF/DOC/DOCX, 5MB limit), status tracking, email notifications.
*   **Research Repository**: Centralized storage of accepted papers, MVP search and filter.
*   **Search/Discovery**: Arabic full-text search, advanced filters, topic recommendations, bookmarking.
*   **Verification System**: Manual admin check awards a visual Verification Badge to user profiles.
*   **Notification System**: Email-based, driven by DB triggers, Arabic-only templates for MVP.
*   **Admin System**: Secure invitation-based onboarding, dedicated login flow, standardized dashboard.
*   **Database i18n Structure**: JSONB columns for translatable fields (only 'ar' key for MVP).

## 4.1. MVP Development Phases

1.  **Phase 1**: Subscription Backbone & Core Admin for Manual MVP Operations
2.  **Phase 2**: Event Management & Topic Control
3.  **Phase 3**: Submission System
4.  **Phase 4**: Comprehensive Notification System & Email Management
5.  **Phase 5**: Value-Added MVP Features & Admin Panel Consolidation
6.  **Phase 6**: Testing, Deployment Preparation & Launch

## 5. Non-Goals (for MVP)
*   **Multi-language Support**: English and French support planned for future phase.
*   Automated online payment processing (Future: Chargily Pay).
*   Automated user verification.
*   Real-time features beyond basic notifications.
*   Advanced analytics beyond simple admin dashboard metrics.
*   Event editing by organizers after publishing.
*   Submission editing after submitting. 
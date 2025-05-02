# Project Brief: Eventy360

## Project Overview

Eventy360 is a comprehensive SaaS platform designed to revolutionize academic event management and research discovery in Algeria. The platform connects researchers with academic events, streamlines the submission process, and creates a centralized repository for research papers. It solves the critical problems of information fragmentation, lack of trust mechanisms, and inefficient submission workflows in the Algerian academic ecosystem.

## Core Objectives

1. Create a **centralized discovery platform** for academic events across Algeria
2. Implement a **trust verification system** for both organizers and researchers
3. Provide an **integrated submission workflow** from abstract to full paper
4. Build a **searchable repository** of accepted research papers
5. Deliver a **multilingual experience** supporting Arabic, French, and English
6. Establish a **sustainable business model** through tiered subscriptions

## Target Audience

- **Researchers**: Students, professors, scientists seeking academic events and research opportunities
- **Organizing Institutions**: Universities, research centers, and academic departments hosting events
- **Administrators**: Platform managers ensuring quality, processing verifications, and maintaining the system

## Key Features

### User Management
- Three distinct user types: researchers, organizers, and administrators
- Comprehensive profile systems for each user type
- Verification system with institutional validation
- Multilingual user interface (Arabic, French, English)

### Subscription System
- Tiered model: free_researcher, paid_researcher, paid_organizer
- 14-day trial period for all new users
- Offline payment processing with manual verification
- Clear feature differentiation between tiers

### Event Management
- Detailed event creation with comprehensive information fields
- Support for multiple event types and formats
- Topic association for improved discoverability
- Event lifecycle management (published → active → completed)

### Submission System
- Streamlined paper submission workflow
- Abstract and full paper handling
- Multistage review process
- Status tracking and notifications

### Research Repository
- Centralized storage of accepted papers
- Metadata-based search and discovery
- Download tracking and analytics
- Associated event context for each paper

### Search and Discovery
- Multilingual full-text search
- Advanced filtering capabilities
- Topic-based recommendations
- Saved searches and bookmarking

## Technical Foundation

- **Frontend**: Next.js App Router with TypeScript, Tailwind CSS, and Shadcn UI
- **Backend**: Supabase platform (PostgreSQL, Auth, Storage, Edge Functions, Realtime)
- **Database**: Comprehensive PostgreSQL schema with RLS policies
- **Security**: Row-level security, verification processes, and audit logging
- **Internationalization**: Complete support for Arabic, French, and English

## Success Criteria

1. **User Adoption**: Significant uptake among Algerian academic institutions
2. **Subscription Conversion**: Healthy conversion rate from free to paid tiers
3. **Content Growth**: Steady increase in events and research papers
4. **Platform Trust**: Establishment of Eventy360 as a trusted academic platform
5. **Operational Sustainability**: Subscription revenue covering operational costs

## Development Approach

- Staged rollout of features, starting with core functionality
- Initial focus on traditional payment methods, with digital payments later
- Emphasis on multilingual support from day one
- Strong verification processes to build trust
- Mobile-responsive design, with native applications planned for future

## Unique Value Proposition

Eventy360 is the first platform to offer a comprehensive solution specifically designed for the Algerian academic ecosystem, addressing unique challenges such as language requirements, payment systems, and institutional structures. It brings together event discovery, paper submission, and research repository into a single, integrated platform that builds trust through verification processes and delivers a seamless multilingual experience. 
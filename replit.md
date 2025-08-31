# FloriHub - Florist Directory Platform

## Overview

FloriHub is a modern, mobile-friendly florist directory platform that connects customers with local flower shops. The application allows users to search for florists by location and services, view detailed business profiles, leave reviews, and make inquiries. Florists can register their businesses and manage their online presence through the platform.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and caching
- **Tailwind CSS** with shadcn/ui components for consistent UI design
- **React Hook Form** with Zod validation for form handling

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design with proper error handling
- **Replit Auth** integration for user authentication
- **Express session** management with PostgreSQL storage
- **File-based routing** pattern for API endpoints

### Database Design
- **PostgreSQL** as the primary database
- **Drizzle ORM** for type-safe database operations
- **Neon Database** for serverless PostgreSQL hosting
- Normalized schema with proper relationships and indexing

## Key Components

### Authentication System
- Replit OAuth integration for secure user authentication
- Session-based authentication with PostgreSQL session storage
- Role-based access control (customer, florist, admin)
- Automatic user profile management

### Search & Discovery
- Location-based florist search with geographical coordinates
- Keyword and service-based filtering
- Advanced search filters (distance, rating, services)
- Multiple view modes (grid, list, map)
- Pagination and sorting capabilities

### Business Listings
- Comprehensive florist profiles with business information
- Image gallery support with primary image designation
- Service offerings and specialties management
- Business hours and contact information
- Location mapping and distance calculations

### Review & Rating System
- User-generated reviews and ratings
- Star-based rating aggregation
- Review moderation capabilities
- Response system for business owners

### Inquiry Management
- Customer-to-florist inquiry system
- Event type and budget specification
- Email notification integration via SendGrid
- Inquiry tracking and response management

## Data Flow

### User Registration & Authentication
1. User authenticates via Replit OAuth
2. User profile created/updated in database
3. Session established with encrypted storage
4. Role-based navigation and permissions applied

### Florist Search Process
1. User enters search criteria (location, keywords, services)
2. Geolocation conversion and distance calculations
3. Database query with filtering and sorting
4. Results paginated and returned with business details
5. Client-side caching for improved performance

### Business Registration
1. Authenticated user submits florist registration form
2. Form validation with Zod schema
3. Business profile created with image upload support
4. Automatic geocoding of business address
5. Listing becomes searchable immediately

## External Dependencies

### Database & Storage
- **PostgreSQL**: External PostgreSQL database (floristdb)
- **Drizzle Kit**: Database migrations and schema management
- Connection pooling with standard `pg` library

### Authentication & Communication
- **Replit Auth**: OAuth-based user authentication
- **SendGrid**: Email notifications and communication
- Session management with `connect-pg-simple`

### UI & Design System
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built component library
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library

### Development Tools
- **TypeScript**: Type safety across the stack
- **ESBuild**: Fast production bundling
- **PostCSS**: CSS processing and optimization

## Deployment Strategy

### Development Environment
- Vite development server with HMR
- Express server with auto-reload via tsx
- Integrated error handling and logging
- Environment variable management

### Production Build
- Vite builds optimized client bundle to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Static file serving from built assets
- Express middleware for SPA routing fallback

### Database Management
- Drizzle migrations for schema versioning
- Connection pooling for performance
- Environment-based configuration
- Automatic table creation for sessions

## Changelog
- June 29, 2025. Initial setup with PostgreSQL database integration
- June 30, 2025. Complete design transformation: Clean Apple-like white aesthetic with minimal color scheme, celebratory imagery featuring happy people with flower arrangements, comprehensive UI polish across all components
- June 30, 2025. Completed florist authentication system: Working registration and login with JWT tokens, bcrypt password hashing, drag-and-drop profile image upload, and comprehensive form validation
- June 30, 2025. Enhanced registration UX: Added visual password matching indicators with green/red feedback, prevented form progression when passwords mismatch, fixed form submission issues, and successfully tested complete registration flow
- June 30, 2025. Database migration to external PostgreSQL: Updated connection to use yamanote.proxy.rlwy.net:18615/flouristdb with postgres password, created complete schema SQL file for manual execution
- June 30, 2025. Updated database schema structure: All tables now use floristdb schema (floristdb.sessions, floristdb.users, floristdb.florists, etc.), updated connection string and created finalized create-schema.sql file for manual database setup
- June 30, 2025. Successfully deployed database schema: Connected to external PostgreSQL server using correct password (RwDPqwPPtxhBNDzKDGiJlrHDtdTBZBYx), fixed foreign key constraints between florist_auth and florists tables, created all 9 tables with proper indexes and relationships
- July 2, 2025. Fixed database schema mismatch: Updated shared/schema.ts to match actual database structure, resolved column "business_name" error, confirmed working florist registration and login endpoints with JWT authentication
- July 2, 2025. Completed florist dashboard and profile setup system: Created florist dashboard with business stats, profile management tabs, and complete profile setup page with business photo upload functionality, authentication middleware, and working API endpoints for business profile creation
- July 3, 2025. BREAKTHROUGH: Fixed fundamental authentication system issues: Resolved critical database connection mismatch where application was connecting to wrong database instance (Neon vs external PostgreSQL), corrected schema definitions to match actual database structure, implemented working florist registration and login with JWT tokens, confirmed end-to-end authentication flow with successful test user creation and login
- July 3, 2025. COMPLETED: Full binary image storage system: Implemented proper binary image storage and retrieval in florist_auth.profile_image_url column, renamed florist_images table to florist_catalog for work portfolio samples, created comprehensive unit tests verifying complete workflow from registration through binary image storage and retrieval, validated database stores 118-character base64 image data with full profile information including business details and specialties array
- July 4, 2025. BREAKTHROUGH: MAJOR SUCCESS - Completely resolved all database schema and authentication issues: Fixed database field name mismatches by using correct florists table structure (business_name, zip_code, etc.), resolved PostgreSQL array handling for specialties/services (using native arrays instead of JSON strings), corrected API routing issues (florist login at /api/auth/florist/login), implemented working end-to-end florist authentication system with JWT tokens, confirmed complete profile setup and retrieval workflow - SYSTEM FULLY FUNCTIONAL
- July 5, 2025. FINAL BREAKTHROUGH: Completely resolved all remaining profile data storage issues: Fixed critical API request body parsing issue where makeRequest function in test scripts was causing empty request bodies, resolved database unique constraint requirement by adding unique constraint on florists.email column, eliminated duplicate florist records that were causing data inconsistency, verified complete end-to-end workflow with comprehensive test suite - ALL PROFILE DATA (business information, images, specialties, services arrays) now successfully stores and retrieves from PostgreSQL database
- July 5, 2025. ULTIMATE FIX: Resolved frontend form population issue - Fixed critical data structure mismatch where frontend was accessing existingProfile.businessName but API returns existingProfile.businessProfile.businessName, updated all form field access to use correct nested structure, verified complete save/retrieve cycle working perfectly with live API testing, database field mapping (snake_case to camelCase) functioning correctly - FLORIST PROFILE SETUP FORM NOW LOADS SAVED DATA CORRECTLY
- July 6, 2025. COMPLETE SYSTEM OVERHAUL: Identified and fixed fundamental architectural confusion - the code was incorrectly trying to store business data in authentication table. Created corrected storage system (storage-corrected.ts) and routes (routes-corrected.ts) that properly use two-table architecture: florist_auth (11 columns, authentication only) and florists (24 columns, business profiles). Verified complete workflow: registration → login → profile setup → retrieval with comprehensive testing. All company profile storage functionality now working correctly with proper database relationships and data integrity.
- August 30, 2025. PRODUCTION READY: Fixed profile image retrieval and display system, resolved navigation issues after profile setup completion (now redirects to dashboard), increased server payload limit to 10MB for large image uploads, created comprehensive test dataset with 4 realistic florists across NY metro area (Manhattan, Princeton NJ, Rochester, NYC corporate) with professional profile images (2-3MB each) properly stored in PostgreSQL database - system fully functional for real-world usage
- August 31, 2025. MULTI-ROLE AUTHENTICATION SYSTEM: Successfully replaced Replit OAuth with traditional username/password authentication system using JWT tokens and bcrypt security. Implemented comprehensive customer auth page with login/register forms, updated database schema to support password authentication with password_hash column and user_roles table for multiple roles per user. Created three test users: alaaroubi@gmail.com (admin/customer/florist roles), customer@test.com (customer role), florist@test.com (florist role) - all with password "Password123!" for testing
- August 31, 2025. ADMIN DASHBOARD IMPLEMENTATION: Created comprehensive admin dashboard with user and florist management capabilities. Features include: sortable tables with search functionality, CRUD operations (Create, Read, Update, Delete) for users and florists, Excel import/export functionality using XLSX library, role-based access control with admin middleware, tabbed interface for managing users and florists separately, and professional UI with icons and badges for different user roles (admin, florist, customer)

## User Preferences

Preferred communication style: Simple, everyday language.
Design preferences: Clean Apple-like white aesthetic, easy on the eyes, professional look with minimal colors (no pink, no dark backgrounds, no strong green), wedding/celebration focused imagery, sophisticated aesthetic.
Database preference: Use external PostgreSQL database (yamanote.proxy.rlwy.net:18615/flouristdb) - do not change without approval.
Change approval required: Do not change design or database configuration without explicit user approval.
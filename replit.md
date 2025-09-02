# FloriHub - Florist Directory Platform

## Overview

FloriHub is a mobile-friendly florist directory platform connecting customers with local flower shops. It enables users to search for florists by location and services, view detailed profiles, leave reviews, and make inquiries. Florists can register and manage their online presence. The platform aims to be a comprehensive, professional, and aesthetically pleasing hub for floral services.

## User Preferences

Preferred communication style: Simple, everyday language.
Design preferences: Beautiful SaaS-style modern design with professional gradients and glassmorphism effects. Blue gradient action buttons with hover animations. Clean cards with backdrop blur and subtle shadows. Snappy, world-class UI components designed like the best SaaS applications.
Database preference: Use external PostgreSQL database (yamanote.proxy.rlwy.net:18615/flouristdb) - do not change without approval.
Change approval required: Do not change design or database configuration without explicit user approval.

## System Architecture

### Frontend
The frontend is built with React 18 and TypeScript, using Vite for development and Wouter for routing. State management is handled by TanStack Query, and UI components are styled with Tailwind CSS and shadcn/ui. Form handling uses React Hook Form with Zod validation.

**Key Frontend Pages:**
- `/auth` - Customer/Florist login and registration  
- `/admin/login` - Admin authentication portal
- `/messages` - Gmail-inspired admin messaging interface (`admin-messages-redesign.tsx`)
- `/compose-message` - Message composition dialog with florist search
- `/admin/website-info` - Website contact information management
- `/contact` - Public contact information display

**Authentication System:**
- JWT-based authentication with localStorage token storage
- Role-based access control (customer, florist, admin)
- Token expiration handling with automatic redirect to login
- Admin access required for messaging system

### Backend
The backend utilizes Express.js with TypeScript, following a RESTful API design. Multiple authentication systems are implemented:

1. **Replit Auth** (`server/replitAuth.ts`) - OAuth integration for user authentication
2. **JWT Auth** (`server/routes.ts`) - Token-based auth for florists and customers  
3. **Admin Auth** (`server/admin-routes.ts`) - Admin role verification middleware

**API Endpoints:**
- `/api/auth/*` - Authentication (login, register, user profile)
- `/api/messages` - Messaging system CRUD operations
- `/api/messages/florists` - Florist directory for compose dialog
- `/api/messages/unread-count` - Message notification counts
- `/api/website-info` - Website contact information management
- `/admin/*` - Protected admin routes

### Database
PostgreSQL is the primary database (Railway: `yamanote.proxy.rlwy.net:18615/floristdb`). 

**Key Tables:**
- `users` - Admin/customer accounts with role-based access
- `florist_auth` - Florist authentication and business profiles  
- `messages` - Admin-florist communication with read status
- `website_info` - Site contact information and business details
- `inquiries` - Customer-florist inquiry system
- `reviews` - Rating and review system

**Database Features:**
- Base64 image storage in `profile_image_data` column
- JSONB for complex data (business hours, social media)
- Array columns for specialties and services
- Proper indexing for messaging performance

### Core Features
- **Authentication System**: Replit OAuth integration, session-based authentication, role-based access control, and user profile management.
- **Search & Discovery**: Location, keyword, and service-based search with advanced filtering, multiple view modes, pagination, and sorting.
- **Business Listings**: Comprehensive florist profiles including image galleries, service offerings, business hours, and location mapping.
- **Review & Rating System**: User-generated reviews with star-based ratings, moderation, and business owner responses.
- **Inquiry Management**: Customer-to-florist inquiry system with event and budget specification, email notifications via SendGrid, and tracking.
- **Admin Dashboard**: Comprehensive admin interface for managing users and florists, with sortable tables, search, CRUD operations, and Excel import/export.

## External Dependencies

### Database & Storage
- **PostgreSQL**: External PostgreSQL database for primary data storage.
- **Drizzle ORM**: For type-safe database interactions.
- **Neon Database**: Serverless PostgreSQL hosting.

### Authentication & Communication
- **Replit Auth**: OAuth-based user authentication.
- **SendGrid**: Email notifications and communication.
- **connect-pg-simple**: For PostgreSQL-backed session management.

### UI & Design System
- **Radix UI**: Accessible component primitives.
- **shadcn/ui**: Pre-built component library.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.

### Development Tools
- **TypeScript**: For type safety across the stack.
- **Vite**: Frontend build tool.
- **ESBuild**: Server-side bundling.
- **PostCSS**: CSS processing.
- **XLSX**: For Excel import/export in the admin dashboard.

## Recent Changes

**Complete Route Protection System (September 1, 2025)**
- Fixed infinite authentication loop that was causing app to get stuck
- Implemented comprehensive route protection system with ProtectedRoute component
- Navigation now conditionally shows menu items based on authentication status
- Protected routes redirect unauthenticated users to login page
- Admin login credentials confirmed working: `alaaroubi@gmail.com` / `Password123!`
- All admin routes now properly protected requiring admin authentication
- Public routes (Home, Search, Contact, Login, Join) always accessible
- Messaging system requires admin authentication and is fully functional

**Website Contact Information Management System (September 1, 2025)**
- Created complete website contact information management system
- Built admin interface at `/admin/website-info` with tabbed form for all contact details
- Added professional Admin dropdown menu in navigation with organized options:
  - Manage Users, Manage Florists, Website Info, Dashboard
- Created public contact page at `/contact` displaying complete contact information
- Fixed navigation Contact link to properly route to contact page

**Messaging System Implementation (September 1, 2025)**
- Created complete messaging system with Gmail-inspired interface
- Built messages table with admin-florist communication capability
- Added `/api/messages` and `/api/messages/florists` endpoints
- Implemented compose message dialog with florist search functionality
- Added message search and filtering capabilities
- Created sample messages for testing system functionality
- Note: Requires admin authentication to access messaging features

**Image Storage System (September 1, 2025)**
- Implemented complete image storage system storing base64 data directly in database
- Added profile_image_data column to florist_auth table
- Created professional flower arrangement images for all 52 florists
- Fixed image upload functionality in admin interface
- All florists now have appropriate floral-themed profile pictures instead of random images
- System successfully tested with working upload and display functionality
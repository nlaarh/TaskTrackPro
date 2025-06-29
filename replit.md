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
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle Kit**: Database migrations and schema management
- Connection pooling with `@neondatabase/serverless`

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
- June 29, 2025. Complete design transformation: Elegant sage green and cream color scheme, wedding-focused imagery, professional sophisticated look replacing previous pink theme

## User Preferences

Preferred communication style: Simple, everyday language.
Design preferences: Professional, stunning look with elegant colors (no pink or dark backgrounds), wedding/celebration focused imagery, sophisticated aesthetic.
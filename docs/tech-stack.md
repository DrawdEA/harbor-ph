# Tech Stack Documentation

This document provides an overview of the main technologies used in the Harbor PH project.

---

## 1. Next.js
- **Version:** 15.x (App Router, Turbopack)
- **Description:**
  - Next.js is a React framework for building fast, scalable web applications with server-side rendering, static site generation, and API routes.
  - Used as the main framework for the frontend and routing.
- **Key Features Used:**
  - App directory structure (`src/app`)
  - TypeScript support
  - File-based routing
  - API routes (if needed)
  - Built-in font optimization

---

## 2. Tailwind CSS
- **Version:** 4.x
- **Description:**
  - Tailwind CSS is a utility-first CSS framework for rapidly building custom user interfaces.
  - Used for styling all UI components with utility classes.
- **Key Features Used:**
  - Custom theme configuration
  - Responsive design utilities
  - Integration with Next.js via PostCSS

---

## 3. Supabase
- **Description:**
  - Supabase is an open-source Firebase alternative providing authentication, database, and storage services.
  - Used for user authentication, database operations, and file storage.
- **Key Features Used:**
  - **Authentication:** User sign-up, login, and session management
  - **Database:** PostgreSQL database with real-time subscriptions
  - **Storage:** File upload and management for profile pictures
  - **Row Level Security (RLS):** Database security policies
- **Storage Bucket:** `avatars` for profile picture storage

---

## 4. Prisma
- **Version:** 6.x
- **Description:**
  - Prisma is a next-generation ORM (Object-Relational Mapper) for Node.js and TypeScript.
  - Used for database access and migrations.
- **Key Features Used:**
  - Type-safe database queries
  - Schema-based migrations
  - Integration with PostgreSQL, MySQL, SQLite, etc. (database choice can be specified in `prisma/schema.prisma`)

---

## 5. Form Management & Validation
- **React Hook Form:**
  - Used for efficient form state management and validation
  - Provides better performance than controlled components
- **Zod:**
  - TypeScript-first schema validation library
  - Used for form validation with React Hook Form
  - Provides runtime type checking and validation

---

## 6. UI Components
- **Shadcn/ui:**
  - Modern, accessible component library built on Radix UI
  - Used for consistent UI components across the application
  - Includes components like Button, Card, Input, Modal, etc.

---

## 7. Other Tools
- **TypeScript:**
  - Provides static typing for safer and more maintainable code.
- **ESLint:**
  - Ensures code quality and consistency.
- **PostCSS:**
  - Used for processing Tailwind CSS and other CSS transformations.

---

## Profile & Settings Features

### Implemented Features
- **Profile Management:** Edit profile information with real-time validation
- **Profile Picture Upload:** Image upload with preview and validation
- **Settings Page:** Card-based layout with organized sections
- **Header Integration:** Real-time header updates when profile changes
- **Form Validation:** Client-side validation using Zod schemas

### Key Technologies Used
- **Supabase Storage:** For profile picture file storage
- **React Hook Form + Zod:** For form management and validation
- **Shadcn/ui Components:** For consistent UI design
- **Global State Management:** For header refresh functionality

### Setup Requirements
- Supabase `avatars` storage bucket with proper RLS policies
- Database triggers for user metadata synchronization
- Proper CORS configuration for file uploads

For detailed implementation information, see [Profile & Settings Documentation](./profile-settings.md).

---

For more details, see the individual configuration files and documentation in the project. 
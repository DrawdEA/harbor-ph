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

## 3. Prisma
- **Version:** 6.x
- **Description:**
  - Prisma is a next-generation ORM (Object-Relational Mapper) for Node.js and TypeScript.
  - Used for database access and migrations.
- **Key Features Used:**
  - Type-safe database queries
  - Schema-based migrations
  - Integration with PostgreSQL, MySQL, SQLite, etc. (database choice can be specified in `prisma/schema.prisma`)

---

## 4. Other Tools
- **TypeScript:**
  - Provides static typing for safer and more maintainable code.
- **ESLint:**
  - Ensures code quality and consistency.
- **PostCSS:**
  - Used for processing Tailwind CSS and other CSS transformations.

---



For more details, see the individual configuration files and documentation in the project. 
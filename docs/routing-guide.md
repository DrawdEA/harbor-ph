## Routing Guide

### **Authentication & Registration**
- `/login`  
  User login page.
- `/register`  
  Registration flow entry point.
    - `/register/account-type` – Choose between user or organization account.
    - `/register/user` – User registration step.
    - `/register/organization` – Organization registration step.
    - `/register/verify` – Email/code verification.
    - `/register/welcome` – Welcome/confirmation after registration.

### **Public Event Pages**
- `/event/[eventId]`  
  Public event details page.
    - `/event/[eventId]/register` – Multi-step registration for an event:
        - `/payment` – Payment step.
        - `/qr` – QR code for entry.
        - `/rules` – Event rules.
        - `/success` – Registration success/confirmation.
        - `/tickets` – Ticket selection.

### **Organization Management**
- `/organizations/[orgname]`  
  Organization profile page.
    - `/organizations/[orgname]/events` – List of all events by the organization.
        - `/create` – Create a new event.
        - `/[eventId]` – Organization’s management view for a specific event:
            - `/analytics` – Event analytics.
            - `/edit` – Edit event details.
            - `/guest` – Guest list and management.

### **User Profiles**
- `/users/[username]`  
  Public user profile page.

---

## Structure Philosophy

- **Separation of Concerns:**  
  Public event pages, registration flows, user profiles, and organization management are all clearly separated by route and directory.
- **Scalability:**  
  Adding new features (e.g., more event management tools, user settings, organization analytics) is straightforward.
- **RESTful & Human-Friendly URLs:**  
  URLs are designed to be readable and meaningful for both users and developers.

---

## Adding New Features

- **New registration steps:**  
  Add a new folder under `/register/`.
- **New event management tools:**  
  Add a new folder under `/organizations/[orgname]/events/[eventId]/`.
- **New user or organization features:**  
  Add new folders under `/users/[username]/` or `/organizations/[orgname]/`.

---

## Access Control

- **Public routes:**  
  `/`, `/event/[eventId]`, `/users/[username]`, `/organizations/[orgname]`
- **Protected routes:**  
  Organization event management (`/organizations/[orgname]/events/[eventId]/edit`, `/analytics`, `/guest`) should be protected so only authorized org members can access.

---

## Navigation Example

- **A user registers:**  
  `/register` → `/register/account-type` → `/register/user` or `/register/organization` → `/register/verify` → `/register/welcome`
- **A user views an event:**  
  `/event/123`
- **A user registers for an event:**  
  `/event/123/register/rules` → `/tickets` → `/payment` → `/success`
- **An org manages an event:**  
  `/organizations/hidden-nights/events/123/edit`

---

## Contributing

- Please follow the directory and routing conventions above.
- When adding new features, update this README to help others understand the structure.

---
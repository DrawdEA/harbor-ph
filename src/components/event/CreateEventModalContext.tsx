"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CreateEventModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const CreateEventModalContext = createContext<CreateEventModalContextType | undefined>(undefined);

export function CreateEventModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <CreateEventModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </CreateEventModalContext.Provider>
  );
}

export function useCreateEventModal() {
  const context = useContext(CreateEventModalContext);
  if (context === undefined) {
    throw new Error('useCreateEventModal must be used within a CreateEventModalProvider');
  }
  return context;
}

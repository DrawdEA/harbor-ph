"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface CategorySelectorProps {
  selectedCategories: string[];
  onCategoriesChange: (categoryIds: string[]) => void;
  placeholder?: string;
}

export default function CategorySelector({
  selectedCategories,
  onCategoriesChange,
  placeholder = "Select categories..."
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    onCategoriesChange(newSelected);
    setOpen(false); // Close the dropdown after selection
  };

  const removeCategory = (categoryId: string) => {
    const newSelected = selectedCategories.filter(id => id !== categoryId);
    onCategoriesChange(newSelected);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || categoryId;
  };

  if (isLoading) {
    return <div className="h-10 w-full animate-pulse bg-muted rounded-md" />;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedCategories.map((categoryId) => (
          <Badge key={categoryId} variant="secondary" className="gap-1">
            {getCategoryName(categoryId)}
            <button
              type="button"
              onClick={() => removeCategory(categoryId)}
              className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={() => setOpen(!open)}
        >
          {selectedCategories.length === 0
            ? placeholder
            : `${selectedCategories.length} categor${selectedCategories.length === 1 ? 'y' : 'ies'} selected`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
        
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50">
            <div className="p-2">
              <div className="text-sm font-medium mb-2">Select Categories:</div>
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer border border-transparent hover:border-border"
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      selectedCategories.includes(category.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

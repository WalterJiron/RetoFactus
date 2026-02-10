"use client";

import React from "react";
import {
  Input,
  Button,
  Card,
  CardBody,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import { Search, Filter, RefreshCw } from "lucide-react";

interface Filter {
  key: string;
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: Filter[];
  onClearFilters: () => void;
  placeholder?: string;
  className?: string;
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  filters,
  onClearFilters,
  placeholder = "Buscar...",
  className = "",
}: FilterBarProps) {
  return (
    <Card
      className={`border border-gray-200 dark:border-gray-800 shadow-sm ${className}`}
    >
      <CardBody className="p-6">
        <article className="flex flex-col lg:flex-row gap-4">
          <Input
            className="lg:max-w-xs"
            placeholder={placeholder}
            startContent={<Search className="h-4 w-4 text-gray-400" />}
            value={searchTerm}
            onValueChange={onSearchChange}
          />

          <section className="flex flex-1 gap-4">
            {filters.map((filter) => (
              <Autocomplete
                key={filter.key}
                className="lg:max-w-xs"
                placeholder={filter.label}
                selectedKey={filter.value}
                startContent={
                  filter.icon || <Filter className="h-4 w-4 text-gray-400" />
                }
                onSelectionChange={(key) => filter.onChange(key as string)}
              >
                {filter.options.map((option) => (
                  <AutocompleteItem key={option.value}>
                    {option.label}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            ))}

            <Button
              startContent={<RefreshCw className="h-4 w-4" />}
              variant="light"
              onClick={onClearFilters}
            >
              Limpiar filtros
            </Button>
          </section>
        </article>
      </CardBody>
    </Card>
  );
}

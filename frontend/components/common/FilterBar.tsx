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
            placeholder={placeholder}
            startContent={<Search className="h-4 w-4 text-gray-400" />}
            value={searchTerm}
            onValueChange={onSearchChange}
            className="lg:max-w-xs"
          />

          <section className="flex flex-1 gap-4">
            {filters.map((filter) => (
              <Autocomplete
                key={filter.key}
                placeholder={filter.label}
                startContent={
                  filter.icon || <Filter className="h-4 w-4 text-gray-400" />
                }
                selectedKey={filter.value}
                onSelectionChange={(key) => filter.onChange(key)}
                className="lg:max-w-xs"
              >
                {filter.options.map((option) => (
                  <AutocompleteItem key={option.value}>
                    {option.label}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            ))}

            <Button
              variant="light"
              startContent={<RefreshCw className="h-4 w-4" />}
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

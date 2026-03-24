export interface Category {
  id: number;
  name: string;
  description: string;
  datecreate: string;
  dateupdate: string | null;
  datedelete: string | null;
  active: boolean;
}

export interface CategoryDTO {
  nameCategory: string;
  description: string;
}

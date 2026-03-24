export interface SubCategory {
  id: number;
  name: string;
  description: string;
  idcategory: number;
  namecategory: string;
  descriptioncategory: string;
  datecreate: string;
  dateupdate: string | null;
  datedelete: string | null;
  active: boolean;
}

export interface SubCategoryDTO {
  nameSubCategory: string;
  description: string;
  categorySub: number;
}

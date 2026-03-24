export interface Product {
  idproduct: string;
  code_reference: string;
  nameproduct: string;
  productdescription: string;
  stock: number;
  measurementunit: number;
  idsubcategory: number;
  namesubcategory: string;
  subcategorydescription: string;
  subcategoryactive: boolean;
  idcategory: number;
  namecategory: string;
  categorydescription: string;
  categoryactive: boolean;
  iddetailproduct: number;
  purchaseprice: string;
  saleprice: string;
  minstock: number;
  datecreate: string;
  dateupdate: string | null;
  datedelete: string | null;
  active: boolean;
}

export interface ProductDTO {
  codeReference?: string;
  nameProduct: string;
  description: string;
  idSubCategory: number;
  stock: number;
  measurementUnit: number;
  minStock: number;
  purchasePrice: number;
  salePrice: number;
  idDetail?: number; // Needed for PATCH
}

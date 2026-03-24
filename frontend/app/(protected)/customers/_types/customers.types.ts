// app/(protected)/customers/_types/customers.types.ts

export interface Customer {
  idcustomer: string;
  identification: string;
  names: string;
  address: string;
  email: string;
  phone: string;
  tributeid: number;
  identificationdocumentid: number;
  municipalityid: number;
  idestablishment: number;
  establishmentname: string;
  totalsalesinestablishment: string;
  datecreate: string;
  dateupdate: string | null;
  datedelete: string | null;
  active: boolean;
}

export interface CustomerDTO {
  identification: string;
  names: string;
  address: string;
  email: string;
  phone: string;
  identificationDocumentId?: number;
  municipalityId?: number;
}

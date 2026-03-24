export interface Establishment {
  idestablishment: number;
  name: string;
  address: string;
  phone_number: string;
  email: string;
  municipality_id: number;
  active: boolean;
  datecreate: string;
  roles_count: string;
  users_count: string;
  products_count: string;
}

export interface EstablishmentDTO {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  municipalityId: number;
}

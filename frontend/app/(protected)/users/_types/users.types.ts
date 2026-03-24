// app/(protected)/users/_types/users.types.ts

export interface User {
  id: string;
  name: string;
  email: string;
  id_role: number;
  role_name: string;
  lastlogin: string | null;
  datecreate: string;
  dateupdate: string | null;
  active: boolean;
}

export interface UserDTO {
  nameUser: string;
  email: string;
  password?: string;
  roleUser: number;
}

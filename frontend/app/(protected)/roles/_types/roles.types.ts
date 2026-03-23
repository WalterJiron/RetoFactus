// app/(protected)/roles/_types/roles.types.ts

export interface Role {
  id: number;
  name_rol: string;
  description: string;
  datecreate_local: string;
  active: boolean;
}

export interface RoleDTO {
  name: string;
  description: string;
}

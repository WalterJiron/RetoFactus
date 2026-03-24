// app/(protected)/users/_components/UserFormModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  UserLock,
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
} from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";

import { User, UserDTO } from "../_types/users.types";
import { Role } from "../../roles/_types/roles.types";

interface UserFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: User | null;
  roles: Role[];
  rolesLoading: boolean;
  isLoading: boolean;
  error?: string | null;
  onSubmit: (data: UserDTO) => Promise<any>;
}

export default function UserFormModal({
  isOpen,
  onOpenChange,
  selectedUser,
  roles,
  rolesLoading,
  isLoading,
  error,
  onSubmit,
}: UserFormModalProps) {
  const [successData, setSuccessData] = useState<any>(null);
  // New: local error state for UI sync if needed, but we'll use a prop if we want to show API errors
  // For now, let's assume we want to show any validation or general error

  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    roleId: false,
  });

  useEffect(() => {
    if (isOpen) {
      setFormValues({
        name: selectedUser?.name ?? "",
        email: selectedUser?.email ?? "",
        password: "",
        roleId: selectedUser?.id_role?.toString() ?? "",
      });
      setFormErrors({ name: "", email: "", password: "", roleId: "" });
      setTouched({ name: false, email: false, password: false, roleId: false });
      setSuccessData(null);
    }
  }, [selectedUser, isOpen]);

  const validateName = (val: string) => {
    const trimmed = val.trim();

    if (!trimmed) return "El nombre es obligatorio";
    if (trimmed.length < 2 || trimmed.length > 50)
      return "El nombre debe tener entre 2 y 50 caracteres";
    if (!/^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s]+$/.test(trimmed))
      return "El nombre solo puede contener letras, números y espacios";

    return "";
  };

  const validateEmail = (val: string) => {
    const trimmed = val.trim();

    if (!trimmed) return "El email es obligatorio";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
      return "Formato de email inválido";

    return "";
  };

  const validatePassword = (val: string, isEditing: boolean) => {
    if (isEditing && !val) return "";
    if (!val) return "La contraseña es obligatoria";

    // Updated regex to allow any special character including dots, and use a simpler approach if Unicode fails
    // This regex requires: 8+ chars, 1 upper, 1 lower, 1 digit, 1 special (any non-alphanumeric except space)
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*.\-_+=[\]{};':"\\|,.<>/?]).{8,}$/;

    if (!passwordRegex.test(val)) {
      return "Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (ej: !@.#$)";
    }

    return "";
  };

  const validateRole = (val: string) => {
    if (!val) return "El rol es obligatorio";
    const id = parseInt(val);

    if (isNaN(id) || id < 1) return "ID de rol inválido";

    return "";
  };

  const handleBlur = (field: keyof typeof formValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let error = "";

    if (field === "name") error = validateName(formValues.name);
    else if (field === "email") error = validateEmail(formValues.email);
    else if (field === "password")
      error = validatePassword(formValues.password, !!selectedUser);
    else if (field === "roleId") error = validateRole(formValues.roleId);
    setFormErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleValueChange = (field: keyof typeof formValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      let error = "";

      if (field === "name") error = validateName(value);
      else if (field === "email") error = validateEmail(value);
      else if (field === "password")
        error = validatePassword(value, !!selectedUser);
      else if (field === "roleId") error = validateRole(value);
      setFormErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nError = validateName(formValues.name);
    const eError = validateEmail(formValues.email);
    const pError = validatePassword(formValues.password, !!selectedUser);
    const rError = validateRole(formValues.roleId);

    if (nError || eError || pError || rError) {
      setFormErrors({
        name: nError,
        email: eError,
        password: pError,
        roleId: rError,
      });
      setTouched({ name: true, email: true, password: true, roleId: true });

      return;
    }

    try {
      const response = await onSubmit({
        nameUser: formValues.name.trim(),
        email: formValues.email.trim().toLowerCase(),
        password: formValues.password || undefined,
        roleUser: parseInt(formValues.roleId),
      });

      // Set success data to show the API response in the modal
      setSuccessData(response);
    } catch (err) {
      // Error is handled by the parent/hook and passed via 'error' prop
      console.error("Submission error:", err);
    }
  };

  const isFormInvalid =
    !!validateName(formValues.name) ||
    !!validateEmail(formValues.email) ||
    !!validatePassword(formValues.password, !!selectedUser) ||
    !!validateRole(formValues.roleId);

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="outside"
      size="2xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <UserLock className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold">
                  {selectedUser ? "Editar Usuario" : "Nuevo Usuario"}
                </h2>
              </div>
              <p className="text-xs font-normal text-gray-500">
                {selectedUser
                  ? `Modificando usuario: ${selectedUser.name}`
                  : "Completa los campos para registrar un nuevo acceso"}
              </p>
            </ModalHeader>
            <ModalBody className="gap-4">
              {error && (
                <div className="p-3 bg-danger-50 text-danger text-xs rounded-lg border border-danger-100 italic">
                  {error}
                </div>
              )}

              {successData ? (
                <div className="space-y-6 py-4">
                  <div className="flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in duration-300">
                    <div className="h-16 w-16 bg-success-100 rounded-full flex items-center justify-center border-4 border-success-50">
                      <ShieldCheck className="h-10 w-10 text-success-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        ¡Operación Exitosa!
                      </h3>
                      <p className="text-sm text-gray-500">
                        El usuario ha sido{" "}
                        {selectedUser ? "actualizado" : "registrado"}{" "}
                        correctamente.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      isRequired
                      errorMessage={touched.name && formErrors.name}
                      isInvalid={touched.name && !!formErrors.name}
                      label="Nombre Completo"
                      placeholder="Ej. Juan Pérez"
                      startContent={
                        <UserIcon className="h-4 w-4 text-gray-400" />
                      }
                      value={formValues.name}
                      variant="bordered"
                      onBlur={() => handleBlur("name")}
                      onValueChange={(v) => handleValueChange("name", v)}
                    />
                    <Input
                      isRequired
                      errorMessage={touched.email && formErrors.email}
                      isInvalid={touched.email && !!formErrors.email}
                      label="Correo Electrónico"
                      placeholder="ejemplo@empresa.com"
                      startContent={<Mail className="h-4 w-4 text-gray-400" />}
                      type="email"
                      value={formValues.email}
                      variant="bordered"
                      onBlur={() => handleBlur("email")}
                      onValueChange={(v) => handleValueChange("email", v)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      errorMessage={touched.password && formErrors.password}
                      isInvalid={touched.password && !!formErrors.password}
                      isRequired={!selectedUser}
                      label="Contraseña"
                      placeholder={
                        selectedUser
                          ? "Dejar en blanco para no cambiar"
                          : "Mínimo 8 caracteres"
                      }
                      startContent={<Lock className="h-4 w-4 text-gray-400" />}
                      type="password"
                      value={formValues.password}
                      variant="bordered"
                      onBlur={() => handleBlur("password")}
                      onValueChange={(v) => handleValueChange("password", v)}
                    />
                    <Select
                      isRequired
                      errorMessage={touched.roleId && formErrors.roleId}
                      isInvalid={touched.roleId && !!formErrors.roleId}
                      isLoading={rolesLoading}
                      label="Rol Asignado"
                      placeholder="Selecciona un rol"
                      selectedKeys={
                        formValues.roleId ? [formValues.roleId] : []
                      }
                      startContent={
                        <ShieldCheck className="h-4 w-4 text-gray-400" />
                      }
                      variant="bordered"
                      onBlur={() => handleBlur("roleId")}
                      onSelectionChange={(keys) => {
                        const val = Array.from(keys)[0] as string;

                        handleValueChange("roleId", val);
                      }}
                    >
                      {roles.map((role) => (
                        <SelectItem
                          key={role.id.toString()}
                          textValue={role.name_rol}
                        >
                          {role.name_rol}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              {successData ? (
                <Button fullWidth color="primary" onPress={onClose}>
                  Entendido
                </Button>
              ) : (
                <>
                  <Button variant="light" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    color="primary"
                    isDisabled={
                      isFormInvalid && Object.values(touched).some((t) => t)
                    }
                    isLoading={isLoading}
                    type="submit"
                  >
                    {selectedUser ? "Guardar Cambios" : "Crear Usuario"}
                  </Button>
                </>
              )}
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Input, Button } from "@heroui/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import {
  LockClosedIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

export default function LoginPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  // Validación de email
  const validateEmail = (email: string) => {
    if (!email) return "El email es requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Por favor ingresa un email válido";
    }

    return "";
  };

  // Validación de contraseña
  const validatePassword = (password: string) => {
    if (!password) return "La contraseña es requerida";
    if (password.length < 8) return "Mínimo 8 caracteres";
    if (!/[A-Z]/.test(password)) return "Al menos una mayúscula";
    if (!/[a-z]/.test(password)) return "Al menos una minúscula";
    if (!/[0-9]/.test(password)) return "Al menos un número";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      return "Al menos un carácter especial";

    return "";
  };

  // Validar en tiempo real cuando el usuario escribe
  useEffect(() => {
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    }
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    }
  }, [email, password, touched]);

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Marcar ambos campos como tocados para mostrar todos los errores
    setTouched({ email: true, password: true });

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      setIsSubmitting(false);

      return;
    }

    // Simulación de petición de autenticación
    try {
      // Aquí iría la lógica real de autenticación
      console.log("Credenciales válidas:", { email, password });

      // Simulamos un delay para mostrar estado de carga
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirigir a /home
      router.push("/home");
    } catch (error) {
      console.error("Error en autenticación:", error);
      setIsSubmitting(false);
    }
  };

  // Función para mostrar el estado de validación
  const getPasswordValidationStatus = () => {
    if (!touched.password || !password) return null;

    const requirements = [
      { label: "8 caracteres mínimo", valid: password.length >= 8 },
      { label: "Al menos una mayúscula", valid: /[A-Z]/.test(password) },
      { label: "Al menos una minúscula", valid: /[a-z]/.test(password) },
      { label: "Al menos un número", valid: /[0-9]/.test(password) },
      {
        label: "Al menos un carácter especial",
        valid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      },
    ];

    return (
      <div className="mt-2 space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2">
            {req.valid ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
            ) : (
              <XCircleIcon className="h-4 w-4 text-gray-300" />
            )}
            <span
              className={`text-xs ${req.valid ? "text-green-600" : "text-gray-500"}`}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-col items-center px-8 pt-8 pb-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Iniciar Sesión
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>
        </CardHeader>

        <CardBody className="px-8 pb-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Campo Email */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Correo Electrónico
              </span>
              <Input
                isRequired
                aria-label="Correo electrónico"
                autoComplete="email"
                className="w-full"
                errorMessage={touched.email && errors.email}
                isInvalid={touched.email && !!errors.email}
                placeholder="ejemplo@empresa.com"
                size="lg"
                startContent={
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                }
                type="email"
                value={email}
                variant="bordered"
                onBlur={() => handleBlur("email")}
                onValueChange={(value) => {
                  setEmail(value);
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
              />
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña
              </span>
              <Input
                isRequired
                aria-label="Contraseña"
                autoComplete="current-password"
                className="w-full"
                endContent={
                  <button
                    aria-label={
                      isVisible ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                }
                errorMessage={touched.password && errors.password}
                isInvalid={touched.password && !!errors.password}
                placeholder="Ingresa tu contraseña"
                size="lg"
                startContent={
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                }
                type={isVisible ? "text" : "password"}
                value={password}
                variant="bordered"
                onBlur={() => handleBlur("password")}
                onValueChange={(value) => {
                  setPassword(value);
                  setErrors((prev) => ({ ...prev, password: "" }));
                }}
              />

              {/* Validación visual de requisitos */}
              {getPasswordValidationStatus()}
            </div>

            {/* Botón de Login */}
            <Button
              className="w-full font-semibold mt-6"
              color="primary"
              isDisabled={!!errors.email || !!errors.password || isSubmitting}
              isLoading={isSubmitting}
              radius="md"
              size="lg"
              type="submit"
            >
              {isSubmitting ? "Verificando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

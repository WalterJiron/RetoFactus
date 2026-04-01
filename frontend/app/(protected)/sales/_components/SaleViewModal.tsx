"use client";

import React from "react";
import {
  ShoppingCart,
  User as UserIcon,
  CreditCard,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  PackageSearch,
} from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
  Chip,
} from "@heroui/react";

import { Sale, SaleDetailDTO, SaleStatus } from "../_types/sales.types";
import { Product } from "../../products/_types/products.types";

interface SaleViewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSale: Sale | null;
  saleDetails: SaleDetailDTO[] | null;
  products: Product[];
  isLoading: boolean;
  error?: string | null;
}

export default function SaleViewModal({
  isOpen,
  onOpenChange,
  selectedSale,
  saleDetails,
  products,
  isLoading,
  error,
}: SaleViewModalProps) {

  const renderStatus = (status: SaleStatus | undefined) => {
    switch (status) {
      case "completed":
        return (
          <Chip size="sm" color="success" variant="flat" startContent={<CheckCircle2 className="w-4 h-4" />}>
            Completada
          </Chip>
        );
      case "cancelled":
        return (
          <Chip size="sm" color="danger" variant="flat" startContent={<XCircle className="w-4 h-4" />}>
            Cancelada
          </Chip>
        );
      case "pending":
      default:
        return (
          <Chip size="sm" color="warning" variant="flat" startContent={<Clock className="w-4 h-4" />}>
            Pendiente
          </Chip>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="4xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent className="max-h-[90vh]">
        {(onClose) => (
          <div className="flex flex-col h-full overflow-hidden">
            <ModalHeader className="flex flex-col gap-1 border-b dark:border-default-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold">Detalle de la Venta</h2>
              </div>
              <p className="text-xs font-normal text-gray-500 flex items-center gap-2">
                Referencia: <span className="font-mono font-medium text-gray-900 dark:text-gray-300">{selectedSale?.reference_code}</span>
              </p>
            </ModalHeader>
            <ModalBody className="gap-6 py-4 overflow-y-auto w-full max-w-full">
              {isLoading ? (
                <div className="flex justify-center p-8 text-gray-500">
                  Cargando información de la venta...
                </div>
              ) : error ? (
                <div className="p-3 bg-danger-50 text-danger text-xs rounded-lg border border-danger-100 italic">
                  {error}
                </div>
              ) : selectedSale ? (
                <div className="flex flex-col gap-6 h-full">
                  {/* CABECERA (INFO GENERAL) */}
                  <div className="bg-gray-50 dark:bg-default-100 p-4 rounded-xl border border-default-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1"><UserIcon className="w-3 h-3" /> Cliente</span>
                        <span className="font-semibold text-sm">{selectedSale.customer_name}</span>
                        <span className="text-xs text-gray-400">{selectedSale.customer_identification}</span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1"><CreditCard className="w-3 h-3" /> Pago</span>
                        <span className="font-semibold text-sm">{selectedSale.payment_form_name}</span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Fecha</span>
                        <span className="font-semibold text-sm">
                          {new Date(selectedSale.sale_date).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-xs text-gray-500">Estado Venta</span>
                        <div className="mt-1">
                          {renderStatus(selectedSale.status)}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* LISTADO DE DETALLES */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <PackageSearch className="h-4 w-4 text-primary" /> Productos ({saleDetails?.length || 0})
                    </h4>

                    <div className="bg-white dark:bg-default-50 border border-default-200 rounded-xl overflow-x-auto">
                      {!saleDetails || saleDetails.length === 0 ? (
                        <div className="flex h-full items-center justify-center p-8 text-gray-400 text-sm">
                          Esta venta no tiene productos registrados.
                        </div>
                      ) : (
                        <table className="w-full text-sm text-left whitespace-nowrap">
                          <thead className="bg-gray-50 dark:bg-default-100 text-gray-500 uppercase text-xs">
                            <tr>
                              <th className="px-4 py-3 border-b border-default-200">Producto</th>
                              <th className="px-4 py-3 border-b border-default-200 text-center">Cant.</th>
                              <th className="px-4 py-3 border-b border-default-200 text-right">Precio Unt.</th>
                              <th className="px-4 py-3 border-b border-default-200 text-center">Imp. %</th>
                              <th className="px-4 py-3 text-right border-b border-default-200">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-default-100">
                            {saleDetails.map((d, index) => {
                              const prod = products.find(p => String(p.idproduct) === String(d.productId));
                              const lineSubtotal = d.quantity * d.unitPrice;
                              return (
                                <tr key={`view-${d.productId}-${index}`} className="hover:bg-default-50 transition-colors">
                                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 max-w-[300px] truncate">
                                    {prod?.nameproduct || `Producto ID: ${d.productId}`}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {d.quantity}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    ${Number(d.unitPrice).toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {d.taxRate}%
                                  </td>
                                  <td className="px-4 py-3 text-right font-medium text-primary-600">
                                    ${lineSubtotal.toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* TOTALES */}
                  <div className="flex justify-end pt-4 border-t border-default-200">
                    <div className="w-full md:w-1/3 bg-gray-50 dark:bg-default-100 p-4 rounded-xl border border-default-200 space-y-2">
                       <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                         <span>Subtotal:</span>
                         <span className="font-medium">${Number(selectedSale.subtotal || 0).toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                         <span>Impuestos:</span>
                         <span className="font-medium">${Number(selectedSale.tax_total || 0).toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-default-200 mt-2">
                         <span>Total Final:</span>
                         <span className="text-success-600">${Number(selectedSale.total || 0).toFixed(2)}</span>
                       </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </ModalBody>
            <ModalFooter className="flex-shrink-0">
              <Button color="primary" variant="flat" onPress={onClose}>
                Cerrar Vista
              </Button>
            </ModalFooter>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}

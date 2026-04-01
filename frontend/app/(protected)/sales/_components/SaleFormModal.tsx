"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  ShoppingCart,
  User as UserIcon,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle,
  PackageSearch,
} from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Input,
  Autocomplete,
  AutocompleteItem,
  Divider,
} from "@heroui/react";

import { Sale, CreateSaleDTO, SaleDetailDTO } from "../_types/sales.types";
import { Customer } from "../../customers/_types/customers.types";
import { Product } from "../../products/_types/products.types";
import { PaymentForm } from "../../payment-forms/_types/payment-forms.types";

interface SaleFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSale: Sale | null;
  saleDetails: SaleDetailDTO[] | null;
  customers: Customer[];
  products: Product[];
  paymentForms: PaymentForm[];
  isLoading: boolean;
  error?: string | null;
  onSubmit: (data: CreateSaleDTO) => Promise<any>;
  onChangeStatus?: (status: "completed" | "cancelled") => Promise<void>;
}

export default function SaleFormModal({
  isOpen,
  onOpenChange,
  selectedSale,
  saleDetails,
  customers,
  products,
  paymentForms,
  isLoading,
  error,
  onSubmit,
  onChangeStatus,
}: SaleFormModalProps) {
  const [successData, setSuccessData] = useState<any>(null);

  const [customerId, setCustomerId] = useState<string>("");
  const [paymentFormId, setPaymentFormId] = useState<string>("");
  const [details, setDetails] = useState<SaleDetailDTO[]>([]);

  // Selected product input
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [qtyInput, setQtyInput] = useState<string>("1");

  useEffect(() => {
    if (isOpen) {
      if (selectedSale) {
        setCustomerId(selectedSale.customer_id.toString());
        setPaymentFormId(selectedSale.payment_form_id.toString());
        if (saleDetails) {
          setDetails(saleDetails);
        } else {
          setDetails([]);
        }
      } else {
        setCustomerId("");
        setPaymentFormId("");
        setDetails([]);
        setSelectedProductId("");
        setQtyInput("1");
      }
      setSuccessData(null);
    }
  }, [selectedSale, saleDetails, isOpen]);

  const addDetail = () => {
    if (!selectedProductId || !qtyInput) return;
    const qty = parseFloat(qtyInput);
    if (isNaN(qty) || qty <= 0) return;

    const prod = products.find((p) => String(p.idproduct) === selectedProductId);
    if (!prod) return;

    // Check if product already exists
    const existingIndex = details.findIndex(d => String(d.productId) === String(prod.idproduct));
    
    if (existingIndex >= 0) {
      // update quantity
      const newDetails = [...details];
      newDetails[existingIndex].quantity += qty;
      setDetails(newDetails);
    } else {
      setDetails([
        ...details,
        {
          productId: Number(prod.idproduct),
          quantity: qty,
          unitPrice: Number(prod.saleprice) || 0,
          discountRate: 0,
          taxRate: 0, // Default tax
          unitMeasureId: prod.measurementunit || 1, // Default to product measure
        },
      ]);
    }

    setSelectedProductId("");
    setQtyInput("1");
  };

  const removeDetail = (index: number) => {
    const newDetails = [...details];
    newDetails.splice(index, 1);
    setDetails(newDetails);
  };

  const updateDetailQty = (index: number, newQty: string) => {
    const qty = parseFloat(newQty);
    if (isNaN(qty) || qty <= 0) return;
    const newDetails = [...details];
    newDetails[index].quantity = qty;
    setDetails(newDetails);
  };

  const updateDetailPrice = (index: number, newPrice: string) => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) return;
    const newDetails = [...details];
    newDetails[index].unitPrice = price;
    setDetails(newDetails);
  };
  
  const updateDetailTax = (index: number, newTax: string) => {
    const taxRate = parseFloat(newTax);
    if (isNaN(taxRate) || taxRate < 0) return;
    const newDetails = [...details];
    newDetails[index].taxRate = taxRate;
    setDetails(newDetails);
  };

  const subtotalTotal = useMemo(() => {
    return details.reduce((acc, d) => acc + (d.quantity * d.unitPrice), 0);
  }, [details]);

  const taxTotalTotal = useMemo(() => {
    return details.reduce((acc, d) => acc + ((d.quantity * d.unitPrice) * (d.taxRate / 100)), 0);
  }, [details]);

  const subTotalDescTotal = useMemo(() => {
    return details.reduce((acc, d) => acc + ((d.quantity * d.unitPrice) * ((d.discountRate || 0) / 100)), 0);
  }, [details]);

  const totalFinal = subtotalTotal + taxTotalTotal - subTotalDescTotal;

  const isFormInvalid = !customerId || !paymentFormId || details.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormInvalid) return;

    try {
      const response = await onSubmit({
        customerId: Number(customerId),
        paymentFormId: Number(paymentFormId),
        details: details.map(d => ({
          ...d,
          productId: parseInt(String(d.productId), 10),
          unitPrice: Number(d.unitPrice),
          quantity: Number(d.quantity),
          taxRate: Number(d.taxRate),
          discountRate: Number(d.discountRate || 0),
          unitMeasureId: parseInt(String(d.unitMeasureId), 10)
        })),
      });

      setSuccessData(response);
    } catch (err) {
      console.error("Submission error:", err);
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
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <ModalHeader className="flex flex-col gap-1 border-b dark:border-default-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold">
                  {selectedSale ? "Editar Venta" : "Nueva Venta"}
                </h2>
              </div>
              <p className="text-xs font-normal text-gray-500">
                {selectedSale
                  ? `Modificando venta: ${selectedSale.reference_code}`
                  : "Registra una nueva transacción y descuenta el inventario"}
              </p>
            </ModalHeader>
            <ModalBody className="gap-6 py-4 overflow-y-auto w-full max-w-full">
              {error && (
                <div className="p-3 bg-danger-50 text-danger text-xs rounded-lg border border-danger-100 italic">
                  {error}
                </div>
              )}

              {successData ? (
                <div className="flex flex-col items-center justify-center p-8 text-center gap-3 animate-in fade-in zoom-in duration-300">
                  <div className="h-16 w-16 bg-success-100 rounded-full flex items-center justify-center border-4 border-success-50">
                    <CheckCircle className="h-10 w-10 text-success-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      ¡Operación Exitosa!
                    </h3>
                    <p className="text-sm text-gray-500">
                      {successData?.message || (selectedSale ? "La venta ha sido actualizada correctamente." : "La venta ha sido registrada correctamente.")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6 h-full">
                  {/* CABECERA */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      isRequired
                      label="Cliente"
                      placeholder="Selecciona un cliente"
                      startContent={<UserIcon className="h-4 w-4 text-gray-400" />}
                      variant="bordered"
                      selectedKeys={customerId ? [customerId] : []}
                      onSelectionChange={(keys) => setCustomerId(Array.from(keys)[0] as string)}
                    >
                      {customers.map((c) => (
                        <SelectItem key={String(c.idcustomer)} textValue={c.names}>
                          {c.names} ({c.identification})
                        </SelectItem>
                      ))}
                    </Select>

                    <Select
                      isRequired
                      label="Forma de Pago"
                      placeholder="Selecciona forma de pago"
                      startContent={<CreditCard className="h-4 w-4 text-gray-400" />}
                      variant="bordered"
                      selectedKeys={paymentFormId ? [paymentFormId] : []}
                      onSelectionChange={(keys) => setPaymentFormId(Array.from(keys)[0] as string)}
                    >
                      {paymentForms.map((pf) => (
                        <SelectItem key={String(pf.idpaymentform)} textValue={pf.name}>
                          {pf.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <Divider />

                  {/* AGREGAR PRODUCTOS */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <PackageSearch className="h-4 w-4 text-primary" /> Detalles de la Venta
                    </h4>
                    
                    <div className="flex items-end gap-2 bg-gray-50 dark:bg-default-100 p-3 rounded-xl border border-default-200">
                      <div className="flex-1">
                        <Autocomplete
                          label="Buscar Producto"
                          placeholder="Selecciona producto a vender..."
                          variant="bordered"
                          selectedKey={selectedProductId}
                          onSelectionChange={(key) => setSelectedProductId(key as string)}
                        >
                          {products.map((p) => (
                            <AutocompleteItem key={String(p.idproduct)} textValue={p.nameproduct}>
                              <div className="flex justify-between items-center">
                                <span>{p.nameproduct}</span>
                                <span className="text-xs text-gray-500">Stock: {p.stock} | ${Number(p.saleprice).toFixed(2)}</span>
                              </div>
                            </AutocompleteItem>
                          ))}
                        </Autocomplete>
                      </div>
                      <div className="w-24">
                        <Input
                          label="Cant."
                          type="number"
                          variant="bordered"
                          min={1}
                          value={qtyInput}
                          onValueChange={setQtyInput}
                        />
                      </div>
                      <Button
                        color="primary"
                        isIconOnly
                        size="lg"
                        onPress={addDetail}
                        isDisabled={!selectedProductId}
                        className="h-14 w-14"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* LISTADO DE DETALLES */}
                    <div className="bg-white dark:bg-default-50 border border-default-200 rounded-xl overflow-x-auto min-h-[200px]">
                      {details.length === 0 ? (
                        <div className="flex h-full items-center justify-center p-8 text-gray-400 text-sm">
                          No hay productos agregados a la venta.
                        </div>
                      ) : (
                        <table className="w-full text-sm text-left whitespace-nowrap">
                          <thead className="bg-gray-50 dark:bg-default-100 text-gray-500 uppercase text-xs">
                            <tr>
                              <th className="px-4 py-3 rounded-tl-xl border-b border-default-200">Producto</th>
                              <th className="px-4 py-3 border-b border-default-200">Cant.</th>
                              <th className="px-4 py-3 border-b border-default-200">Precio Unt.</th>
                              <th className="px-4 py-3 border-b border-default-200">Imp. %</th>
                              <th className="px-4 py-3 text-right border-b border-default-200">Subtotal</th>
                              <th className="px-4 py-3 rounded-tr-xl border-b border-default-200"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-default-100">
                            {details.map((d, index) => {
                              const prod = products.find(p => String(p.idproduct) === String(d.productId));
                              const lineSubtotal = d.quantity * d.unitPrice;
                              return (
                                <tr key={`${d.productId}-${index}`} className="hover:bg-default-50 transition-colors">
                                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 max-w-[200px] truncate">
                                    {prod?.nameproduct || `Prod ID: ${d.productId}`}
                                  </td>
                                  <td className="px-4 py-2 w-28">
                                    <Input
                                      type="number"
                                      size="sm"
                                      min={0.01}
                                      step={0.01}
                                      value={String(d.quantity)}
                                      onValueChange={(val) => updateDetailQty(index, val)}
                                      variant="faded"
                                    />
                                  </td>
                                  <td className="px-4 py-2 w-32">
                                    <Input
                                      type="number"
                                      size="sm"
                                      min={0}
                                      step={0.01}
                                      startContent={<span className="text-gray-400">$</span>}
                                      value={String(d.unitPrice)}
                                      onValueChange={(val) => updateDetailPrice(index, val)}
                                      variant="faded"
                                    />
                                  </td>
                                  <td className="px-4 py-2 w-28">
                                    <Input
                                      type="number"
                                      size="sm"
                                      min={0}
                                      step={0.1}
                                      endContent={<span className="text-gray-400">%</span>}
                                      value={String(d.taxRate)}
                                      onValueChange={(val) => updateDetailTax(index, val)}
                                      variant="faded"
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-right font-medium text-primary-600">
                                    ${lineSubtotal.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <Button
                                      isIconOnly
                                      color="danger"
                                      variant="light"
                                      size="sm"
                                      onPress={() => removeDetail(index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
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
                    <div className="w-full md:w-1/3 space-y-2">
                       <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                         <span>Subtotal:</span>
                         <span className="font-medium">${subtotalTotal.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                         <span>Impuestos:</span>
                         <span className="font-medium">${taxTotalTotal.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-default-200">
                         <span>Total:</span>
                         <span className="text-success-600">${totalFinal.toFixed(2)}</span>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="flex-shrink-0">
              {successData ? (
                <Button fullWidth color="primary" onPress={onClose}>
                  Finalizar
                </Button>
              ) : (
                <>
                  <Button variant="light" onPress={onClose}>
                    Cerrar
                  </Button>
                  {selectedSale && selectedSale.status === "pending" && onChangeStatus && (
                    <>
                      <Button color="danger" variant="flat" onPress={() => onChangeStatus("cancelled")}>
                        Cancelar Venta
                      </Button>
                      <Button color="success" onPress={() => onChangeStatus("completed")} className="text-white">
                        Completar Venta
                      </Button>
                    </>
                  )}
                  {(!selectedSale || selectedSale.status === "pending") && (
                    <Button
                      color="primary"
                      isDisabled={isFormInvalid}
                      isLoading={isLoading}
                      type="submit"
                    >
                      {selectedSale ? "Guardar Cambios" : "Procesar Venta"}
                    </Button>
                  )}
                </>
              )}
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}

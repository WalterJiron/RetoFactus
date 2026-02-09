// app/(protected)/productos/page.tsx
"use client";

import React from "react";
import {
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Plus, Package } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
import { FilterBar } from "@/components/common/FilterBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButtons } from "@/components/common/ActionButtons";
import { useTableData } from "@/hooks/useTableData";

// Tipos
type Product = {
  idproduct: string;
  code_reference: string;
  nameproduct: string;
  productdescription: string;
  stock: number;
  measurementunit: number;
  productactive: boolean;
  productdatecreate: string;
  idsubcategory: number;
  namesubcategory: string;
  subcategorydescription: string;
  subcategoryactive: boolean;
  idcategory: number;
  namecategory: string;
  categorydescription: string;
  categoryactive: boolean;
  purchaseprice: string;
  saleprice: string;
  minstock: number;
  datecreate: string;
  dateupdate: string | null;
  datedelete: string | null;
  active: boolean;
};

// Datos de ejemplo
const initialProducts: Product[] = [
  {
    idproduct: "30",
    code_reference: "978-840818",
    nameproduct: "Donde viven los monstruos",
    productdescription: "Álbum ilustrado de Maurice Sendak, tapa dura",
    stock: 26,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 15,
    namesubcategory: "Infantiles",
    subcategorydescription: "Libros para niños y jóvenes",
    subcategoryactive: true,
    idcategory: 5,
    namecategory: "Libros",
    categorydescription: "Libros de todos los géneros literarios",
    categoryactive: true,
    purchaseprice: "35.500",
    saleprice: "54.990",
    minstock: 5,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "29",
    code_reference: "978-842613",
    nameproduct: "El principito",
    productdescription:
      "Edición ilustrada del clásico de Antoine de Saint-Exupéry",
    stock: 37,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 15,
    namesubcategory: "Infantiles",
    subcategorydescription: "Libros para niños y jóvenes",
    subcategoryactive: true,
    idcategory: 5,
    namecategory: "Libros",
    categorydescription: "Libros de todos los géneros literarios",
    categoryactive: true,
    purchaseprice: "45.000",
    saleprice: "69.990",
    minstock: 15,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "28",
    code_reference: "978-846634",
    nameproduct: "El arte de la guerra",
    productdescription: "Tratado militar clásico de Sun Tzu, edición comentada",
    stock: 21,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 14,
    namesubcategory: "No Ficción",
    subcategorydescription: "Libros educativos y biografías",
    subcategoryactive: true,
    idcategory: 5,
    namecategory: "Libros",
    categorydescription: "Libros de todos los géneros literarios",
    categoryactive: true,
    purchaseprice: "11.250",
    saleprice: "19.990",
    minstock: 8,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "27",
    code_reference: "978-849992",
    nameproduct: "Sapiens: De animales a dioses",
    productdescription: "Breve historia de la humanidad por Yuval Noah Harari",
    stock: 29,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 14,
    namesubcategory: "No Ficción",
    subcategorydescription: "Libros educativos y biografías",
    subcategoryactive: true,
    idcategory: 5,
    namecategory: "Libros",
    categorydescription: "Libros de todos los géneros literarios",
    categoryactive: true,
    purchaseprice: "9.300",
    saleprice: "17.990",
    minstock: 10,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "26",
    code_reference: "978-843972",
    nameproduct: "1984",
    productdescription: "Novela distópica de George Orwell, edición tapa dura",
    stock: 17,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 13,
    namesubcategory: "Ficción",
    subcategorydescription: "Novelas y literatura de ficción",
    subcategoryactive: true,
    idcategory: 5,
    namecategory: "Libros",
    categorydescription: "Libros de todos los géneros literarios",
    categoryactive: true,
    purchaseprice: "15.800",
    saleprice: "26.990",
    minstock: 6,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "25",
    code_reference: "978-840102",
    nameproduct: "Cien años de soledad",
    productdescription:
      "Novela clásica de Gabriel García Márquez, edición especial",
    stock: 23,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 13,
    namesubcategory: "Ficción",
    subcategorydescription: "Novelas y literatura de ficción",
    subcategoryactive: true,
    idcategory: 5,
    namecategory: "Libros",
    categorydescription: "Libros de todos los géneros literarios",
    categoryactive: true,
    purchaseprice: "12.500",
    saleprice: "22.990",
    minstock: 8,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "24",
    code_reference: "LIT-CAT-FRONT",
    nameproduct: "Luces para bicicleta",
    productdescription: "Set delantero y trasero USB recargable, 800 lúmenes",
    stock: 25,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 12,
    namesubcategory: "Ciclismo",
    subcategorydescription: "Bicicletas y accesorios para ciclismo",
    subcategoryactive: true,
    idcategory: 4,
    namecategory: "Deportes",
    categorydescription: "Equipamiento y ropa deportiva",
    categoryactive: true,
    purchaseprice: "22.100",
    saleprice: "34.990",
    minstock: 12,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "23",
    code_reference: "HEL-GIRO-MTB",
    nameproduct: "Casco ciclismo",
    productdescription: "Casco de montaña Giro, ventilación MIPS, talla L",
    stock: 16,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 12,
    namesubcategory: "Ciclismo",
    subcategorydescription: "Bicicletas y accesorios para ciclismo",
    subcategoryactive: true,
    idcategory: 4,
    namecategory: "Deportes",
    categorydescription: "Equipamiento y ropa deportiva",
    categoryactive: true,
    purchaseprice: "38.750",
    saleprice: "59.990",
    minstock: 5,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "22",
    code_reference: "YOGA-MAT-8MM",
    nameproduct: "Esterilla de yoga",
    productdescription: "Esterilla antideslizante 8mm, TPE ecológico",
    stock: 39,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 11,
    namesubcategory: "Fitness",
    subcategorydescription: "Equipo para ejercicio y gimnasio",
    subcategoryactive: true,
    idcategory: 4,
    namecategory: "Deportes",
    categorydescription: "Equipamiento y ropa deportiva",
    categoryactive: true,
    purchaseprice: "18.200",
    saleprice: "31.990",
    minstock: 25,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "21",
    code_reference: "DMB-30KG",
    nameproduct: "Mancuernas ajustables",
    productdescription: "Par de mancuernas ajustables de 2x15kg, con rack",
    stock: 11,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 11,
    namesubcategory: "Fitness",
    subcategorydescription: "Equipo para ejercicio y gimnasio",
    subcategoryactive: true,
    idcategory: 4,
    namecategory: "Deportes",
    categorydescription: "Equipamiento y ropa deportiva",
    categoryactive: true,
    purchaseprice: "6.500",
    saleprice: "12.990",
    minstock: 20,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "20",
    code_reference: "SHG-NKE-MER",
    nameproduct: "Shin guards Nike",
    productdescription: "Espinilleras de fútbol Nike Mercurial, talla M",
    stock: 45,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 10,
    namesubcategory: "Fútbol",
    subcategorydescription: "Balones, uniformes y accesorios de fútbol",
    subcategoryactive: true,
    idcategory: 4,
    namecategory: "Deportes",
    categorydescription: "Equipamiento y ropa deportiva",
    categoryactive: true,
    purchaseprice: "8.900",
    saleprice: "16.990",
    minstock: 8,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "19",
    code_reference: "BAL-ADID-5",
    nameproduct: "Balón de fútbol",
    productdescription: "Balón oficial Adidas Champions League, tamaño 5",
    stock: 28,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 10,
    namesubcategory: "Fútbol",
    subcategorydescription: "Balones, uniformes y accesorios de fútbol",
    subcategoryactive: true,
    idcategory: 4,
    namecategory: "Deportes",
    categorydescription: "Equipamiento y ropa deportiva",
    categoryactive: true,
    purchaseprice: "15.750",
    saleprice: "29.990",
    minstock: 10,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "18",
    code_reference: "CVS-ABS-60X",
    nameproduct: "Cuadro abstracto",
    productdescription: "Cuadro decorativo moderno abstracto 60x80 cm",
    stock: 14,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 9,
    namesubcategory: "Decoración",
    subcategorydescription: "Artículos decorativos para el hogar",
    subcategoryactive: true,
    idcategory: 3,
    namecategory: "Hogar",
    categorydescription: "Artículos para el hogar y decoración",
    categoryactive: true,
    purchaseprice: "28.300",
    saleprice: "42.990",
    minstock: 10,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "17",
    code_reference: "LMP-SLT-FLR",
    nameproduct: "Lámpara de suelo",
    productdescription: "Lámpara de pie modernista con pantalla de lino, 150cm",
    stock: 7,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 9,
    namesubcategory: "Decoración",
    subcategorydescription: "Artículos decorativos para el hogar",
    subcategoryactive: true,
    idcategory: 3,
    namecategory: "Hogar",
    categorydescription: "Artículos para el hogar y decoración",
    categoryactive: true,
    purchaseprice: "12.800",
    saleprice: "19.990",
    minstock: 5,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "16",
    code_reference: "AIR-FRY-5L",
    nameproduct: "Freidora de aire",
    productdescription: "Freidora sin aceite 5L, 1500W, pantalla digital",
    stock: 12,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 8,
    namesubcategory: "Cocina",
    subcategorydescription: "Utensilios y electrodomésticos de cocina",
    subcategoryactive: true,
    idcategory: 3,
    namecategory: "Hogar",
    categorydescription: "Artículos para el hogar y decoración",
    categoryactive: true,
    purchaseprice: "65.250",
    saleprice: "99.990",
    minstock: 4,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "15",
    code_reference: "SET-KNF-6PC",
    nameproduct: "Juego de cuchillos",
    productdescription: "Set de 6 cuchillos profesionales de acero inoxidable",
    stock: 33,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 8,
    namesubcategory: "Cocina",
    subcategorydescription: "Utensilios y electrodomésticos de cocina",
    subcategoryactive: true,
    idcategory: 3,
    namecategory: "Hogar",
    categorydescription: "Artículos para el hogar y decoración",
    categoryactive: true,
    purchaseprice: "45.500",
    saleprice: "69.990",
    minstock: 8,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "14",
    code_reference: "DSK-OAK-120",
    nameproduct: "Escritorio de oficina",
    productdescription: "Escritorio de roble macizo 120x60 cm, con cajones",
    stock: 5,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 7,
    namesubcategory: "Muebles",
    subcategorydescription: "Mobiliario para el hogar",
    subcategoryactive: true,
    idcategory: 3,
    namecategory: "Hogar",
    categorydescription: "Artículos para el hogar y decoración",
    categoryactive: true,
    purchaseprice: "120.000",
    saleprice: "189.990",
    minstock: 2,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "13",
    code_reference: "SCR-BKC-CHR",
    nameproduct: "Silla de comedor",
    productdescription: "Silla de comedor estilo escandinavo en roble natural",
    stock: 9,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 7,
    namesubcategory: "Muebles",
    subcategorydescription: "Mobiliario para el hogar",
    subcategoryactive: true,
    idcategory: 3,
    namecategory: "Hogar",
    categorydescription: "Artículos para el hogar y decoración",
    categoryactive: true,
    purchaseprice: "85.000",
    saleprice: "129.990",
    minstock: 3,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "12",
    code_reference: "PTS-JOG-BLU",
    nameproduct: "Pantalón jogger infantil",
    productdescription: "Pantalón jogger de felpa azul, talla 6-7 años",
    stock: 31,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 6,
    namesubcategory: "Ropa Infantil",
    subcategorydescription: "Prendas para niños y niñas",
    subcategoryactive: true,
    idcategory: 2,
    namecategory: "Ropa",
    categorydescription: "Prendas de vestir para todas las edades",
    categoryactive: true,
    purchaseprice: "12.500",
    saleprice: "22.990",
    minstock: 15,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "11",
    code_reference: "TSH-CAR-INF",
    nameproduct: "Camiseta infantil",
    productdescription:
      "Camiseta de algodón con estampado de carros, talla 4-5 años",
    stock: 42,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 6,
    namesubcategory: "Ropa Infantil",
    subcategorydescription: "Prendas para niños y niñas",
    subcategoryactive: true,
    idcategory: 2,
    namecategory: "Ropa",
    categorydescription: "Prendas de vestir para todas las edades",
    categoryactive: true,
    purchaseprice: "8.900",
    saleprice: "16.990",
    minstock: 20,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "10",
    code_reference: "BLZ-LIN-WHT",
    nameproduct: "Blusa de lino",
    productdescription: "Blusa de lino blanco con detalles de encaje, talla M",
    stock: 24,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 5,
    namesubcategory: "Ropa Femenina",
    subcategorydescription: "Prendas para mujeres",
    subcategoryactive: true,
    idcategory: 2,
    namecategory: "Ropa",
    categorydescription: "Prendas de vestir para todas las edades",
    categoryactive: true,
    purchaseprice: "19.800",
    saleprice: "32.990",
    minstock: 10,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "9",
    code_reference: "VST-FLR-MID",
    nameproduct: "Vestido floral midi",
    productdescription: "Vestido floral de algodón con corte midi, talla S",
    stock: 19,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 5,
    namesubcategory: "Ropa Femenina",
    subcategorydescription: "Prendas para mujeres",
    subcategoryactive: true,
    idcategory: 2,
    namecategory: "Ropa",
    categorydescription: "Prendas de vestir para todas las edades",
    categoryactive: true,
    purchaseprice: "25.300",
    saleprice: "44.990",
    minstock: 8,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "8",
    code_reference: "JNS-DNM-SLI",
    nameproduct: "Jeans Denim Slim",
    productdescription:
      "Jeans ajustados de denim elastano, color azul oscuro, talla 32",
    stock: 27,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 4,
    namesubcategory: "Ropa Masculina",
    subcategorydescription: "Prendas para hombres",
    subcategoryactive: true,
    idcategory: 2,
    namecategory: "Ropa",
    categorydescription: "Prendas de vestir para todas las edades",
    categoryactive: true,
    purchaseprice: "22.750",
    saleprice: "39.990",
    minstock: 12,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "7",
    code_reference: "PLM-ALG-BLK",
    nameproduct: "Polo de algodón",
    productdescription:
      "Polo de algodón piqué para hombre, color negro, talla M",
    stock: 35,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 4,
    namesubcategory: "Ropa Masculina",
    subcategorydescription: "Prendas para hombres",
    subcategoryactive: true,
    idcategory: 2,
    namecategory: "Ropa",
    categorydescription: "Prendas de vestir para todas las edades",
    categoryactive: true,
    purchaseprice: "18.500",
    saleprice: "34.990",
    minstock: 15,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: false,
  },
  {
    idproduct: "6",
    code_reference: "JBL-FLIP6",
    nameproduct: "JBL Flip 6",
    productdescription: "Altavoz Bluetooth portátil resistente al agua IP67",
    stock: 18,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 3,
    namesubcategory: "Audio",
    subcategorydescription: "Auriculares, altavoces y sistemas de sonido",
    subcategoryactive: true,
    idcategory: 1,
    namecategory: "Electrónica",
    categorydescription: "Dispositivos electrónicos y gadgets",
    categoryactive: true,
    purchaseprice: "65.800",
    saleprice: "89.990",
    minstock: 10,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "5",
    code_reference: "SONY-WH1000",
    nameproduct: "Sony WH-1000XM4",
    productdescription:
      "Auriculares inalámbricos con cancelación de ruido activa",
    stock: 22,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 3,
    namesubcategory: "Audio",
    subcategorydescription: "Auriculares, altavoces y sistemas de sonido",
    subcategoryactive: true,
    idcategory: 1,
    namecategory: "Electrónica",
    categorydescription: "Dispositivos electrónicos y gadgets",
    categoryactive: true,
    purchaseprice: "180.250",
    saleprice: "249.990",
    minstock: 8,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "4",
    code_reference: "MBP-14-M1",
    nameproduct: 'MacBook Pro 14"',
    productdescription:
      "Laptop Apple M1 Pro, 16GB RAM, SSD 1TB, pantalla Liquid Retina XDR",
    stock: 4,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 2,
    namesubcategory: "Laptops",
    subcategorydescription: "Computadoras portátiles y notebooks",
    subcategoryactive: true,
    idcategory: 1,
    namecategory: "Electrónica",
    categorydescription: "Dispositivos electrónicos y gadgets",
    categoryactive: true,
    purchaseprice: "1250.000",
    saleprice: "1799.990",
    minstock: 2,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "3",
    code_reference: "HP-ENVY13",
    nameproduct: "HP Envy 13",
    productdescription:
      'Laptop 13.3" Intel Core i7, 16GB RAM, SSD 512GB, Windows 11',
    stock: 6,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 2,
    namesubcategory: "Laptops",
    subcategorydescription: "Computadoras portátiles y notebooks",
    subcategoryactive: true,
    idcategory: 1,
    namecategory: "Electrónica",
    categorydescription: "Dispositivos electrónicos y gadgets",
    categoryactive: true,
    purchaseprice: "850.000",
    saleprice: "1199.990",
    minstock: 2,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "2",
    code_reference: "IPH-13-128",
    nameproduct: "iPhone 13",
    productdescription:
      "Smartphone Apple con chip A15 Bionic, 128GB, pantalla Super Retina XDR",
    stock: 8,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 1,
    namesubcategory: "Smartphones",
    subcategorydescription: "Teléfonos inteligentes y accesorios",
    subcategoryactive: true,
    idcategory: 1,
    namecategory: "Electrónica",
    categorydescription: "Dispositivos electrónicos y gadgets",
    categoryactive: true,
    purchaseprice: "680.750",
    saleprice: "899.990",
    minstock: 3,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: true,
  },
  {
    idproduct: "1",
    code_reference: "SM-G980F",
    nameproduct: "Samsung Galaxy S20",
    productdescription: 'Smartphone Android con pantalla AMOLED 6.2", 128GB',
    stock: 15,
    measurementunit: 1,
    productactive: true,
    productdatecreate: "2026-02-08T00:43:04.934Z",
    idsubcategory: 1,
    namesubcategory: "Smartphones",
    subcategorydescription: "Teléfonos inteligentes y accesorios",
    subcategoryactive: true,
    idcategory: 1,
    namecategory: "Electrónica",
    categorydescription: "Dispositivos electrónicos y gadgets",
    categoryactive: true,
    purchaseprice: "420.500",
    saleprice: "599.990",
    minstock: 5,
    datecreate: "2026-02-08T00:43:04.934Z",
    dateupdate: null,
    datedelete: null,
    active: false,
  },
];

export default function ProductosPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [selectedStatus, setSelectedStatus] = React.useState("all");

  const tableData = useTableData({
    initialData: initialProducts,
    initialPage: 1,
    initialRowsPerPage: 10,
  });

  // Filtrado adicional por categoría y estado
  const filteredByCategoryAndStatus = React.useMemo(() => {
    return tableData.filteredData.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.namecategory === selectedCategory;
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && product.active) ||
        (selectedStatus === "inactive" && !product.active);
      return matchesCategory && matchesStatus;
    });
  }, [tableData.filteredData, selectedCategory, selectedStatus]);

  // Obtener categorías únicas
  const categories = React.useMemo(() => {
    return [...new Set(initialProducts.map((p) => p.namecategory))];
  }, []);

  // Formatear precio
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(Number(price));
  };

  // Definición de columnas
  const columns = [
    {
      key: "idproduct" as keyof Product,
      label: "Código",
      render: (value: string) => (
        <div className="font-mono font-semibold text-gray-900 dark:text-white">
          {value}
        </div>
      ),
    },
    {
      key: "nameproduct" as keyof Product,
      label: "Producto",
      render: (value: string, product: Product) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-white">
            {value}
          </span>
          <span className="text-sm text-gray-500 truncate max-w-xs">
            {product.productdescription}
          </span>
        </div>
      ),
    },
    {
      key: "namecategory" as keyof Product,
      label: "Categoría",
      render: (value: string, product: Product) => (
        <div className="flex flex-col gap-1">
          <Chip size="sm" variant="flat" color="primary">
            {value}
          </Chip>
          <span className="text-xs text-gray-500">
            {product.namesubcategory}
          </span>
        </div>
      ),
    },
    {
      key: "stock" as keyof Product,
      label: "Stock",
      render: (value: number, product: Product) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">{value}</div>
          <div className="text-xs text-gray-500">Mín: {product.minstock}</div>
        </div>
      ),
    },
    {
      key: "saleprice" as keyof Product,
      label: "Precios",
      render: (value: string, product: Product) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-green-600">
              {formatPrice(value)}
            </span>
            <span className="text-xs text-gray-500">venta</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-blue-600">
              {formatPrice(product.purchaseprice)}
            </span>
            <span className="text-xs text-gray-500">compra</span>
          </div>
        </div>
      ),
    },
    {
      key: "active" as keyof Product,
      label: "Estado",
      render: (value: boolean) => <StatusBadge status={value} />,
    },
    {
      key: "actions" as any,
      label: "Acciones",
      sortable: false,
      className: "text-right",
      render: (_: any, product: Product) => (
        <ActionButtons
          onView={() => {
            setSelectedProduct(product);
            onOpen();
          }}
          onEdit={() => console.log("Editar", product.idproduct)}
          onDelete={() => console.log("Eliminar", product.idproduct)}
        />
      ),
    },
  ];

  // Definición de filtros
  const filters = [
    {
      key: "category",
      label: "Categoría",
      value: selectedCategory,
      options: [
        { label: "Todas las categorías", value: "all" },
        ...categories.map((cat) => ({ label: cat, value: cat })),
      ],
      onChange: setSelectedCategory,
    },
    {
      key: "status",
      label: "Estado",
      value: selectedStatus,
      options: [
        { label: "Todos los estados", value: "all" },
        { label: "Activos", value: "active" },
        { label: "Inactivos", value: "inactive" },
      ],
      onChange: setSelectedStatus,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="h-8 w-8 text-primary-600" />
            Gestión de Productos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Administra y controla el inventario de productos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            color="primary"
            startContent={<Plus className="h-4 w-4" />}
            onPress={onOpen}
          >
            Nuevo Producto
          </Button>
        </div>
      </header>

      {/* Filtros y búsqueda */}
      <FilterBar
        searchTerm={tableData.searchTerm}
        onSearchChange={tableData.setSearchTerm}
        filters={filters}
        onClearFilters={() => {
          tableData.setSearchTerm("");
          setSelectedCategory("all");
          setSelectedStatus("all");
        }}
        placeholder="Buscar productos..."
      />

      {/* Tabla de productos */}
      <DataTable
        data={filteredByCategoryAndStatus.slice(
          (tableData.page - 1) * tableData.rowsPerPage,
          tableData.page * tableData.rowsPerPage
        )}
        columns={columns}
        sortConfig={tableData.sortConfig}
        onSort={tableData.handleSort}
        page={tableData.page}
        totalPages={Math.ceil(
          filteredByCategoryAndStatus.length / tableData.rowsPerPage
        )}
        onPageChange={tableData.setPage}
        rowsPerPage={tableData.rowsPerPage}
        onRowsPerPageChange={tableData.setRowsPerPage}
        title="Lista de Productos"
        emptyMessage="No hay productos que coincidan con los filtros"
      />

      {/* Modal para nuevo producto */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-bold">
                    {selectedProduct
                      ? "Detalles del Producto"
                      : "Nuevo Producto"}
                  </h2>
                </div>
              </ModalHeader>
              <ModalBody>
                {selectedProduct ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Código</label>
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                          {selectedProduct.code_reference}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nombre</label>
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                          {selectedProduct.nameproduct}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Descripción</label>
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        {selectedProduct.productdescription}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Categoría</label>
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                          {selectedProduct.namecategory}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Subcategoría
                        </label>
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                          {selectedProduct.namesubcategory}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Stock</label>
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                          {selectedProduct.stock} unidades
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p>Formulario para crear nuevo producto...</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" onPress={onClose}>
                  {selectedProduct ? "Cerrar" : "Guardar Producto"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

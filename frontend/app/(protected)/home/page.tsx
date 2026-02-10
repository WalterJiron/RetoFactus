"use client";
import React from "react";
import { Card, CardBody } from "@heroui/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { siteConfig } from "@/config/site";

export default function HomePage() {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

  return (
    <div className="space-y-8">
      {/* Encabezado principal */}
      <header>
        <section className="flex flex-col md:flex-row md:items-center justify-center gap-4">
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white ">
              Bienvenido Al Sistema
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Aquí está tu resumen de hoy, {date}
            </p>
          </div>
        </section>
      </header>

      {/* Accesos rápidos */}
      <article aria-labelledby="quick-access-title">
        <section className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-bold text-gray-900 dark:text-white"
            id="quick-access-title"
          >
            Accesos Rápidos
          </h2>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {siteConfig.quickAccess.map((access, index) => {
            const Icon = access.icon;

            return (
              <Link
                key={index}
                aria-label={`Ir a ${access.title}`}
                className="group block"
                href={access.href}
              >
                <Card className="h-full border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 hover:shadow-lg">
                  <CardBody className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br ${access.gradient} w-fit mb-4`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {access.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {access.description}
                        </p>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <span
                        className={`text-sm font-semibold ${access.statColor}`}
                      >
                        {access.stats}
                      </span>
                      <span className="text-xs text-gray-500">Acceder →</span>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </section>
      </article>
    </div>
  );
}

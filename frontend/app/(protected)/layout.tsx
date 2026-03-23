import { Metadata, Viewport } from "next";

import { siteConfig } from "@/config/site";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return (
    <main>
      <section className="flex min-h-screen">
        <Sidebar />

        {/* Contenido principal */}
        <div className="flex-1 pl-32">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
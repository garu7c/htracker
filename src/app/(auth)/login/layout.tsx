import React from "react";

// Layout mínimo para el segmento (auth)/signup.
// Debe exportar un default que reciba `children` en el App Router de Next.js
export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

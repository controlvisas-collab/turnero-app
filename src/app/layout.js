export const metadata = {
  title: "Turnero App",
  description: "Sistema de turnos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

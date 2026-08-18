import './globals.css';

export const metadata = {
  title: 'Panel de Proyectos',
  description: 'Seguimiento de avance de proyectos de práctica',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

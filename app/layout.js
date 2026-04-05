import "./globals.css";

export const metadata = {
  title: "Roqa Store",
  description: "Roqa Store wedding accessories shop"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}

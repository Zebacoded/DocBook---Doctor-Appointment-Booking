import "./globals.css";
import Header from "../components/Header";

export const metadata = {
  title: "DocBook - Doctor Appointments",
  description: "Find doctors and book appointments online",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
      </body>
    </html>
  );
}
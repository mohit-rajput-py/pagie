import "./globals.css";
import Footer from "@/components/Footer";

/**
 * Root Layout for Pagie
 * Loads Google Fonts and wraps the app
 */
export const metadata = {
  title: "Pagie — Markdown Editor",
  description: "A Notion-like WYSIWYG Markdown editor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <footer>
          {/* <Footer /> */}
        </footer>
      </body>
    </html>
  );
}

import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}

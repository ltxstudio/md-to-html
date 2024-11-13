import { Inter, Poppins } from "next/font/google";
import "./globals.css";

// Load fonts
const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({ subsets: ["latin"], weight: "400", style: "normal" });

export const metadata = {
  title: "Markdown to HTML Converter",
  description: "A powerful and easy-to-use Markdown to HTML converter that allows you to instantly convert Markdown into HTML format and customize it with optional CSS.",
  keywords: "Markdown to HTML, Markdown converter, HTML converter, web development, markdown editor, convert markdown, CSS styling, developer tools",
  author: "Saikothouse",
  openGraph: {
    title: "Markdown to HTML Converter",
    description: "Convert your Markdown text to HTML in real-time with an optional CSS editor. Perfect for developers, writers, and content creators.",
    url: "https://your-site.com", // Replace with actual URL of your app
    images: [
      {
        url: "/428a0bd3-ec00-4caa-be1c-a247728c5357.webp", // Replace with your own Open Graph image
        width: 800,
        height: 600,
        alt: "Markdown to HTML Converter App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@saikothouse", // Replace with your Twitter handle
    title: "Markdown to HTML Converter",
    description: "Instantly convert Markdown to HTML with an optional CSS editor. Perfect for web developers and content creators.",
    image: "/428a0bd3-ec00-4caa-be1c-a247728c5357.webp", // Replace with your own Open Graph image
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Meta tags for SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${inter.className} ${poppins.className}`}>
        {children}
      </body>
    </html>
  );
}

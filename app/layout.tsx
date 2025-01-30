import type { Metadata } from "next";
import { Rubik, Poppins } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import Header from "./components/Header";
import { Footer } from "./components/Footer";
import LightDarkToggle from "./components/layout/light-dark-toggle";

const rubik = Rubik({
  weight: '400',
  variable: '--font-rubik',
  subsets: ['latin']
});

const poppins = Poppins({
  weight: '400',
  variable: '--font-poppins',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: "SparkAgent Launchpad",
  description: "Launch the smartest AI agents in the SparkPoint ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="favicon.ico?v=2" />

        {/* Other favicon sizes */}
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />

        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=1" />

        {/* Android Chrome Icons */}
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />

        {/* Socmed metadata */}
        <meta name="description" content="We connect blockchain and AI to unlock new possibilities and drive exponential growth for businesses and communities" />
        <meta property="og:title" content="SparkPoint - The Smart Agents Platform" />
        <meta property="og:description" content="We connect blockchain and AI to unlock new possibilities and drive exponential growth for businesses and communities" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:type" content="website" />
        {/*<meta property="og:url" content="https://sparkpoint.io" />*/}
      </head>
      <ThirdwebProvider>
        <body
          className={`${rubik.variable} ${poppins.variable} antialiased`}
        >
          <LightDarkToggle />
          <Header />
          {children}
          <Footer />
        </body>
      </ThirdwebProvider>
    </html>
  );
}

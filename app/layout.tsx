import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/Toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://kabari.example.com",
  ),
  title: {
    default: "KABARI — Undangan Digital & Manajemen Acara",
    template: "%s · KABARI",
  },
  description:
    "Buat undangan digital, kelola RSVP, dan pindai QR tamu untuk acara Anda — semua dalam satu platform.",
  applicationName: "KABARI",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

/**
 * Browser extensions (BIS and similar) inject attributes like
 * `bis_skin_checked`, `__processed_<uuid>__`, and `bis_register` into
 * arbitrary elements before React hydrates. React then reports hydration
 * mismatches for every element the extension touched — `suppressHydrationWarning`
 * only suppresses the warning on the element it's set on, not on its
 * descendants, so a per-element fix is impractical.
 *
 * Instead, we run a tiny synchronous script *before* hydration that walks
 * the document and strips any attribute that the extension layer adds. The
 * selector list is intentionally broad; an attribute is removed iff the
 * name isn't part of the React-known set (data-*, aria-*, standard HTML
 * attrs). This keeps React's view of the DOM identical to the SSR output.
 */
const EXTENSION_ATTR_PREFIXES = ["bis_", "__processed_"];

const extensionAttrScript = `
(function () {
  var prefixes = ${JSON.stringify(EXTENSION_ATTR_PREFIXES)};
  function isExtensionAttr(name) {
    if (name === "suppresshydrationwarning" || name === "suppresscontenteditablewarning") return false;
    for (var i = 0; i < prefixes.length; i++) {
      if (name.indexOf(prefixes[i]) === 0) return true;
    }
    return false;
  }
  function clean(root) {
    if (!root || !root.attributes) return;
    var attrs = root.attributes;
    for (var i = attrs.length - 1; i >= 0; i--) {
      var attr = attrs[i];
      if (attr && isExtensionAttr(attr.name.toLowerCase())) {
        root.removeAttributeNode(attr);
      }
    }
    for (var j = 0; j < root.children.length; j++) clean(root.children[j]);
  }
  function removeCurrentAndWatch() {
    clean(document.documentElement);
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === "attributes" && isExtensionAttr(m.attributeName.toLowerCase())) {
          m.target.removeAttribute(m.attributeName);
        }
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      subtree: true,
    });
    // Keep the observer alive through hydration. Disconnect only after
    // the page is fully loaded plus a safety margin — dev mode with
    // Turbopack can take much longer than 2s to hydrate.
    function disconnect() { observer.disconnect(); }
    if (document.readyState === "complete") {
      setTimeout(disconnect, 5000);
    } else {
      addEventListener("load", function () { setTimeout(disconnect, 5000); });
    }
  }
  // First pass: the document is still being parsed, so only what's
  // available now gets cleaned. The observer handles the rest.
  clean(document.documentElement);
  // Re-run the full cleanup + observer once the DOM is fully parsed,
  // catching any elements the extension tagged during parsing.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", removeCurrentAndWatch);
  } else {
    removeCurrentAndWatch();
  }
})();
`.trim();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          // Runs before React hydrates. Removes browser-extension attributes
          // so React's client view of the DOM matches the SSR output.
          dangerouslySetInnerHTML={{ __html: extensionAttrScript }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-background text-foreground font-sans"
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

export const footerCopy = {
  description:
    "Crafting beautiful custom cakes for life’s sweetest moments.",
  email: "Sweetbitelahore@gmail.com",
  emailHref: "mailto:Sweetbitelahore@gmail.com",
  brandLine: "CUSTOM CAKES",
} as const;

/** Only routes that exist in the app */
export const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "All Menu", href: "/cakes/all" },
  { label: "Custom Cakes", href: "/custom-cake" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact Us", href: "/contact" },
] as const;

export const customerServiceLinks = [
  { label: "Track Order", href: "/my-order" },
  { label: "Reviews", href: "/reviews" },
  { label: "Contact Us", href: "/contact" },
] as const;

export const myAccountLinks = [
  { label: "Login", href: "/login" },
  { label: "Register", href: "/signup" },
  { label: "My Account", href: "/account" },
  { label: "My Orders", href: "/my-order" },
] as const;

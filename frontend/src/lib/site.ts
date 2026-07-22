export const siteConfig = {
  name: "DoughArt",
  tagline: "Custom Cakes",
  slogan: "Baked with love, designed just for you",
  address: "Main Market Gulberg 2 Lahore",
  phone: "03046736831",
  phoneHref: "tel:+923046736831",
  whatsapp: "03046736831",
  whatsappInternational: "923046736831",
  email: "Sweetbitelahore@gmail.com",
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Cakes", href: "/cakes" },
  { label: "Custom Cakes", href: "/custom-cake" },
  { label: "My Order", href: "/my-order" },
  { label: "Gallery", href: "/gallery" },
  { label: "Reviews", href: "/reviews" },
  { label: "Contact", href: "/contact" },
] as const;

export const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/sweetbitelahore" },
  { label: "Instagram", href: "https://www.instagram.com/sweetbitelahore/" },
  { label: "TikTok", href: "https://www.tiktok.com/@sweetbitelahore" },
] as const;

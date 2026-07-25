/**
 * Authoritative DoughArt public contact, WhatsApp, and social configuration.
 * All public frontend surfaces must read business contact details from here.
 * Do not store secrets in this file.
 */
export const contactInfo = {
  businessName: "DoughArt",
  phoneDisplay: "0327 7707333",
  phoneInternational: "+923277707333",
  phoneHref: "tel:+923277707333",
  whatsappDisplay: "0327 7707333",
  whatsappNumber: "923277707333",
  whatsappBaseUrl: "https://wa.me/923277707333",
  email: "doughartbakers@gmail.com",
  emailHref: "mailto:doughartbakers@gmail.com",
  address: "Thokkar Niaz Baig, Lahore, Punjab, Pakistan",
  businessHours: {
    weekdays: "Mon–Sat: 7:00 AM - 8:00 PM",
    sunday: "Sunday: 8:00 AM - 6:00 PM",
  },
  social: {
    instagram: "https://www.instagram.com/dough.art/",
    facebook: "https://www.facebook.com/artdough.1",
  },
} as const;

export type ContactInfo = typeof contactInfo;

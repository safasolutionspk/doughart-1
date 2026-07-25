export type BusinessSettings = {
  businessName: string;
  tagline?: string;
  phone: string;
  email: string;
  address: string;
  logo?: string;
  heroImage?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
  deliveryInfo?: string;
};

export type SettingsFormState = {
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  logo: string;
  heroImage: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
  deliveryInfo: string;
};

export const emptySettingsForm: SettingsFormState = {
  businessName: "",
  tagline: "",
  phone: "",
  email: "",
  address: "",
  logo: "",
  heroImage: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  whatsapp: "",
  deliveryInfo: "",
};

export function settingsToForm(settings: BusinessSettings): SettingsFormState {
  return {
    businessName: settings.businessName,
    tagline: settings.tagline ?? "",
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    logo: settings.logo ?? "",
    heroImage: settings.heroImage ?? "",
    facebook: settings.facebook ?? "",
    instagram: settings.instagram ?? "",
    tiktok: settings.tiktok ?? "",
    whatsapp: settings.whatsapp ?? "",
    deliveryInfo: settings.deliveryInfo ?? "",
  };
}

export function formToPayload(form: SettingsFormState) {
  return {
    businessName: form.businessName.trim(),
    tagline: form.tagline.trim() || undefined,
    phone: form.phone.trim(),
    email: form.email.trim(),
    address: form.address.trim(),
    logo: form.logo.trim() || undefined,
    heroImage: form.heroImage.trim() || undefined,
    facebook: form.facebook.trim() || undefined,
    instagram: form.instagram.trim() || undefined,
    tiktok: form.tiktok.trim() || undefined,
    whatsapp: form.whatsapp.trim() || undefined,
    deliveryInfo: form.deliveryInfo.trim() || undefined,
  };
}

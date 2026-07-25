const API_BASE_URL =

  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??

  "http://localhost:5000";



export type PublicSettings = {

  businessName: string;

  tagline?: string;

  email: string;

  phone: string;

  address: string;

  whatsapp?: string;

  deliveryInfo?: string;

};



let cachedSettings: PublicSettings | null = null;



export async function fetchPublicSettings(): Promise<PublicSettings | null> {

  if (cachedSettings) {

    return cachedSettings;

  }



  try {

    const response = await fetch(`${API_BASE_URL}/api/settings`, {

      next: { revalidate: 300 },

    });

    const body = (await response.json()) as {

      success: boolean;

      data?: PublicSettings;

    };

    if (response.ok && body.success && body.data) {

      cachedSettings = body.data;

      return body.data;

    }

  } catch {

    return null;

  }



  return null;

}



export function getWhatsAppDigitsFromSettings(

  settings: PublicSettings | null,

): string | null {

  const raw = settings?.whatsapp?.trim();

  if (!raw) {

    return null;

  }

  const digits = raw.replace(/\D/g, "");

  return digits.length > 0 ? digits : null;

}

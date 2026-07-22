/**
 * Bank transfer screenshot upload (checkout / My Order).
 * Phase 1: enable when using bank transfer manual verification flow.
 * Default off — set NEXT_PUBLIC_BANK_PROOF_UPLOAD_ENABLED=true to enable.
 */
export const bankProofUploadEnabled =
  process.env.NEXT_PUBLIC_BANK_PROOF_UPLOAD_ENABLED === "true";

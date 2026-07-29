export type EmailAnalyticsSummary = {
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  pending?: number;
};

export type EmailAttemptRow = {
  id: string;
  attemptedAt: string;
  emailType: string;
  audience: string;
  orderNumber: string | null;
  status: string;
  reasonCode: string | null;
  recipientMasked: string | null;
  provider: string;
};

export type EmailAttemptsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

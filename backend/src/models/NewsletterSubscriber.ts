import { Schema, model, type Document, type Model, type Types } from "mongoose";

export interface INewsletterSubscriber {
  tenantId?: Types.ObjectId;
  workspaceId?: Types.ObjectId;
  email: string;
  source: string;
  consent: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type INewsletterSubscriberDocument = INewsletterSubscriber & Document;

const newsletterSubscriberSchema = new Schema<INewsletterSubscriberDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant" },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace" },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    source: { type: String, required: true, trim: true, maxlength: 80 },
    consent: { type: Boolean, required: true },
  },
  { timestamps: true },
);

newsletterSubscriberSchema.index({ tenantId: 1 });
newsletterSubscriberSchema.index({ workspaceId: 1 });
newsletterSubscriberSchema.index({ tenantId: 1, workspaceId: 1 });

export const NewsletterSubscriber: Model<INewsletterSubscriberDocument> =
  model<INewsletterSubscriberDocument>(
    "NewsletterSubscriber",
    newsletterSubscriberSchema,
  );

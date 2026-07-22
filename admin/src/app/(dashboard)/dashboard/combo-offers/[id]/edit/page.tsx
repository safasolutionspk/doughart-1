import { CakeForm } from "@/components/catalog/CakeForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditComboOfferPage({ params }: PageProps) {
  const { id } = await params;
  return <CakeForm cakeId={id} mode="combo-offer" />;
}

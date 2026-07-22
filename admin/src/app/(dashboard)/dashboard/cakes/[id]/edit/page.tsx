import { CakeForm } from "@/components/catalog/CakeForm";

type EditCakePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCakePage({ params }: EditCakePageProps) {
  const { id } = await params;
  return <CakeForm cakeId={id} />;
}

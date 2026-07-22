export const orderProcessCopy = {
  subtitle: "How It Works",
  heading: "Simple Steps To Get Your Perfect Cake",
} as const;

export const orderProcessSteps = [
  {
    id: "design",
    step: 1,
    title: "Choose Your Design",
    description: "Share your ideas, flavours, and inspiration with our team.",
    icon: "/images/steps/design.png",
  },
  {
    id: "order",
    step: 2,
    title: "Place Your Order",
    description: "Confirm details, date, and delivery — we handle the rest.",
    icon: "/images/steps/order.png",
  },
  {
    id: "bake",
    step: 3,
    title: "We Bake With Love",
    description: "Our bakers craft your cake fresh with premium ingredients.",
    icon: "/images/steps/bake.png",
  },
  {
    id: "deliver",
    step: 4,
    title: "We Deliver To You",
    description: "Carefully packed and delivered right on time for your event.",
    icon: "/images/steps/delivery.png",
  },
] as const;

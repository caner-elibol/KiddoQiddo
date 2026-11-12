import { ChildLayout } from "@/components/layouts";

export default function ChildGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChildLayout>{children}</ChildLayout>;
}

import { ParentLayout } from "@/components/layouts";

export default function ParentGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ParentLayout>{children}</ParentLayout>;
}

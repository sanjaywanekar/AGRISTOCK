import DashboardWrapper from "../dashboardWrapper";

export default function IndustrialistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardWrapper>{children}</DashboardWrapper>;
}
import { useEffect, useMemo } from "react";
import Layout, { type BreadcrumbItem } from "@/layouts/Layout";
import { ChartAreaInteractive } from "@/components/charts/chart-area-interactive";
import { ChartBarStacked } from "@/components/charts/barCharts/chart-bar-stacked";
import { ChartBarDefault } from "@/components/charts/barCharts/chart-bar-default";
import { ChartBarMixed } from "@/components/charts/barCharts/chart-bar-mixed";
import PaymentsTable from "@/components/dataTable/PaymentsTable";
import data from "@/constants/paymentConstant";
import SplitText from "@/components/SplitText";
import { useAuth } from "@/contexts/AuthContext";
import CountUp from "@/components/CountUp";
import { Link } from "react-router-dom";

export default function Dashboard() {
  useEffect(() => {
    document.title = "CRAI - Dashboard";
  }, []);

  const { user } = useAuth();

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard" },
  ];

  const name = useMemo(() => {
    if (user?.fullName) return user.fullName;
    if (user?.name) return user.name;
    return user?.surname || 'Guest';
  }, [user]);

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <SplitText
          text={`Hello, ${name}!`}
          className="text-4xl font-semibold text-center leading-tight py-2"
          delay={30}
          duration={0.6}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          tag="h1"
          textAlign="center"
        />
        <ChartAreaInteractive />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <ChartBarDefault />
          <ChartBarStacked />
          <ChartBarMixed />
        </div>
        <PaymentsTable data={data} />
        <CountUp
          from={0}
          to={100}
          separator=","
          direction="up"
          duration={1}
          className="count-up-text text-4xl font-semibold text-center leading-tight py-2"
        />
        <Link to="/users" className="btn btn-primary w-full justify-center cursor-pointer">
          Go to Users
        </Link>
      </div>
    </Layout>
  );
}

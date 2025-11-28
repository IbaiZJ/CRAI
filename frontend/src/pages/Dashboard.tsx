import { useEffect } from "react";
import Layout from "@/layouts/Layout";
import { ChartAreaInteractive } from "@/components/charts/chart-area-interactive";
import { ChartBarStacked } from "@/components/charts/barCharts/chart-bar-stacked";
import { ChartBarDefault } from "@/components/charts/barCharts/chart-bar-default";
import { ChartBarMixed } from "@/components/charts/barCharts/chart-bar-mixed";

export default function Dashboard() {
  useEffect(() => {
    document.title = 'CRAI - Dashboard';
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <ChartAreaInteractive />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <ChartBarDefault />
          <ChartBarStacked />
          <ChartBarMixed />
        </div>
      </div>
    </Layout>
  );
}

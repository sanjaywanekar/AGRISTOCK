import { useGetDashboardMetricsQuery } from "@/state/api";
import { TrendingDown, TrendingUp } from "lucide-react";
import React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CardPurchaseSummary = () => {
  const { data, isLoading } =
    useGetDashboardMetricsQuery();

  const purchaseData = data?.purchaseSummary || [];

  const lastDataPoint =
  purchaseData[purchaseData.length - 1] || null;

const totalPurchased = purchaseData.reduce(
  (sum, item) => sum + Number(item.totalPurchased),
  0
);

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* HEADER */}

          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              Purchase Summary
            </h2>
          </div>

          {/* BODY */}

          <div>
            {/* BODY HEADER */}

            <div className="mb-4 mt-7 px-7">
              <p className="text-xs text-gray-400">
                Purchased
              </p>

              <div className="flex items-center">
                <p className="text-2xl font-bold">
                  {`₹${(totalPurchased / 1000).toFixed(2)}k`}
                </p>

                {lastDataPoint && (
                  <p
                    className={`text-sm ${
                      lastDataPoint.changePercentage! >=
                      0
                        ? "text-green-500"
                        : "text-red-500"
                    } flex ml-3`}
                  >
                    {lastDataPoint.changePercentage! >=
                    0 ? (
                      <TrendingUp className="w-5 h-5 mr-1" />
                    ) : (
                      <TrendingDown className="w-5 h-5 mr-1" />
                    )}

                    {Math.abs(
                      lastDataPoint.changePercentage!
                    ).toFixed(2)}
                    %
                  </p>
                )}
              </div>
            </div>

            {/* CHART */}

            <ResponsiveContainer
              width="100%"
              height={200}
              className="p-2"
            >
              <AreaChart
                data={purchaseData}
                margin={{
                  top: 0,
                  right: 0,
                  left: -50,
                  bottom: 45,
                }}
              >
                <XAxis
                  dataKey="date"
                  tick={false}
                  axisLine={false}
                />

                <YAxis
                  tickLine={false}
                  tick={false}
                  axisLine={false}
                />

                <Tooltip
                  formatter={(value: number) => [
                    `₹${value.toLocaleString("en-IN")}`,
                    "Purchased",
                  ]}
                  labelFormatter={(label) => {
                    const date = new Date(label);

                    return date.toLocaleDateString(
                      "en-IN",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    );
                  }}
                />

                <Area
                  type="linear"
                  dataKey="totalPurchased"
                  stroke="#8884d8"
                  fill="#8884d8"
                  dot={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default CardPurchaseSummary;
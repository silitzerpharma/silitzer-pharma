import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import "./chart.scss";

const Chart = ({ OrderData }) => {
  const [data, setData] = useState([]);
  const [average, setAverage] = useState(0);

  useEffect(() => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-based
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // total days in month

    const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
      name: (i + 1).toString(),
      total: 0,
    }));

    OrderData?.forEach((order) => {
      const orderDate = new Date(order.date);
      if (
        orderDate.getFullYear() === year &&
        orderDate.getMonth() === month
      ) {
        const day = orderDate.getDate();
        if (day >= 1 && day <= daysInMonth) {
          dailyData[day - 1].total += order.total;
        }
      }
    });

    setData(dailyData);

    // Calculate average total (avoid dividing by 0)
    const sum = dailyData.reduce((acc, cur) => acc + cur.total, 0);
    const avg = daysInMonth ? sum / daysInMonth : 0;
    setAverage(avg);
  }, [OrderData]);

  return (
    <div className="chart">
      <div className="title">
        Orders in {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
      </div>

      <ResponsiveContainer width={"100%"} aspect={2 / 1}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="total" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="name"
            label={{ value: "Day", position: "insideBottomRight", offset: -5 }}
          />
          <YAxis allowDecimals={false} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />

          {/* Average Reference Line */}
          <ReferenceLine
            y={average}
            label={`Avg: ${average.toFixed(2)}`}
            stroke="#9467bd"
            strokeDasharray="3 3"
          />

          <Area
            type="monotone"
            dataKey="total"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#total)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;

import React from 'react';
import "./featured.scss";
import MoreVertIcon from '@mui/icons-material/MoreVert';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Define consistent color mapping
const STATUS_COLORS = {
  Pending: "#FFA726",
  Approved: "#42A5F5",
  Processing: "#FFEB3B",
  Shipped: "#AB47BC",
  Delivered: "#66BB6A",
  Cancelled: "#EF5350",
  Hold: "#BDBDBD"
};

const Featured = ({ OrderStatusData = [] }) => {
  // Fallback to default order if needed
  const defaultStatuses = ['Pending', 'Approved', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Hold'];

  const data = defaultStatuses.map(status => {
    const found = OrderStatusData.find(item => item.status === status);
    return {
      name: status,
      value: found?.count || 0
    };
  });

  const totalOrders = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className='featured'>
      <div className="top">
        <h1 className='title'>Order Status Summary</h1>
        <MoreVertIcon fontSize='small' />
      </div>

      <div className='bottom'>
        <div className="featuredChart">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <p className="title">Total Orders: {totalOrders}</p>

        <div className="summary">
          {data.map((item) => (
            <div className="item" key={item.name}>
              <div className="itemtitle">{item.name}</div>
              <div className="itemresult">
                <div className="resultAmount">{item.value} Orders</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Featured;

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export interface ChartProps {
  title: string;
  datasets: {
    label: string;
    data: { x: number; y: number }[];
    color: string;
  }[];
  xTitle: string;
  yTitle: string;
  isLine?: boolean;
  showLegend?: boolean;
}

export const Chart = ({
  title,
  datasets: sets,
  isLine = false,
  xTitle,
  yTitle,
  showLegend = true,
}: ChartProps) => {
  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: xTitle,
        },
      },
      y: {
        title: {
          display: true,
          text: yTitle,
        },
      },
    },
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: title,
      },
      legend: {
        display: showLegend,
      },
    },
  };
  const datasets = sets.map((dataset) => {
    return {
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.color,
      backgroundColor: dataset.color,
      showLine: isLine,
    };
  });

  const data = {
    datasets,
  };

  return <Scatter options={options} data={data} />;
};

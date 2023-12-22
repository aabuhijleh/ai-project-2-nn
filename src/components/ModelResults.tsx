import { ModelResultData } from "@/logic";
import { Chart } from "./Charts";

export const ModelResults = ({
  epoch,
  trainResults,
  testResults,
}: ModelResultData) => {
  const lossChartInfo = {
    title: "Loss",
    datasets: [
      {
        label: "Loss",
        data: trainResults.trainingLossHistory,
        color: "red",
      },
    ],
    xTitle: "Epoch",
    yTitle: "Loss",
    isLine: true,
    showLegend: false,
  };

  const accuracyChartInfo = {
    title: "Accuracy",
    datasets: [
      {
        label: "Accuracy",
        data: trainResults.trainingAccuracyHistory,
        color: "green",
      },
    ],
    xTitle: "Epoch",
    yTitle: "Accuracy",
    isLine: true,
    showLegend: false,
  };

  return (
    <div className="flex justify-between items-center gap-12">
      <div className="w-[500px] p-4">
        <h2 className="text-lg font-bold mb-2">Model Results</h2>
        <div className="mb-4">
          <span className="font-medium">Number of Epochs: {epoch}</span>
        </div>
        <table className="min-w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Metric</th>
              <th className="border border-gray-300 p-2">Training Results</th>
              <th className="border border-gray-300 p-2">Testing Results</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Loss</td>
              <td className="border border-gray-300 p-2">
                {trainResults.loss.toFixed(4)}
              </td>
              <td className="border border-gray-300 p-2">
                {testResults.loss.toFixed(4)}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Accuracy</td>
              <td className="border border-gray-300 p-2">
                {trainResults.accuracy.toFixed(2)}%
              </td>
              <td className="border border-gray-300 p-2">
                {testResults.accuracy.toFixed(2)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <div className="bg-slate-200 w-[500px]">
          <Chart {...lossChartInfo} />
        </div>

        <div className="bg-slate-200 w-[500px]">
          <Chart {...accuracyChartInfo} />
        </div>
      </div>
    </div>
  );
};

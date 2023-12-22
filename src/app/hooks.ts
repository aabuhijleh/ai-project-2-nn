import { ChartProps } from "@/components/Charts";
import { prepareDatasetForChart } from "@/lib/utils";
import { DataSetInfo, NeuralNetworkUtils } from "@/logic";
import { useState, useEffect } from "react";

export const useLoadSampleDatasets = () => {
  const [sampleTrainingDatasets, setSampleTrainingDatasets] = useState<
    DataSetInfo[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSampleDatasets = async () => {
      const datasets = await NeuralNetworkUtils.loadSampleDatasets();
      setSampleTrainingDatasets(datasets);
      setLoading(false);
    };
    loadSampleDatasets();
  }, []);

  return { sampleTrainingDatasets, loading };
};

export const useDataset = (
  selectedDataset: string | undefined,
  trainingDatasets: DataSetInfo[]
) => {
  const [selectedDatasetInfo, setSelectedDatasetInfo] =
    useState<DataSetInfo | null>(null);
  const [selectedDatasetChartInfo, setSelectedDatasetChartInfo] =
    useState<ChartProps | null>(null);

  useEffect(() => {
    if (!selectedDataset) return;

    const trainingDataset = trainingDatasets.find(
      (d) => d.name === selectedDataset
    )!;

    const { datasets } = prepareDatasetForChart(trainingDataset.data.dataSet);
    setSelectedDatasetChartInfo({
      title: trainingDataset.name,
      datasets,
      xTitle: "Feature 1",
      yTitle: "Feature 2",
    });
    setSelectedDatasetInfo(trainingDataset);
  }, [selectedDataset, trainingDatasets]);

  return { selectedDatasetInfo, selectedDatasetChartInfo };
};

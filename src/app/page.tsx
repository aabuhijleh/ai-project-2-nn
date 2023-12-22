"use client";

import {
  NeuralNetwork,
  DataSetInfo,
  NeuralNetworkConfig,
  ModelResultData,
  NeuralNetworkUtils,
} from "@/logic";
import { useDataset, useLoadSampleDatasets } from "./hooks";
import { NeuralNetworkVisualization } from "@/components/NeuralNetworkVisualization";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { useEffect, useRef, useState } from "react";
import { Chart } from "@/components/Charts";
import { Button } from "@/components/ui/button";
import { Loader2, Play, Upload } from "lucide-react";
import { ModelResults } from "@/components/ModelResults";
import { ConfigForm } from "@/components/ConfigForm";
import { DEFAULT_CONFIG } from "./config";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { PredictForm } from "@/components/PredictForm";
import { Input } from "@/components/ui/input";
import { set } from "react-hook-form";

export default function Home() {
  const { sampleTrainingDatasets, loading } = useLoadSampleDatasets();
  const [trainingDatasets, setTrainingDatasets] = useState<DataSetInfo[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string | undefined>();
  const { selectedDatasetInfo, selectedDatasetChartInfo } = useDataset(
    selectedDataset,
    trainingDatasets
  );
  const [trainingProgress, setTrainingProgress] = useState({
    loading: false,
    done: false,
  });
  const [result, setResult] = useState<ModelResultData | null>(null);
  const [config, setConfig] = useState<NeuralNetworkConfig>(DEFAULT_CONFIG);
  const [neuralNetwork, setNeuralNetwork] = useState<NeuralNetwork | null>(
    null
  );
  const [predictedClass, setPredictedClass] = useState<string>("❓");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const trainingDataset = await NeuralNetworkUtils.loadTrainingData(
      files[0],
      true
    );
    setTrainingDatasets([
      ...trainingDatasets,
      { name: files[0].name, data: trainingDataset },
    ]);
    setSelectedDataset(files[0].name);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const train = async ({
    config,
    dataSetInfo,
    delay = 1000,
    showToast = true,
  }: {
    config: NeuralNetworkConfig;
    dataSetInfo: DataSetInfo;
    delay?: number;
    showToast?: boolean;
  }) => {
    setTrainingProgress({ loading: true, done: false });
    await new Promise((resolve) => setTimeout(resolve, delay));
    const { data } = dataSetInfo;
    const { dataSet } = data;

    const nn = new NeuralNetwork(config);
    setNeuralNetwork(nn);

    const result = await nn.fit(dataSet);
    setResult(result);

    setTrainingProgress({ loading: false, done: true });

    if (!showToast) {
      return;
    }

    toast({
      title: "✅ Training complete!",
      description: "The neural network has finished training.",
    });
    document.getElementById("results")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!loading) {
      setTrainingDatasets(sampleTrainingDatasets);
      setSelectedDataset(sampleTrainingDatasets[0].name);
      train({
        config: DEFAULT_CONFIG,
        dataSetInfo: sampleTrainingDatasets[0],
        delay: 0,
        showToast: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading || trainingDatasets.length === 0) {
    return <Loader2 className="w-10 h-10 animate-spin" />;
  }

  return (
    <main className="flex flex-col min-h-screen items-center p-24 gap-12">
      <section id="config" className="w-full p-12 bg-slate-800">
        <ConfigForm
          onConfigUpdated={(config) => {
            setConfig(config);
            document.getElementById("dataset")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
        />
      </section>

      <section
        id="dataset"
        className="flex w-full items-center justify-between p-12 gap-12 bg-slate-800"
      >
        <div className="flex flex-col w-[500px] gap-6">
          <div className="flex gap-4">
            <Select
              value={selectedDataset}
              onValueChange={(value) => {
                setSelectedDataset(value);
              }}
            >
              <SelectTrigger className="w-[500px]">
                <SelectValue placeholder="Select a dataset" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {trainingDatasets.map((dataset) => (
                    <SelectItem key={dataset.name} value={dataset.name}>
                      {dataset.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <Button onClick={triggerFileInput}>
              <Upload className="mr-2 w-4 h-4" />
              Upload a dataset
            </Button>
          </div>

          {selectedDatasetChartInfo && (
            <div className="bg-slate-200 w-[500px]">
              <Chart {...selectedDatasetChartInfo} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <NeuralNetworkVisualization layers={config.layers} />
        </div>

        <div className="flex flex-col gap-4 w-40">
          {selectedDatasetInfo && (
            <Button
              className="w-full bg-green-500 hover:bg-green-600"
              disabled={trainingProgress.loading}
              onClick={() => {
                train({
                  config,
                  dataSetInfo: selectedDatasetInfo,
                });
              }}
            >
              {trainingProgress.loading ? (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              ) : (
                <Play className="mr-2 w-4 h-4" />
              )}
              Train
            </Button>
          )}

          <PredictForm
            onPredictSubmit={(input) => {
              if (!neuralNetwork || !selectedDatasetInfo) {
                return;
              }
              const output = neuralNetwork.predict(input);
              console.log(output);
              if (output.length > 1) {
                const outputMap = NeuralNetworkUtils.createLabelPredictionMap(
                  output,
                  selectedDatasetInfo.data.classes
                );
                const { maxKey } = NeuralNetworkUtils.findMaxEntry(outputMap);
                setPredictedClass(maxKey);
                return;
              }
              const predictedClass = NeuralNetworkUtils.mapPredictionToLabel(
                output[0],
                selectedDatasetInfo.data.classes
              );
              setPredictedClass(predictedClass);
            }}
          />

          <div className="font-bold self-center">
            Class: <span className="text-green-500">{predictedClass}</span>
          </div>
        </div>
      </section>

      <section id="results" className="w-full p-12 bg-slate-800">
        {result && <ModelResults {...result} />}
      </section>

      <Toaster />
    </main>
  );
}

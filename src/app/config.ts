import { NeuralNetworkConfig } from "@/logic";

export const DEFAULT_CONFIG: NeuralNetworkConfig = {
  layers: [
    [2, "Input"],
    [4, "Softmax"],
  ],
  learningRate: 0.1,
  maxEpochs: 500,
  goal: {
    metric: "MSE",
    error: 0.001,
  },
  testDataRatio: 0.3,
};

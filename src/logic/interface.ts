export type DataSet = Array<{
  input: number[];
  target: number[];
  label: string;
}>;

export interface NeuralNetworkConfig {
  layers: Layer[];
  learningRate: number;
  maxEpochs: number;
  goal: Goal;
  testDataRatio: number;
}

export type Layer = [number, ActivationFunction];

export type ActivationFunction =
  | "Sigmoid"
  | "Tanh"
  | "ReLU"
  | "LeakyReLU"
  | "Softmax"
  | "Input";

export type Goal = {
  metric: "SSE" | "MSE" | "CrossEntropy";
  error: number;
};

export type DataSetInfo = {
  name: string;
  data: {
    dataSet: DataSet;
    classes: string[];
    classLegend: Record<string, number>;
  };
};

export type ModelResultData = {
  epoch: number;
  trainResults: {
    trainingLossHistory: {
      x: number;
      y: number;
    }[];
    trainingAccuracyHistory: {
      x: number;
      y: number;
    }[];
    loss: number;
    accuracy: number;
  };
  testResults: {
    loss: number;
    accuracy: number;
  };
};

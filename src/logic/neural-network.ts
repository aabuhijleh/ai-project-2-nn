import * as math from "mathjs";
import { NeuralNetworkUtils } from "./neural-network-utils";
import type {
  ActivationFunction,
  DataSet,
  Goal,
  Layer,
  ModelResultData,
  NeuralNetworkConfig,
} from "./interface";

export class NeuralNetwork {
  private layers: Layer[];
  private learningRate: number;
  private maxEpochs: number;
  private goal: Goal;
  private testDataRatio: number;

  private weights: number[][][] = [];
  private biases: number[][] = [];

  constructor({
    layers,
    learningRate,
    maxEpochs,
    goal,
    testDataRatio,
  }: NeuralNetworkConfig) {
    this.layers = layers;
    this.learningRate = learningRate;
    this.maxEpochs = maxEpochs;
    this.goal = goal;
    this.testDataRatio = testDataRatio;

    if (layers.length < 2) {
      throw new Error("At least two layers (input and output) are required");
    }

    for (let i = 0; i < layers.length - 1; i++) {
      const currentLayerSize = layers[i][0];
      const nextLayerSize = layers[i + 1][0];

      const { weights, biases } = this.initializeWeightsAndBiases(
        currentLayerSize,
        nextLayerSize
      );
      this.weights.push(weights);
      this.biases.push(biases);
    }
  }

  // 1. Initialization
  private initializeWeightsAndBiases(
    inputLayerSize: number,
    outputLayerSize: number
  ) {
    const upperLimit = 2.4 / inputLayerSize;
    const lowerLimit = -2.4 / inputLayerSize;

    const weightsMatrix = math.random(
      [inputLayerSize, outputLayerSize],
      lowerLimit,
      upperLimit
    );
    const weights = weightsMatrix.valueOf() as number[][];

    const biasesVector = math.random([outputLayerSize], lowerLimit, upperLimit);
    const biases = biasesVector.valueOf() as number[];

    return { weights, biases };
  }

  // 2. Activation
  private forward(input: number[]) {
    let output = input;
    let hiddenOutputs = [];

    // Iterate through each layer
    for (let i = 0; i < this.layers.length - 1; i++) {
      // Apply weights and biases
      output = math.subtract(
        math.multiply(output, this.weights[i]),
        this.biases[i]
      );

      // Check if we are not at the last layer or if the network is not just input-output
      if (i < this.layers.length - 2) {
        const activationFunctionName = this.layers[i + 1][1];
        const activationFunction = NeuralNetworkUtils.getFunction(
          activationFunctionName
        );
        output = math.map(output, (value: number) => activationFunction(value));

        // Store the output for each hidden layer
        hiddenOutputs.push(output);
      }
    }

    const outputActivationFunctionName = this.layers[this.layers.length - 1][1];
    if (outputActivationFunctionName === "Softmax") {
      output = NeuralNetworkUtils.softmax(output);
    } else {
      const outputActivationFunction = NeuralNetworkUtils.getFunction(
        outputActivationFunctionName
      );
      output = math.map(output, (value: number) =>
        outputActivationFunction(value)
      );
    }

    return { hiddenOutputs, output };
  }

  // 3. Training
  private train(input: number[], target: number[]) {
    // Forward pass
    const { hiddenOutputs, output } = this.forward(input);

    // Calculate delta for the output layer
    let currentDelta = this.calculateOutputDelta(
      output,
      target,
      this.layers[this.layers.length - 1][1]
    );

    // Iterate through each layer in reverse for the backward pass
    for (let i = this.layers.length - 2; i >= 0; i--) {
      const prevLayerOutput = i > 0 ? hiddenOutputs[i - 1] : input;

      // Calculate deltas for the current layer
      const { weightDeltas, biasDeltas } = this.calculateDeltas(
        prevLayerOutput,
        currentDelta
      );

      // Update weights and biases for the current layer
      this.updateWeightsAndBiases(i, weightDeltas, biasDeltas);

      // Prepare the delta for the next iteration (previous layer)
      if (i > 0) {
        const layerActivationFunctionName = this.layers[i][1];
        const layerActivationFunctionDerivative =
          NeuralNetworkUtils.getFunctionDerivative(layerActivationFunctionName);
        const weights = this.weights[i];
        currentDelta = this.calculateLayerDelta(
          currentDelta,
          weights,
          hiddenOutputs[i - 1],
          layerActivationFunctionDerivative
        );
      }
    }
  }

  private calculateOutputDelta(
    output: number[],
    target: number[],
    activationFunctionName: ActivationFunction
  ) {
    if (activationFunctionName === "Softmax") {
      return math.subtract(output, target);
    } else {
      const outputError = math.subtract(target, output);
      const outputActivationFunctionDerivative =
        NeuralNetworkUtils.getFunctionDerivative(activationFunctionName);
      return math.map(
        output,
        (value, i) => outputActivationFunctionDerivative(value) * outputError[i]
      );
    }
  }

  private calculateDeltas(input: number[], delta: number[]) {
    const inputMatrix = math.transpose([input]);
    const deltaMatrix = [delta];
    const weightDeltasMatrix = math.multiply(inputMatrix, deltaMatrix);
    const weightDeltas = math.multiply(this.learningRate, weightDeltasMatrix);
    const biasDeltas = math.multiply(this.learningRate * -1, delta);

    return {
      weightDeltas: weightDeltas.valueOf() as number[][],
      biasDeltas: biasDeltas.valueOf() as number[],
    };
  }

  private calculateLayerDelta(
    currentDelta: number[],
    weights: number[][],
    layerOutput: number[],
    activationFunctionDerivative: Function
  ) {
    return math.map(
      math.multiply(currentDelta, math.transpose(weights)),
      (value, j) => activationFunctionDerivative(layerOutput[j]) * value
    );
  }

  private updateWeightsAndBiases(
    layerIndex: number,
    weightDeltas: number[][],
    biasDeltas: number[]
  ) {
    const update =
      this.layers[this.layers.length - 1][1] === "Softmax"
        ? math.subtract
        : math.add;

    this.weights[layerIndex] = update(
      math.matrix(this.weights[layerIndex]),
      weightDeltas
    ).valueOf() as number[][];

    this.biases[layerIndex] = update(
      this.biases[layerIndex],
      biasDeltas
    ).valueOf() as number[];
  }

  // 4. Iteration
  public async fit(trainingData: DataSet): Promise<ModelResultData> {
    // Shuffle the dataset to prevent bias
    NeuralNetworkUtils.shuffleArray(trainingData);

    // Split the dataset into training and testing sets
    const splitIndex = Math.floor(trainingData.length * this.testDataRatio);
    const trainSet = trainingData.slice(0, splitIndex);
    const testSet = trainingData.slice(splitIndex);

    let epoch = 0;
    let trainResults = { loss: Infinity, accuracy: 0 };
    let testResults = { loss: 0, accuracy: 0 };

    let trainingLossHistory: { x: number; y: number }[] = [];
    let trainingAccuracyHistory: { x: number; y: number }[] = [];

    while (epoch < this.maxEpochs && trainResults.loss > this.goal.error) {
      epoch++;
      // Train the model on the train set
      trainResults = this.evaluateModel(trainSet, true);

      // Track training loss and accuracy
      trainingLossHistory.push({ x: epoch, y: trainResults.loss });
      trainingAccuracyHistory.push({ x: epoch, y: trainResults.accuracy });
    }

    // Evaluate the model on the test set
    testResults = this.evaluateModel(testSet, false);

    return {
      epoch,
      trainResults: {
        ...trainResults,
        trainingLossHistory,
        trainingAccuracyHistory,
      },
      testResults: { ...testResults },
    };
  }

  private evaluateModel(dataSet: DataSet, isTraining: boolean) {
    let loss = 0;
    let correctPredictions = 0;

    dataSet.forEach((data) => {
      if (isTraining) {
        this.train(data.input, data.target);
      }

      const { output } = this.forward(data.input);

      // Calculate loss
      switch (this.goal.metric) {
        case "CrossEntropy":
          loss += NeuralNetworkUtils.calculateCrossEntropy(output, data.target);
          break;
        case "SSE":
        case "MSE":
          loss += NeuralNetworkUtils.calculateSSE(output, data.target);
          break;
        default:
          throw new Error("Unknown goal metric");
      }

      // Calculate accuracy
      if (data.target.length === 1) {
        // Binary classification
        const predicted = output[0] > 0.5 ? 1 : 0;
        const target = data.target[0];
        if (predicted === target) {
          correctPredictions++;
        }
      } else {
        // Multi-class classification
        const predictedIndex = output.indexOf(Math.max(...output));
        const targetIndex = data.target.indexOf(Math.max(...data.target));
        if (predictedIndex === targetIndex) {
          correctPredictions++;
        }
      }
    });

    // Finalize loss and accuracy calculation
    if (this.goal.metric === "CrossEntropy" || this.goal.metric === "MSE") {
      loss /= dataSet.length;
    }
    const accuracy = (correctPredictions / dataSet.length) * 100;

    return { loss, accuracy };
  }

  public predict(input: number[]) {
    const { output } = this.forward(input);
    return output;
  }
}

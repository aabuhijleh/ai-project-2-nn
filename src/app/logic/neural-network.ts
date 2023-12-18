import * as math from "mathjs";
import { Utils } from "./utils";

export class NeuralNetwork {
  private inputLayerSize: number = 2;
  private hiddenLayerSize: number = 2;
  private outputLayerSize: number = 1;
  private learningRate: number = 0.1;

  private weightsInputHidden: number[][];
  private weightsHiddenOutput: number[][];
  private biasHidden: number[];
  private biasOutput: number[];

  private hiddenActivationFunction: Function = () => {};
  private hiddenActivationFunctionDerivative: Function = () => {};

  private outputActivationFunction: Function = () => {};
  private outputActivationFunctionDerivative: Function = () => {};

  constructor(
    hiddenActivationFunction = "tanh",
    outputActivationFunction = "tanh"
  ) {
    const { weights: weightsInputHidden, biases: biasHidden } =
      this.initializeWeightsAndBiases(
        this.inputLayerSize,
        this.hiddenLayerSize
      );
    this.weightsInputHidden = weightsInputHidden;
    this.biasHidden = biasHidden;

    const { weights: weightsHiddenOutput, biases: biasOutput } =
      this.initializeWeightsAndBiases(
        this.hiddenLayerSize,
        this.outputLayerSize
      );
    this.weightsHiddenOutput = weightsHiddenOutput;
    this.biasOutput = biasOutput;

    this.setActivationFunction({
      layer: "hidden",
      funcName: hiddenActivationFunction,
    });

    this.setActivationFunction({
      layer: "output",
      funcName: outputActivationFunction,
    });
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

  private setActivationFunction({
    layer,
    funcName,
  }: {
    layer: string;
    funcName: string;
  }) {
    let func, funcDerivative;
    switch (funcName) {
      case "sigmoid":
        func = Utils.sigmoid;
        funcDerivative = Utils.sigmoidDerivative;
        break;
      case "relu":
        func = Utils.relu;
        funcDerivative = Utils.reluDerivative;
        break;
      case "tanh":
      default:
        func = Utils.tanh;
        funcDerivative = Utils.tanhDerivative;
        break;
    }

    switch (layer) {
      case "hidden":
        this.hiddenActivationFunction = func;
        this.hiddenActivationFunctionDerivative = funcDerivative;
        break;
      case "output":
        this.outputActivationFunction = func;
        this.outputActivationFunctionDerivative = funcDerivative;
        break;
    }
  }

  // 2. Activation
  private forward(input: number[]) {
    const hidden = math.map(
      math.subtract(
        math.multiply(input, this.weightsInputHidden),
        this.biasHidden
      ),
      (value: number) => this.hiddenActivationFunction(value)
    );

    const output = math.map(
      math.subtract(
        math.multiply(hidden, this.weightsHiddenOutput),
        this.biasOutput
      ),
      (value: number) => this.outputActivationFunction(value)
    );

    return { hidden, output };
  }

  // 3. Training
  private train(input: number[], target: number[]) {
    // Forward pass
    const { hidden, output } = this.forward(input);

    // Backward pass
    const outputError = math.subtract(target, output);
    const outputDelta = math.map(
      output,
      (value, i) =>
        this.outputActivationFunctionDerivative(value) * outputError[i]
    );

    // Calculate weight and bias deltas for the hidden-output layer
    const {
      weightDeltas: weightDeltasHiddenOutput,
      biasDeltas: biasDeltasOutput,
    } = this.calculateDeltas(hidden, outputDelta);

    // Calculate hidden layer delta
    const hiddenDelta = this.calculateHiddenDelta(hidden, outputDelta);

    // Calculate weight and bias deltas for the input-hidden layer
    const {
      weightDeltas: weightDeltasInputHidden,
      biasDeltas: biasDeltasInput,
    } = this.calculateDeltas(input, hiddenDelta);

    // Update weights and biases
    this.updateWeightsAndBiases(
      weightDeltasInputHidden,
      biasDeltasInput,
      weightDeltasHiddenOutput,
      biasDeltasOutput
    );
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

  private calculateHiddenDelta(hidden: number[], outputDelta: number[]) {
    const hiddenDelta = [];
    for (let i = 0; i < hidden.length; i++) {
      const hiddenGradient = this.hiddenActivationFunctionDerivative(hidden[i]);
      let weight = 0;
      for (let j = 0; j < outputDelta.length; j++) {
        weight += outputDelta[j] * this.weightsHiddenOutput[i][j];
      }
      hiddenDelta.push(hiddenGradient * weight);
    }
    return hiddenDelta;
  }

  private updateWeightsAndBiases(
    weightDeltasInputHidden: number[][],
    biasDeltasInput: number[],
    weightDeltasHiddenOutput: number[][],
    biasDeltasOutput: number[]
  ) {
    this.weightsInputHidden = math
      .add(math.matrix(this.weightsInputHidden), weightDeltasInputHidden)
      .valueOf() as number[][];
    this.biasHidden = math
      .add(this.biasHidden, biasDeltasInput)
      .valueOf() as number[];
    this.weightsHiddenOutput = math
      .add(math.matrix(this.weightsHiddenOutput), weightDeltasHiddenOutput)
      .valueOf() as number[][];
    this.biasOutput = math
      .add(this.biasOutput, biasDeltasOutput)
      .valueOf() as number[];
  }

  // 4. Iteration
  public fit(
    trainingData: Array<{ input: number[]; target: number[] }>,
    threshold: number,
    maxEpochs: number = 100000
  ) {
    let epoch = 0;
    let sse = Infinity;

    while (sse > threshold && epoch < maxEpochs) {
      epoch++;
      sse = 0;
      trainingData.forEach((data) => {
        this.train(data.input, data.target);
        const { output } = this.forward(data.input);
        sse += Math.pow(data.target[0] - output[0], 2);
      });
      sse /= trainingData.length;
    }

    console.log("Epochs:", epoch, "SSE:", sse);
  }

  public predict(input: number[]) {
    const { output } = this.forward(input);
    return output;
  }
}

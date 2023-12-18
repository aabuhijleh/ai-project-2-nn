import Papa from "papaparse";
import { ActivationFunction, DataSet, DataSetInfo } from "./interface";

export class NeuralNetworkUtils {
  public static sigmoid(x: number) {
    return 1 / (1 + Math.exp(-x));
  }

  public static sigmoidDerivative(x: number) {
    return x * (1 - x);
  }

  public static tanh(x: number) {
    return Math.tanh(x);
  }

  public static tanhDerivative(x: number) {
    return 1 - Math.pow(Math.tanh(x), 2);
  }

  public static relu(x: number) {
    return Math.max(0, x);
  }

  public static reluDerivative(x: number) {
    return x > 0 ? 1 : 0;
  }

  public static leakyRelu(x: number): number {
    return x > 0 ? x : 0.01 * x;
  }

  public static leakyReluDerivative(x: number): number {
    return x > 0 ? 1 : 0.01;
  }

  public static softmax(input: number[]) {
    const max = Math.max(...input);
    const exps = input.map((value) => Math.exp(value - max));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    return exps.map((value) => value / sumExps);
  }

  public static getFunction(name: ActivationFunction): Function {
    switch (name) {
      case "Sigmoid":
        return NeuralNetworkUtils.sigmoid;
      case "Tanh":
        return NeuralNetworkUtils.tanh;
      case "ReLU":
        return NeuralNetworkUtils.relu;
      case "LeakyReLU":
        return NeuralNetworkUtils.leakyRelu;
      case "Softmax":
        return NeuralNetworkUtils.softmax;
      default:
        throw new Error("Invalid activation function");
    }
  }

  public static getFunctionDerivative(name: ActivationFunction): Function {
    switch (name) {
      case "Sigmoid":
        return NeuralNetworkUtils.sigmoidDerivative;
      case "Tanh":
        return NeuralNetworkUtils.tanhDerivative;
      case "ReLU":
        return NeuralNetworkUtils.reluDerivative;
      case "LeakyReLU":
        return NeuralNetworkUtils.leakyReluDerivative;
      default:
        throw new Error("Invalid activation function");
    }
  }

  public static calculateSSE(output: number[], target: number[]) {
    return output.reduce(
      (sum, out, i) => sum + Math.pow(target[i] - out, 2),
      0
    );
  }

  public static calculateCrossEntropy(
    output: number[],
    target: number[]
  ): number {
    return -output.reduce((sum, probability, i) => {
      const targetProbability = target[i];
      return sum + targetProbability * Math.log(probability + 1e-15);
    }, 0);
  }

  public static loadTrainingData(
    csv: string | File,
    binary: boolean = false
  ): Promise<{
    dataSet: DataSet;
    classes: string[];
    classLegend: Record<string, number>;
  }> {
    return new Promise((resolve, reject) => {
      const trainingData: DataSet = [];
      const uniqueClasses = new Set<string>();

      Papa.parse<(number | string)[]>(csv, {
        download: true,
        dynamicTyping: true,
        complete: (results) => {
          results.data.slice(1).forEach((row) => {
            if (row.length < 3) {
              return;
            }
            const label = String(row.pop());
            uniqueClasses.add(label);
            trainingData.push({ input: row as number[], label, target: [] });
          });

          const classToIndex = Array.from(uniqueClasses).reduce(
            (acc, cur, i) => {
              acc[cur] = i;
              return acc;
            },
            {} as Record<string, number>
          );

          trainingData.forEach((data) => {
            data.target = NeuralNetworkUtils.oneHotEncode({
              numberOfClasses: uniqueClasses.size,
              label: data.label,
              classToIndex,
              binary,
            });
          });

          resolve({
            dataSet: trainingData,
            classes: Array.from(uniqueClasses),
            classLegend: NeuralNetworkUtils.sortObjectByKeys(classToIndex),
          });
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }
  public static oneHotEncode({
    numberOfClasses,
    label,
    classToIndex,
    binary = false,
  }: {
    label: string;
    numberOfClasses: number;
    classToIndex: Record<string, number>;
    binary?: boolean;
  }): (0 | 1)[] {
    if (binary && numberOfClasses === 2) {
      return [classToIndex[label] as 0 | 1];
    }

    const oneHot = new Array(numberOfClasses).fill(0);
    oneHot[classToIndex[label]] = 1;
    return oneHot;
  }

  // For multi-class classification
  public static createLabelPredictionMap(
    output: number[],
    labels: string[]
  ): Record<string, number> {
    const labelPredictionMap: Record<string, number> = {};

    output.forEach((probability, index) => {
      const label = labels[index];
      labelPredictionMap[label] = probability;
    });

    return NeuralNetworkUtils.sortObjectByKeys(labelPredictionMap);
  }

  public static findMaxEntry(map: Record<string, number>) {
    let maxValue = -Infinity;
    let maxKey = "";

    for (const key in map) {
      if (map[key] > maxValue) {
        maxValue = map[key];
        maxKey = key;
      }
    }

    return { maxKey, maxValue };
  }

  // For binary classification
  public static mapPredictionToLabel(prediction: number, classes: string[]) {
    if (prediction > 0.5) {
      return classes[1];
    }
    return classes[0];
  }

  public static sortObjectByKeys(object: Record<string, any>) {
    const sortedObject: Record<string, any> = {};
    Object.keys(object)
      .sort()
      .forEach((key) => {
        sortedObject[key] = object[key];
      });
    return sortedObject;
  }

  public static shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // swap elements
    }
  }

  public static async loadSampleDatasets(): Promise<DataSetInfo[]> {
    const names = [
      "4 Classes.csv",
      "3 Classes.csv",
      "Non-Linear Binary.csv",
      "Binary.csv",
    ];

    const datasets = names.map(async (name) => {
      const data = await NeuralNetworkUtils.loadTrainingData(
        "/samples/" + name,
        true
      );
      return { name, data };
    });

    return await Promise.all(datasets);
  }
}

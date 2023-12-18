import { DataSet, NeuralNetworkUtils } from "@/logic";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function prepareDatasetForChart(data: DataSet) {
  const groupedData = data.reduce((acc, item) => {
    const { label, input } = item;
    if (!acc[label]) {
      acc[label] = [];
    }
    acc[label].push({ x: input[0], y: input[1] });
    return acc;
  }, {} as Record<string, { x: number; y: number }[]>);

  const sortedData = NeuralNetworkUtils.sortObjectByKeys(groupedData);

  const datasets = Object.keys(sortedData).map((label) => ({
    label,
    data: sortedData[label],
    color: ColorGenerator.getColorForClass(label),
  }));

  return { datasets };
}

export class ColorGenerator {
  private static colors: { [key: string]: string } = {
    a: "midnightblue",
    b: "forestgreen",
    c: "darkviolet",
    d: "chocolate",
    e: "darkslateblue",
    f: "darkblue",
    g: "navy",
    h: "indigo",
    i: "darkorchid",
    j: "darkolivegreen",
    k: "darkmagenta",
    l: "purple",
    m: "rebeccapurple",
    n: "blueviolet",
    o: "darkred",
    p: "brown",
    q: "maroon",
    r: "saddlebrown",
    s: "sienna",
    t: "darkgreen",
    u: "darkorange",
    v: "peru",
    w: "goldenrod",
    x: "olive",
    y: "darkslategray",
    z: "seagreen",
  };

  public static getColorForClass(className: string): string {
    return this.colors[className] || "#000000";
  }
}

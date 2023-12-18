import { Layer } from "@/logic";

interface NeuralNetworkVisualizationProps {
  layers: Layer[];
}

export const NeuralNetworkVisualization = ({
  layers,
}: NeuralNetworkVisualizationProps) => {
  return (
    <div className="flex justify-center items-center p-4">
      {layers.map((layer, layerIndex) => (
        <div key={layerIndex} className="flex flex-col items-center mx-4">
          {[...Array(layer[0])].map((_, neuronIndex) => (
            <div
              key={neuronIndex}
              className={"w-8 h-8 rounded-full mb-2 bg-blue-500"}
            />
          ))}
          <div>{layer[1]}</div>
        </div>
      ))}
    </div>
  );
};

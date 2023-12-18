/* eslint-disable react/no-unescaped-entities */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Wrench } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { ActivationFunction, Layer, NeuralNetworkConfig } from "@/logic";
import { useToast } from "./ui/use-toast";

const layerSchema = z.tuple([
  z.number(),
  z.enum(["Sigmoid", "Tanh", "ReLU", "LeakyReLU", "Softmax", "Input"]),
]);

const goalSchema = z.object({
  metric: z.enum(["SSE", "MSE", "CrossEntropy"]),
  error: z.number(),
});

const configSchema = z.object({
  layers: z.array(layerSchema),
  learningRate: z.number(),
  maxEpochs: z.number(),
  goal: goalSchema,
  testDataRatio: z.number().min(0).max(1),
});

export interface ConfigFormProps {
  onConfigUpdated: (config: NeuralNetworkConfig) => void;
}

export function ConfigForm({ onConfigUpdated }: ConfigFormProps) {
  const [layersInput, setLayersInput] = useState("2 Input\n4 Softmax");
  const form = useForm<z.infer<typeof configSchema>>({
    resolver: zodResolver(configSchema),
    defaultValues: {
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
    },
  });
  const { toast } = useToast();

  function onSubmit(values: z.infer<typeof configSchema>) {
    const layers: Layer[] = layersInput.split("\n").map((line) => {
      const [nodes, type] = line.split(" ");
      return [parseInt(nodes, 10), type as ActivationFunction];
    });
    values.layers = layers;
    try {
      configSchema.parse(values);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          "There was a problem with your request. Make sure to enter valid values.",
      });
    }

    toast({
      variant: "default",
      title: "✅ Success!",
      description: "The neural network was built successfully.",
    });

    onConfigUpdated(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <div className="flex gap-6">
          <FormField
            control={form.control}
            name="learningRate"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Learning Rate</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(event) => field.onChange(+event.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxEpochs"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Max Epochs</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(event) => field.onChange(+event.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="goal.metric"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Cost Function</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MSE">MSE</SelectItem>
                    <SelectItem value="SSE">SSE</SelectItem>
                    <SelectItem value="CrossEntropy">Cross Entropy</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="goal.error"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Error Goal</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(event) => field.onChange(+event.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="testDataRatio"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Test Data Ratio</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(event) => field.onChange(+event.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between items-center gap-6">
          <FormItem className="w-1/2">
            <FormLabel>Layers</FormLabel>
            <Textarea
              value={layersInput}
              onChange={(e) => {
                setLayersInput(e.target.value);
              }}
            />
            <FormDescription>
              Each line should have a layer with number of neurons separated by
              space then activation function which could be any of the
              following: "Sigmoid", "Tanh", "ReLU", "LeakyReLU", "Softmax".
              Softmax is only allowed in the last layer. ReLU is only allowed in
              hidden layers.
            </FormDescription>
          </FormItem>
        </div>

        <Button className="self-end w-40" type="submit">
          <Wrench className="mr-2 w-4 h-4" /> Build
        </Button>
      </form>
    </Form>
  );
}

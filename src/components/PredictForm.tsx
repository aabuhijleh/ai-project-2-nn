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
import { useState } from "react";

const predictSchema = z.object({
  feature1: z.number(),
  feature2: z.number(),
});

export interface PredictFormProps {
  onPredictSubmit: (input: number[]) => void;
}

export function PredictForm({ onPredictSubmit }: PredictFormProps) {
  const [layersInput, setLayersInput] = useState("2 Input\n4 Softmax");
  const form = useForm<z.infer<typeof predictSchema>>({
    resolver: zodResolver(predictSchema),
    defaultValues: {
      feature1: 0,
      feature2: 0,
    },
  });

  function onSubmit(values: z.infer<typeof predictSchema>) {
    onPredictSubmit([values.feature1, values.feature2]);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="feature1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feature 1</FormLabel>
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
          name="feature2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feature 2</FormLabel>
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
        <Button className="w-full" type="submit" size="lg">
          🤔 Predict
        </Button>
      </form>
    </Form>
  );
}

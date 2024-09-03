import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns"; // Import the format function from date-fns
import React, { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./components/ui/button";
import { Calendar } from "./components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
import { useToast } from "./hooks/use-toast";
import { ToastAction } from "./components/ui/toast";
import { cn } from "./lib/utils";
import { dateRangeFormSchema } from "./schemas/entityForm";
import axios from "axios";
const serverUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

export const AddDateRange = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { toast } = useToast();
  const form = useForm<z.infer<typeof dateRangeFormSchema>>({
    resolver: zodResolver(dateRangeFormSchema),
    defaultValues: {
      startDate: new Date("2024-10-01"),
      endDate: new Date("2024-10-02"),
    },
  });

  async function onSubmit(dates: z.infer<typeof dateRangeFormSchema>) {
    console.log("entering");
    console.log("data", dates);
    // Format the dates
    const formattedStartDate = format(new Date(dates.startDate), "MM/dd/yyyy");
    const formattedEndDate = format(new Date(dates.endDate), "MM/dd/yyyy");

    console.log(formattedStartDate);

    toast({
      title: formattedStartDate,
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify(
              { startDate: formattedStartDate, endDate: formattedEndDate },
              null,
              2
            )}
          </code>
        </pre>
      ),
      action: <ToastAction altText="added">Date range added</ToastAction>,
    });

    try {
      const response = await axios.post(`${serverUrl}/date/addDateRange`, {
        data: { dates },
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start time </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "MM/dd/yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "MM/dd/yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

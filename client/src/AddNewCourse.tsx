import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { courseFormSchema } from "./schemas/entityForm";
import axios from "axios";
const serverUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

export const AddNewCourse = () => {
  const form = useForm<z.infer<typeof courseFormSchema>>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      course_code: "",
      course_name: "",
    },
  });

  const onSubmit = async () => {
    try {
      const response = await axios.post(`${serverUrl}/course/addCourse`, {
        data: courseData,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="course_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course code</FormLabel>
              <FormControl>
                <Input value={courseCode} placeholder="COMP1405" {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="course_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course name</FormLabel>
              <FormControl>
                <Input value={courseName} placeholder="COMP1405" {...field} />
              </FormControl>
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

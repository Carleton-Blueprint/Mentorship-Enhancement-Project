import React, { useEffect, useState } from 'react';
import './App.css';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormSchema } from "./schemas/studentForm";
import CourseInput from './CourseInput';
import AvailabilityTable from './AvailabilityTable';

function AddStudentCard() {
  const [courses, setCourses] = useState<string[]>([]);
  const [availability, setAvailability] = useState<boolean[][]>([[]]);

  useEffect(() => {
    const rows = 5;
    const columns = 12;
    setAvailability(Array.from({ length: rows }, () => Array(columns).fill(false)));
  }, [])

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
    values.courses = courses // bypass zod validation for now
    // Do something with the form values.
    console.log(values)
  }

  return (
    <Form {...form}>
      <div className="w-full">
        <form onSubmit={form.handleSubmit(onSubmit)} className="AddStudentCard mt-1 flex flex-col w-full">
          <div className="form-row">
            <div className="form-field space-y-1 w-full">
              <FormField
                control={form.control} name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <div className="required"><FormLabel>Student Name</FormLabel></div>
                    <FormControl><Input {...field} /></FormControl>
                    <div className="form-details"><FormDescription>First</FormDescription></div>
                    <FormMessage /></FormItem>)} />
            </div>
            <div className="form-field space-y-1 w-full">
              <FormField
                control={form.control} name="lastName"
                render={({ field }) => (
                  <FormItem><FormLabel> </FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <div className="form-details"><FormDescription>Last</FormDescription></div>
                    <FormMessage /></FormItem>)} />
            </div>
            <div className="form-field space-y-1 w-full">
              <FormField
                control={form.control} name="preferredName"
                render={({ field }) => (
                  <FormItem><FormLabel>Preferred Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage /></FormItem>)} />
            </div>
            <div className="form-field space-y-1 w-2/5">
              <FormField
                control={form.control} name="preferredPronouns"
                render={({ field }) => (
                  <FormItem><FormLabel>Preferred Pronouns</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage /></FormItem>)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field space-y-1 w-full">
              <FormField
                control={form.control} name="email"
                render={({ field }) => (
                  <FormItem><div className="required"><FormLabel>Email</FormLabel></div>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage /></FormItem>)} />
            </div>
            <div className="form-field space-y-1 w-full">
              <FormField
                control={form.control} name="studentNumber"
                render={({ field }) => (
                  <FormItem><div className="required"><FormLabel>Student Number</FormLabel></div>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage /></FormItem>)} />
            </div>
            <div className="form-field space-y-1 w-1/3">
              <FormField
                control={form.control} name="yearLevel"
                render={({ field }) => (
                  <FormItem><div className="required"><FormLabel>Year Level</FormLabel></div>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage /></FormItem>)} />
            </div>
            <div className="form-field space-y-1 w-full">
              <FormField
                control={form.control} name="major"
                render={({ field }) => (
                  <FormItem><div className="required"><FormLabel>Major</FormLabel></div>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage /></FormItem>)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field space-y-1 w-full">
              <CourseInput form={form} courses={courses} setCourses={setCourses} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field space-y-1 w-full">
              <AvailabilityTable form={form} availability={availability} setAvailability={setAvailability} />
            </div>
          </div>
          <Button className="confirm" type="submit">Confirm</Button>
        </form>
      </div>
    </Form>
  );
}

export default AddStudentCard;

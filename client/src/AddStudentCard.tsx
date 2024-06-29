import React, { useState } from 'react';
import './App.css';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Label } from './components/ui/label';
import { Input } from './components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select"
import { Badge } from "./components/ui/badge";
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

import { FormSchema } from "./schema/studentForm";

function AddStudentCard() {
  type Course = {
    courseCode: string;
    courseName: string;
  }

  // const [courseList, setCourseList] = useState<Course[]>([]);
  // setCourseList([...courseList, { courseCode: 'CSC108', courseName: 'Intro to Programming' }]);
  // setCourseList([...courseList, { courseCode: 'CSC148', courseName: 'Intro to Science' }]);
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
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
                    <FormControl><Input placeholder="Blueprint" {...field} /></FormControl>
                    <div className="form-details"><FormDescription>First</FormDescription></div>
                    <FormMessage /></FormItem>)}/></div>
            <div className="form-field space-y-1 w-full self-end">
              <FormField
                control={form.control} name="lastName"
                render={({ field }) => (
                  <FormItem><FormLabel></FormLabel>
                    <FormControl><Input placeholder="McBlueprint Face" {...field} /></FormControl>
                    <div className="form-details"><FormDescription>Last</FormDescription></div>
                    <FormMessage /></FormItem>)}/></div>
            <div className="form-field space-y-1 w-full">
              <FormField
                control={form.control} name="preferredName"
                render={({ field }) => (
                  <FormItem><FormLabel>Preferred Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage /></FormItem>)}/></div>
            <div className="form-field space-y-1 w-2/5">
              <FormField
                control={form.control} name="preferredPronouns"
                render={({ field }) => (
                  <FormItem><FormLabel>Preferred Pronouns</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage /></FormItem>)}/></div>
          </div>
          <div className="form-row">
            <div className="form-field space-y-1 w-full">
              <FormField
                control={form.control} name="email"
                render={({ field }) => (
                  <FormItem><div className="required"><FormLabel>Email</FormLabel></div>
                    <FormControl><Input placeholder="cublueprint@gmail.com" {...field} /></FormControl>
                    <FormMessage /></FormItem>)}/></div>
            <div className="form-field space-y-1 w-full">
              <FormField
                control={form.control} name="studentNumber"
                render={({ field }) => (
                  <FormItem><div className="required"><FormLabel>Student Number</FormLabel></div>
                    <FormControl><Input placeholder="123456789" {...field} /></FormControl>
                    <FormMessage /></FormItem>)} /></div>
            <div className="form-field space-y-1 w-1/3">
              <FormField
                control={form.control} name="yearLevel"
                render={({ field }) => (
                  <FormItem><div className="required"><FormLabel>Year Level</FormLabel></div>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="2" />
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
                    <FormMessage /></FormItem>)} /></div>
            <div className="form-field space-y-1 w-full">
              <FormField
                control={form.control} name="major"
                render={({ field }) => (
                  <FormItem><div className="required"><FormLabel>Major</FormLabel></div>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage /></FormItem>)} /></div>
          </div>
          <div className="form-row">
            <div className="form-field space-y-1 w-full">
              <FormField
                control={form.control} name="courses"
                render={({ field }) => (
                  <FormItem><div className="required"><FormLabel>Courses Needing Improvement</FormLabel></div>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage /></FormItem>)} /></div>
          </div>
          <div className="form-row">
            <div className="form-field space-y-1 w-full">
              <FormField
                control={form.control} name="courses"
                render={({ field }) => (
                  <FormItem>
                    <FormControl><p>TABLE</p></FormControl>
                    <FormMessage /></FormItem>)} /></div>
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </div>
    </Form>
  );
}

export default AddStudentCard;

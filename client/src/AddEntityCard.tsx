import React from 'react';
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
import { toast } from "./components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormSchema } from "./schemas/entityForm";
import CourseInput from './CourseInput';
import AvailabilityTable from './AvailabilityTable';

import axios from 'axios';
const serverUrl = process.env.REACT_APP_SERVER_URL;

type AddEntityCardProps = {
  entity: string;
  courses: string[];
  setCourses: React.Dispatch<React.SetStateAction<string[]>>;
  availability: boolean[][];
  setAvailability: React.Dispatch<React.SetStateAction<boolean[][]>>;
  coursesValid: Boolean;
  setCoursesValid: React.Dispatch<React.SetStateAction<Boolean>>;
  availabilityValid: Boolean;
  setAvailabilityValid: React.Dispatch<React.SetStateAction<Boolean>>;
};

const AddEntityCard: React.FC<AddEntityCardProps> = ({
  entity, courses, setCourses, availability, setAvailability,
  coursesValid, setCoursesValid, availabilityValid, setAvailabilityValid
}) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      preferredName: "",
      preferredPronouns: "",
      email: "",
      entityNumber: "",
      yearLevel: "",
      major: "",
      courses: [],
      // courses: "",
      availability: [],
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    // confirm all courses are of valid format
    let coursesValid = false;
    if (courses.length > 0) {
      coursesValid = courses.every((course: string) => {
        return /^[A-Z]{4}\d{4}$/.test(course);
      });
    }
    if (!coursesValid) { setCoursesValid(false); return; }
    else { setCoursesValid(true); }

    // confirm at least 1 value is true
    let availabilityValid = false;
    if (availability.length > 0) {
      availabilityValid = availability.some((day: boolean[]) => {
        return day.includes(true);
      });
    }
    if (!availabilityValid) { setAvailabilityValid(false); return; }
    else { setAvailabilityValid(true); }

    data.courses = courses // bypass zod validation
    data.availability = availability // bypass zod validation

    // Do something with the form values.
    console.log(data)
    sendStudentData(data)
    toast({
      // TODO: FIX THEME, MAKE THIS VISIBLE
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  const sendStudentData = async (student: z.infer<typeof FormSchema>) => {
    try {
      const response = await axios.post(`${serverUrl}/students/insertStudent`, {data: student});
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Form {...form}>
      <div className="w-full">
        <form onSubmit={form.handleSubmit(onSubmit)} className="AddEntityCard mt-1 flex flex-col w-full">
          <div className="form-row">
            <div className="form-field space-y-1 w-full">
              <FormField
                control={form.control} name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <div className="required"><FormLabel>{entity} Name</FormLabel></div>
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
                control={form.control} name="entityNumber"
                render={({ field }) => (
                  <FormItem><div className="required"><FormLabel>{entity} Number</FormLabel></div>
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
              <CourseInput form={form}
                courses={courses} setCourses={setCourses}
                coursesValid={coursesValid} setCoursesValid={setCoursesValid}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field space-y-1 w-full">
              <AvailabilityTable form={form}
                availability={availability} setAvailability={setAvailability}
                availabilityValid={availabilityValid} setAvailabilityValid={setAvailabilityValid}
              />
            </div>
          </div>
          <Button className="confirm" type="submit">Confirm</Button>
        </form>
      </div>
    </Form>
  );
}

export default AddEntityCard;

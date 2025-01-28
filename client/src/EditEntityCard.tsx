import React, { useState } from 'react';
import './css/App.css';
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

import { EntityIDSchema, FormSchema } from "./schemas/entityForm";
import CourseInput from './CourseInput';
import AvailabilityTable from './AvailabilityTable';

import axios from 'axios';
const serverUrl = process.env.REACT_APP_SERVER_URL;

type EditEntityCardProps = {
  entity: string;
  coursesValid: Boolean;
  setCoursesValid: React.Dispatch<React.SetStateAction<Boolean>>;
  availabilityValid: Boolean;
  setAvailabilityValid: React.Dispatch<React.SetStateAction<Boolean>>;
};

const EditEntityCard: React.FC<EditEntityCardProps> = ({
  entity, coursesValid, setCoursesValid, availabilityValid, setAvailabilityValid
}) => {
  const [courses, setCourses] = useState<string[]>([]);
  const [availability, setAvailability] = useState<boolean[][]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [curEntityID, setCurEntityID] = useState<string>("");

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
      availability: [[]],
    },
  });

  const idForm = useForm<z.infer<typeof EntityIDSchema>>({
    resolver: zodResolver(EntityIDSchema),
    defaultValues: {
      entityID: ""
    },
  });

  async function lookupSubmit(data: z.infer<typeof EntityIDSchema>) {
    setIsLoading(true);
    setCurEntityID(data.entityID)

    // Do something with the form values.
    const result = await lookupByID(data);
    const parsedResult = JSON.parse(result);

    // fill the form values with the parsed result json
    form.setValue("firstName", parsedResult.firstName);
    form.setValue("lastName", parsedResult.lastName);
    form.setValue("preferredName", parsedResult.preferredName);
    form.setValue("preferredPronouns", parsedResult.preferredPronouns);
    form.setValue("email", parsedResult.email);
    form.setValue("entityNumber", parsedResult.entityNumber);
    form.setValue("yearLevel", parsedResult.yearLevel);
    form.setValue("major", parsedResult.major);
    form.setValue("courses", parsedResult.courses);
    form.setValue("availability", parsedResult.availability);
    
    // handle courses and availability
    setCourses(parsedResult.courses);
    setAvailability(parsedResult.availability);
    
    setIsLoading(false);
  }

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
    editStudentData(data)
  }

  const lookupByID = async (entityID: z.infer<typeof EntityIDSchema>): Promise<string> => {
      try {
        // TODO
        const result: string = await axios.get(`${serverUrl}/students/getStudentByID`, { data: entityID });
        //const result: string = `{"availability":[[false,false,false,false,false,false,false,false,false,false,true,true],[false,true,false,false,true,false,false,false,false,false,false,false],[false,false,true,false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,true,false,false,false,false]],"courses":["COMP1405","COMP1406","MATH1107","GEOM2005"],"email":"john.doe@gmail.com","entityNumber":"123456789","firstName":"John","lastName":"Doe","major":"Computer Science","preferredName":"Bob","preferredPronouns":"they/them","yearLevel":"2"}`
        return result;
      } catch (error) {
        console.log(error);
        return "";
      }
  }

  const editStudentData = async (student: z.infer<typeof FormSchema>) => {
    try {
      // TODO
      await axios.put(`${serverUrl}/students/editStudentByID`, { data: student });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="flex flex-col">
      <Form {...idForm}>
        <div className="w-full mb-6">
          <form onSubmit={idForm.handleSubmit(lookupSubmit)} className="EditEntityCard mt-1 flex flex-col w-full">
            <div className="form-row">
              <div className="form-field space-y-1 w-full">
                <FormField
                  control={idForm.control} name="entityID"
                  render={({ field }) => (
                    <FormItem>
                      <div className="required"><FormLabel>Lookup by {entity} ID</FormLabel></div>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage /></FormItem>)} />
              </div>
            </div>
            <Button className="confirm" type="submit">Look up</Button>
          </form>
        </div>
      </Form>
      {curEntityID === "" ?
        ""
        :
        <>
          {isLoading ?
            <div className="flex">
              <svg aria-hidden="true" className="w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-red" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
            :
            <Form {...form}>
              <div className="w-full">
                <form onSubmit={form.handleSubmit(onSubmit)} className="EditEntityCard mt-1 flex flex-col w-full">
                  <div className="form-row">
                    <div className="form-field space-y-1 w-full">
                      <FormField
                        control={form.control} name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <div className="required"><FormLabel>{entity} Name</FormLabel></div>
                            <FormControl><Input {...field} /></FormControl>
                            <FormDescription>First</FormDescription>
                            <FormMessage /></FormItem>)} />
                    </div>
                    <div className="form-field space-y-1 w-full">
                      <FormField
                        control={form.control} name="lastName"
                        render={({ field }) => (
                          <FormItem><FormLabel> </FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormDescription>Last</FormDescription>
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
                      <CourseInput form={form} entity={entity}
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
          }
        </>
      }
    </div>
  );
}

export default EditEntityCard;

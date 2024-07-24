import React, { ChangeEvent, KeyboardEvent, useState } from 'react';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './components/ui/form';
import { FormSchema } from "./schemas/entityForm";
import { UseFormReturn } from 'react-hook-form';
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';

type CourseInputProps = {
  form: UseFormReturn<z.infer<typeof FormSchema>>;
  courses: string[];
  setCourses: React.Dispatch<React.SetStateAction<string[]>>;
  coursesValid: Boolean;
  setCoursesValid: React.Dispatch<React.SetStateAction<Boolean>>;
};

const CourseInput: React.FC<CourseInputProps> = ({ form, courses, setCourses, coursesValid, setCoursesValid }) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' && inputValue) {
      addCourse(inputValue);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim() !== '') {
      addCourse(inputValue);
    } else {
      setInputValue('');
    }
  };

  const addCourse = (course: string) => {
    if (!courses.includes(course)) {
      course = course.toUpperCase().replace(/ /g, '').trim();
      setCourses([...courses, course]);
      setInputValue('');
    }
  };

  const removeCourse = (course: string) => {
    setCourses(courses.filter((e) => e !== course));
  };

  return (
    <FormField
      control={form.control} name="courses"
      render={({ field }) => (
        <FormItem>
          <div className={`required ${coursesValid ? "" : "text-red"}`}>
            <FormLabel>Courses Needing Improvement</FormLabel>
          </div>
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="w-full p-2 border focus:outline-dark-grey-2 focus:outline focus:outline-1 focus:bg-light-grey-2"
            placeholder="ex. COMP1405"
          />
          <FormMessage />
          <div className="flex flex-wrap gap-2 mb-2">
            {courses.map((course) => (
              <div key={uuidv4()}>
                <FormControl>
                  <Badge
                    className="px-3 py-1 text-sm font-medium text-light-grey-2 bg-dark-grey rounded-full hover:bg-dark-grey"
                  >
                    {course}
                    <button
                      type="button"
                      className="ml-2 rounded-full"
                      onClick={() => removeCourse(course)}
                    >
                      &times;
                    </button>
                  </Badge>
                </FormControl>
              </div>
            ))}
          </div>
          <div className="text-sm font-medium text-destructive">
            {!coursesValid && 'Please enter at least one course'}
          </div>
        </FormItem>
      )}
    />
  );
};

export default CourseInput;

import React, { useEffect, useState } from "react";
import AddEntityCard from "./AddEntityCard";
import "./Home.css";

import axios, {AxiosResponse} from "axios";
import { AddDateRange } from "./AddDateRange";
import { AddNewCourse } from "./AddNewCourse";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { CsvButtonMentors } from "./importCsvButtonMentors";
import { CsvButtonStudents } from "./importCsvButtonStudents";
import {ExportCsv} from "./ExportCsv";
const serverUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

export const Home = () => {
  const [manageEntities, setManageEntities] = useState<String>("student");
  const [menuExpanded, setMenuExpanded] = useState<Boolean>(false);

  const [courses, setCourses] = useState<string[]>([]);
  const [availability, setAvailability] = useState<boolean[][]>([[]]);
  const [coursesValid, setCoursesValid] = useState<Boolean>(true);
  const [availabilityValid, setAvailabilityValid] = useState<Boolean>(true);
  const [csv, setCsv] = useState<string>("");
  function plusIconClicked(
    event: React.MouseEvent<SVGSVGElement, MouseEvent>
  ): void {
    const target = event.currentTarget;
    if (menuExpanded) {
      target.classList.remove("rotate-45");
    } else {
      target.classList.add("rotate-45");
    }
    setMenuExpanded(!menuExpanded);
  }

  function manageEntityClicked(entity: string): void {
    if (entity === "student") {
      setManageEntities("student");
    } else if (entity === "mentor") {
      setManageEntities("mentor");
    } else if (entity === "course") {
      setManageEntities("course");
    } else if (entity === "time") {
      setManageEntities("time");
    }
  }

  const onGenerateCsv = async () => {
    try {
      const response = await axios.get(`${serverUrl}/query/generateCsv`);
      console.log("query response.data", response.data);
      setCsv(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Collapse the menu when manageEntities changes
  useEffect(() => {
    setMenuExpanded(false);
  }, [manageEntities]);

  return (
    <>
      <div>
        <header className="App-header flex justify-between">
          <p>SSSC Early Warning Initiative (EWI) Admin</p>
          <div className="pr-10">
            <Button onClick={onGenerateCsv}>Generate CSV</Button>
          </div>
        </header>
      </div>
      <div className="flex justify-space-between h-full">
        <div className="justify-between w-full">
          <Tabs defaultValue="student">
            <TabsList className="tabs-list-overlap w-[600px] grid grid-cols-4 p-0 rounded-full text-dark-grey bg-grey">
              <div
                className={`absolute h-full transition-all duration-300 ease-in-out 
    ${
      manageEntities === "student"
        ? "translate-x-0"
        : manageEntities === "mentor"
        ? "translate-x-[100%]"
        : manageEntities === "course"
        ? "translate-x-[200%]"
        : manageEntities === "time"
        ? "translate-x-[300%]"
        : ""
    } 
    w-1/4 bg-red rounded-full select-none`}
              ></div>
              <TabsTrigger
                onClick={() => manageEntityClicked("student")}
                className="h-full text-base rounded-full z-10 data-[state=active]:text-[white] transition-colors duration-300 ease-in-out"
                value="student"
              >
                Manage Students
              </TabsTrigger>
              <TabsTrigger
                onClick={() => manageEntityClicked("mentor")}
                className="h-full text-base rounded-full z-10 data-[state=active]:text-[white] transition-colors duration-300 ease-in-out"
                value="mentor"
              >
                Manage Mentors
              </TabsTrigger>
              <TabsTrigger
                onClick={() => manageEntityClicked("course")}
                className="h-full text-base rounded-full z-10 data-[state=active]:text-[white] transition-colors duration-300 ease-in-out"
                value="course"
              >
                Manage Courses
              </TabsTrigger>
              <TabsTrigger
                onClick={() => manageEntityClicked("time")}
                className="h-full text-base rounded-full z-10 data-[state=active]:text-[white] transition-colors duration-300 ease-in-out"
                value="time"
              >
                Manage Times
              </TabsTrigger>
            </TabsList>
            <div className="flex mx-12 py-3">
              <TabsContent className="flex flex-row" value="student">
                <div className="flex max-h-12 mr-8">
                  <p className="font-semibold text-nowrap">
                    Add New <br /> Student
                  </p>
                  <svg
                    className="plus-icon select-none size-6 text-[#949494] ml-2 mb-1"
                    onClick={plusIconClicked}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                  </svg>
                </div>

                {menuExpanded ? "" : <CsvButtonStudents />}
                {menuExpanded ? (
                  <AddEntityCard
                    entity="Student"
                    courses={courses}
                    setCourses={setCourses}
                    availability={availability}
                    setAvailability={setAvailability}
                    coursesValid={coursesValid}
                    setCoursesValid={setCoursesValid}
                    availabilityValid={availabilityValid}
                    setAvailabilityValid={setAvailabilityValid}
                  />
                ) : (
                  ""
                )}
              </TabsContent>
              <TabsContent className="flex flex-row" value="mentor">
                <div className="flex max-h-12 mr-8">
                  <p className="font-semibold text-nowrap">
                    Add New <br /> Mentor
                  </p>
                  <svg
                    className="plus-icon select-none size-6 text-[#949494] ml-2 mb-1"
                    onClick={plusIconClicked}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                  </svg>
                </div>

                {menuExpanded ? "" : <CsvButtonMentors />}
                {menuExpanded ? (
                  <AddEntityCard
                    entity="Mentor"
                    courses={courses}
                    setCourses={setCourses}
                    availability={availability}
                    setAvailability={setAvailability}
                    coursesValid={coursesValid}
                    setCoursesValid={setCoursesValid}
                    availabilityValid={availabilityValid}
                    setAvailabilityValid={setAvailabilityValid}
                  />
                ) : (
                  ""
                )}
              </TabsContent>
              <TabsContent className="flex flex-row" value="course">
                <AddNewCourse />
              </TabsContent>
              <TabsContent className="flex flex-row" value="time">
                <AddDateRange />
              </TabsContent>
            </div>
            <div className="w-[100px] bg-gray-200 align-right p-4 m-10 rounded-lg"><ExportCsv csvString={csv} /></div>
          </Tabs>
        </div>
      </div>
    </>
  );
};

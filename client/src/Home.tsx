import React, { useState } from "react";
import "./Home.css";

import axios from "axios";
import { AddDateRange } from "./AddDateRange";
import { AddNewCourse } from "./AddNewCourse";
import { MoreOptions } from "./MoreOptions";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { ExportCsv } from "./ExportCsv";
import  useSignOut from 'react-auth-kit/hooks/useSignOut';
import { ManageMentors } from "./ManageMentors";
import { ManageStudents } from "./ManageStudents";
const serverUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

export const Home = ({ setLoggedIn, loggedIn }: any) => {
  const [manageEntities, setManageEntities] = useState<string>("Student");
  const [showMoreOptions, setShowMoreOptions] = useState<Boolean>(false);

  const [courses, setCourses] = useState<string[]>([]);
  const [availability, setAvailability] = useState<boolean[][]>([]);
  const [coursesValid, setCoursesValid] = useState<Boolean>(true);
  const [availabilityValid, setAvailabilityValid] = useState<Boolean>(true);
  const [csv, setCsv] = useState<string>("");

  function manageEntityClicked(entity: string): void {
    setShowMoreOptions(false);
    if (entity === "Student") {
      setManageEntities("Student");
    } else if (entity === "Mentor") {
      setManageEntities("Mentor");
    } else if (entity === "Course") {
      setManageEntities("Course");
    } else if (entity === "Time") {
      setManageEntities("Time");
    }
  }

  function openMoreOptions(): void {
    setShowMoreOptions(true);
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

  const signOut = useSignOut();

  const handleSignOut = () => {
    signOut(); // Clears the token and user state
    setLoggedIn(false)
    alert("You have been signed out");
  };

  return (
    <>
      <div>
        <header className="App-header flex justify-between">
          <p>SSSC Mentor Enhancement Project</p>
          <div className="">
            <div className="flex flex-col items-center justify-center pr-10 ">
              {loggedIn ? <Button className="mb-4" onClick={handleSignOut}>Logout</Button>: ""}
              <Button onClick={onGenerateCsv}>Generate CSV</Button>
            </div>
          </div>
        </header>
      </div>
      <div className="flex justify-space-between h-full">
        <div className="justify-between w-full">
          <Tabs defaultValue="Student">
            <div className="flex justify-between">
              <TabsList className="tabs-list-overlap w-[600px] grid grid-cols-4 p-0 rounded-full text-dark-grey bg-grey">
                <div
                  className={`absolute h-full transition-all duration-300 ease-in-out 
                    ${
                      manageEntities === "Student"
                        ? "translate-x-0"
                        : manageEntities === "Mentor"
                        ? "translate-x-[100%]"
                        : manageEntities === "Course"
                        ? "translate-x-[200%]"
                        : manageEntities === "Time"
                        ? "translate-x-[300%]"
                        : ""
                    } 
                    w-1/4 bg-red rounded-full select-none`}
                ></div>
                <TabsTrigger
                  onClick={() => manageEntityClicked("Student")}
                  className="h-full text-base rounded-full z-10 data-[state=active]:text-[white] transition-colors duration-300 ease-in-out"
                  value="Student"
                >
                  Manage Students
                </TabsTrigger>
                <TabsTrigger
                  onClick={() => manageEntityClicked("Mentor")}
                  className="h-full text-base rounded-full z-10 data-[state=active]:text-[white] transition-colors duration-300 ease-in-out"
                  value="Mentor"
                >
                  Manage Mentors
                </TabsTrigger>
                <TabsTrigger
                  onClick={() => manageEntityClicked("Course")}
                  className="h-full text-base rounded-full z-10 data-[state=active]:text-[white] transition-colors duration-300 ease-in-out"
                  value="Course"
                >
                  Manage Courses
                </TabsTrigger>
                <TabsTrigger
                  onClick={() => manageEntityClicked("Time")}
                  className="h-full text-base rounded-full z-10 data-[state=active]:text-[white] transition-colors duration-300 ease-in-out"
                  value="Time"
                >
                  Manage Times
                </TabsTrigger>
              </TabsList>
                <Button
                  onClick={() => openMoreOptions()}
                  className="-mt-5 mr-10 h-full text-base rounded-full z-10 bg-grey text-dark-grey hover:bg-grey"
                  value="moreOptions"
                >
                  More Options...
                </Button>
            </div>
            {showMoreOptions ? <MoreOptions /> :
              <>
                <div className="flex mx-12 py-3">
                <TabsContent className="flex flex-row" value="Student">
                  <ManageStudents
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
                </TabsContent>
                <TabsContent className="flex flex-row" value="Mentor">
                  <ManageMentors
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
                </TabsContent>
                <TabsContent className="flex flex-row" value="Course">
                  <AddNewCourse />
                </TabsContent>
                <TabsContent className="flex flex-row" value="Time">
                  <AddDateRange />
                </TabsContent>
              </div>
              <div className="w-[100px] bg-gray-200 align-right p-4 m-10 rounded-lg">
                <ExportCsv csvString={csv} />
              </div>
            </>}
          </Tabs>
        </div>
      </div>
    </>
  );
};

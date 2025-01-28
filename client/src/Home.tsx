import React, { useState } from "react";
import "./css/Home.css";

import axios from "axios";
import { AddDateRange } from "./AddDateRange";
import { AddNewCourse } from "./AddNewCourse";
import { MoreOptions } from "./MoreOptions";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { ManageMentors } from "./ManageMentors";
import { ManageStudents } from "./ManageStudents";
import { CsvButtonMentors, Mentor } from "./importCsvButtonMentors";
import { CsvButtonStudents, Student } from "./importCsvButtonStudents";
import { ExportCsv } from "./ExportCsv";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import { useToast } from "./hooks/use-toast";
const serverUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

export const Home = ({ setLoggedIn, loggedIn }: any) => {
  const [manageEntities, setManageEntities] = useState<string>("Student");
  const [showMoreOptions, setShowMoreOptions] = useState<Boolean>(false);
  const { toast } = useToast();
  const [menuExpanded, setMenuExpanded] = useState<Boolean>(false);
  const [coursesValid, setCoursesValid] = useState<Boolean>(true);
  const [availabilityValid, setAvailabilityValid] = useState<Boolean>(true);
  const [csvData, setCsvData] = useState<string>("");

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
    setShowMoreOptions(false);
    setManageEntities(entity);
  }

  function openMoreOptions(): void {
    setShowMoreOptions(true);
  }

  const onGenerateCsv = async () => {
    try {
      const response = await axios.get(`${serverUrl}/query/generateCsv`);
      if (!response.data) {
        throw new Error("No CSV data received");
      }
      const combinedCsv =
        response.data.csvContent + "\n" + response.data.unmatchedCsvContent;
      setCsvData(combinedCsv);
      csvAlert(combinedCsv);
    } catch (error) {
      console.log(error);
    }
  };

  const csvAlert = (csvData: string) => {
    toast({
      title: "CSV Generated",
      description: "The CSV has been generated",
      action: (
        <div className="bg-gray-200 align-right p-4 m-10 rounded-lg">
          <ExportCsv csvString={csvData} />
        </div>
      ),
    });
  };

  const signOut = useSignOut();

  const handleSignOut = () => {
    signOut(); // Clears the token and user state
    setLoggedIn(false);
    alert("You have been signed out");
  };

  return (
    <>
      <div>
        <header className="App-header flex justify-between">
          <p>SSSC Mentor Enhancement Project</p>
          <div className="">
            <div className="flex flex-col items-center justify-center pr-10 ">
              {loggedIn ? (
                <Button className="mb-4" onClick={handleSignOut}>
                  Logout
                </Button>
              ) : (
                ""
              )}
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
            {showMoreOptions ? (
              <MoreOptions />
            ) : (
              <>
                <div className="flex mx-12 py-3">
                  <TabsContent className="flex flex-row" value="Student">
                    <ManageStudents
                      entity="Student"
                      coursesValid={coursesValid}
                      setCoursesValid={setCoursesValid}
                      availabilityValid={availabilityValid}
                      setAvailabilityValid={setAvailabilityValid}
                    />
                  </TabsContent>
                  <TabsContent className="flex flex-row" value="Mentor">
                    <ManageMentors
                      entity="Mentor"
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
              </>
            )}
          </Tabs>
        </div>
      </div>
    </>
  );
};

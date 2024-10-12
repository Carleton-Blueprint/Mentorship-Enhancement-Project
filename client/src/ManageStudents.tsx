import React, { useState } from "react";
import { CsvButtonStudents } from "./importCsvButtonStudents";
import { Button } from "./components/ui/button";
import AddEntityCard from "./AddEntityCard";
import EditEntityCard from "./EditEntityCard";

export const ManageStudents = ({ entity, courses, setCourses, availability, setAvailability, coursesValid, setCoursesValid, availabilityValid, setAvailabilityValid }:
  {
    entity: string,
    courses: any, setCourses: any,
    availability: any, setAvailability: any,
    coursesValid: any, setCoursesValid: any,
    availabilityValid: any, setAvailabilityValid: any
  }) => {
  const [currentTab, setCurrentTab] = useState<string>("Add");

  return (
    <>
      <div className="flex flex-col gap-4 py-2 mr-8">
        <Button className={`font-semibold text-nowrap ${currentTab === "Add" ? "bg-[#cdcdcd]" : "bg-light-grey-2"}
         text-dark-grey hover:bg-dark-grey-2`}
          onClick={() => setCurrentTab("Add")}>
          Bulk Add <br /> Students
        </Button>
        <Button className={`font-semibold text-nowrap ${currentTab === "New" ? "bg-[#cdcdcd]" : "bg-light-grey-2"}
         text-dark-grey hover:bg-dark-grey-2`}
          onClick={() => setCurrentTab("New")}>
          Add New <br /> Student
        </Button>
        <Button className={`font-semibold text-nowrap ${currentTab === "Edit" ? "bg-[#cdcdcd]" : "bg-light-grey-2"}
         text-dark-grey hover:bg-dark-grey-2`}
          onClick={() => setCurrentTab("Edit")}>
          Edit Student <br /> By ID
        </Button>
      </div>
      <div className="flex gap-4 py-2">
        {currentTab === "Add" && (
          <CsvButtonStudents />
        )}
        {currentTab === "New" && (
          <AddEntityCard
            entity={entity}
            courses={courses}
            setCourses={setCourses}
            availability={availability}
            setAvailability={setAvailability}
            coursesValid={coursesValid}
            setCoursesValid={setCoursesValid}
            availabilityValid={availabilityValid}
            setAvailabilityValid={setAvailabilityValid}
          />
        )}
        {currentTab === "Edit" && (
          <EditEntityCard
            entity={entity}
            courses={courses}
            setCourses={setCourses}
            availability={availability}
            setAvailability={setAvailability}
            coursesValid={coursesValid}
            setCoursesValid={setCoursesValid}
            availabilityValid={availabilityValid}
            setAvailabilityValid={setAvailabilityValid}
          />
        )}
      </div>
    </>
  );
};

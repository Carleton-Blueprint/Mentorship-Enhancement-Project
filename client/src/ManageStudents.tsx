import React, { useState } from "react";
import { CsvButtonStudents } from "./importCsvButtonStudents";
import AddEntityCard from "./AddEntityCard";
import EditEntityCard from "./EditEntityCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

export const ManageStudents = ({ entity, coursesValid, setCoursesValid, availabilityValid, setAvailabilityValid }:
  {
    entity: string,
    coursesValid: any, setCoursesValid: any,
    availabilityValid: any, setAvailabilityValid: any
  }) => {
  const [currentTab, setCurrentTab] = useState<string>("Add");

  return (
    <>
      <Tabs className="flex gap-4 py-2" defaultValue="Add">
        <TabsList className="flex flex-col gap-4 py-2 mr-8 justify-start bg-transparent">
          <TabsTrigger
            onClick={() => setCurrentTab("Add")}
            className={`font-semibold ${currentTab === "Add" ? "bg-[#cdcdcd]" : "bg-light-grey-2"}
        text-dark-grey hover:bg-dark-grey-2 px-4 py-2 w-24`}
            value="Add"
          >
            Bulk Add <br/>Students
          </TabsTrigger>
          <TabsTrigger
            onClick={() => setCurrentTab("New")}
            className={`font-semibold ${currentTab === "New" ? "bg-[#cdcdcd]" : "bg-light-grey-2"}
        text-dark-grey hover:bg-dark-grey-2 px-4 py-2 w-24`}
            value="New"
          >
            Add New <br/>Student
          </TabsTrigger>
          <TabsTrigger
            onClick={() => setCurrentTab("Edit")}
            className={`font-semibold ${currentTab === "Edit" ? "bg-[#cdcdcd]" : "bg-light-grey-2"}
        text-dark-grey hover:bg-dark-grey-2 px-4 py-2 w-24`}
            value="Edit"
          >
            Edit Student <br/>By ID
          </TabsTrigger>
        </TabsList>
        <div className="flex">
          <TabsContent value="Add">
            <CsvButtonStudents />
          </TabsContent>
          <TabsContent value="New">
            <AddEntityCard
              entity={entity}
              coursesValid={coursesValid}
              setCoursesValid={setCoursesValid}
              availabilityValid={availabilityValid}
              setAvailabilityValid={setAvailabilityValid}
            />
          </TabsContent>
          <TabsContent value="Edit">
            <EditEntityCard
              entity={entity}
              coursesValid={coursesValid}
              setCoursesValid={setCoursesValid}
              availabilityValid={availabilityValid}
              setAvailabilityValid={setAvailabilityValid}
            />
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
};

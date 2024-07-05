import React, { useState } from 'react';
import './App.css';
import AddStudentCard from './AddStudentCard';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs"
import { Button } from './components/ui/button';

function App() {
  const [menuExpanded, setMenuExpanded] = useState<Boolean>(false);
  const [manageStudents, setManageStudents] = useState<Boolean>(true);

  function plusIconClicked(event: React.MouseEvent<SVGSVGElement, MouseEvent>): void {
    const target = event.currentTarget;
    if (menuExpanded) {
      target.classList.remove('rotate-45');
    }
    else {
      target.classList.add('rotate-45');
    }
    setMenuExpanded(!menuExpanded);
  }

  function manageEntityClicked(entity: string): void {
    if (entity === "student" && !manageStudents) {
      setManageStudents(!manageStudents);
    } else if (entity === "mentor" && manageStudents) {
      setManageStudents(!manageStudents);
      setMenuExpanded(false);
    }
  }

  return (
    <>
      <header className="App-header">
        <p>
          SSSC Early Warning Initiative (EWI) Admin
        </p>
      </header>

      <Tabs defaultValue="student">
        <TabsList className="tabs-list-overlap w-[400px] grid grid-cols-2 p-0 rounded-full text-dark-grey bg-grey">
          <div className={`absolute h-full transition-all duration-300 ease-in-out 
            ${manageStudents ? '' : 'translate-x-full'} w-1/2 bg-red rounded-full
            select-none`}>  
          </div>
          <TabsTrigger onClick={() => manageEntityClicked("student")} className=
            "h-full text-base rounded-full z-10 data-[state=active]:text-[white] transition-colors duration-300 ease-in-out"
            value="student">Manage Students
          </TabsTrigger>
          <TabsTrigger onClick={() => manageEntityClicked("mentor")} className=
            "h-full text-base rounded-full z-10 data-[state=active]:text-[white] transition-colors duration-300 ease-in-out"
            value="mentor">Manage Mentors
          </TabsTrigger>
        </TabsList>
        <div className="mx-12 py-3">
          <TabsContent className="flex flex-row" value="student">
            <div className="flex max-h-12 mr-8">
              <p className="font-semibold text-nowrap">
                Add New <br/> Student
              </p>
              <svg className="plus-icon select-none size-6 text-[#949494] ml-2 mb-1" onClick={plusIconClicked} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg>
            </div>

            {menuExpanded ? '' : <Button className="bulk-add">Bulk Add (CSV)</Button>}
            {menuExpanded ? <AddStudentCard /> : ''}
          </TabsContent>
          <TabsContent value="mentor">
            <p>
              Manage Mentors
            </p>
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}

export default App;

import React, { useEffect } from 'react';
import { FormSchema } from "./schemas/studentForm";
import { UseFormReturn } from 'react-hook-form';
import { z } from "zod";

type AvailabilityTableProps = {
  form: UseFormReturn<z.infer<typeof FormSchema>>;
  availability: boolean[][];
  setAvailability: (availability: boolean[][]) => void;
};

const AvailabilityTable: React.FC<AvailabilityTableProps> = ({ form, availability, setAvailability }) => {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const timeslots = ['10:00 -\n10:30 AM', '10:30 -\n11:00 AM', '11:00 -\n11:30 AM',
    '11:30 -\n12:00 PM', '12:00 -\n12:30 PM', '12:30 -\n1:00 PM',
    '1:00 -\n1:30 PM', '1:30 -\n2:00 PM', '2:00 -\n2:30 PM',
    '2:30 -\n3:00 PM', '3:00 -\n3:30 PM', '3:30 -\n4:00 PM'];

  // useEffect(() => {
  //   for (let i = 0; i < daysOfWeek.length; i++) {
  //     for (let j = 0; j < timeslots.length; j++) {
  //       availability[i][j] = false;
  //     }
  //   }
  // }, []);
  
  function selectTimeslot(event: React.MouseEvent<HTMLLabelElement, MouseEvent>): void {
    const target = event.currentTarget;
    if (target.classList.contains('selected')) {
      target.classList.remove('selected');
    }
    else {
      target.classList.add('selected');
    }
    // console.log(timeslot);
    // setAvailability(!availability);
  }

  return (
    <>
      <div className="text-sm font-medium">Availability</div>
      <table className="w-full table-fixed timeslot-table">
        <tbody>
          {daysOfWeek.map((day, index) => (
            <tr key={index}>
              <td className="titles">{day}</td>
              {timeslots.map((timeslot, innerIndex) => (
                <td key={innerIndex}>
                  <label
                    className="timeslot-label prevent-select"
                    onClick={selectTimeslot}
                  >
                    {timeslot}
                  </label>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default AvailabilityTable;

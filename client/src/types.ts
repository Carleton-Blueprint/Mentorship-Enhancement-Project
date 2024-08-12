export interface Availability {
  day: String;
  time_ranges: TimeRange[];
}

export interface TimeRange {
  start_time: Time;
  end_time: Time;
}

export interface Time {
  hours: number;
  minutes: number;
}

export interface Course {
    course_code: String,
    course_name: String
}
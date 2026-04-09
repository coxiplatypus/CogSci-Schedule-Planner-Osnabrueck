// Generate .ics calendar file for Google Calendar / Outlook / Apple Calendar
function exportICS(courses,status,pres,areaOfFn){
  // First weekday on/after 2026-04-07 (Beginn der LV)
  const FD=["20260413","20260407","20260408","20260409","20260410"];
  let ics="BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//CogSci Planner//SoSe2026//EN\r\nCALSCALE:GREGORIAN\r\n";
  courses.forEach(c=>{
    if(!status[c.id]||c.slots.length===0)return;
    c.slots.forEach((sl,si)=>{
      const d=FD[sl.day];
      const sh=String(sl.start).padStart(2,"0"),eh=String(sl.end).padStart(2,"0");
      ics+=`BEGIN:VEVENT\r\nDTSTART:${d}T${sh}0000\r\nDTEND:${d}T${eh}0000\r\n`;
      ics+=`RRULE:FREQ=WEEKLY;UNTIL=20260711T235959Z\r\n`;
      ics+=`SUMMARY:${c.name}${sl.label?" ("+sl.label+")":""}\r\n`;
      const room=sl.room||c.room;
      if(room)ics+=`LOCATION:${room}\r\n`;
      ics+=`DESCRIPTION:${c.nr||""} · ${c.ects||"?"} LP · ${areaOfFn(c)}\r\n`;
      ics+=`UID:cogsci-${c.id}-${si}@planner\r\nEND:VEVENT\r\n`;
    });
  });
  ics+="END:VCALENDAR\r\n";
  const blob=new Blob([ics],{type:"text/calendar;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download="cogsci-sose2026.ics";
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}

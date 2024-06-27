export const generateStartTime = async (category_id: string) => {
  const currentTime = Date.now();

  if (category_id === 'Immediate Delivery') {    
    return { start: new Date(currentTime + 10 * 60 * 1000).toISOString(), end: new Date(currentTime + 25 * 60 * 1000).toISOString() };
  }
  
  if (category_id === 'Same Day Delivery') {
    return { start: new Date(currentTime + 10).toISOString(), end: new Date(currentTime + 120 * 60 * 1000).toISOString() };
  }
  if (category_id === 'Next Day Delivery') {
    const currentDate = new Date();
    const startTime = new Date();
    const endTime = new Date();
    startTime.setDate(currentDate.getDate() + 1);
    startTime.setHours(10, 0, 0, 0);
    endTime.setDate(currentDate.getDate() + 1);
    endTime.setHours(12, 0, 0, 0);

    return { start: new Date(startTime).toISOString(), end: new Date(endTime).toISOString() };
  }
  if (category_id === 'Express Delivery') {
    const currentDate = new Date();
    const startTime = new Date();
    const endTime = new Date();
    startTime.setDate(currentDate.getDate() + 1);
    startTime.setHours(10, 0, 0, 0);
    endTime.setDate(currentDate.getDate() + 1);
    endTime.setHours(12, 0, 0, 0);

    return { start: new Date(startTime).toISOString(), end: new Date(endTime).toISOString() };
  } else {
      return { start: new Date(currentTime).toISOString(), end: new Date(currentTime + 15 * 60 * 1000).toISOString() };
  }
};

export const generateEndTime = async (category_id: string) => {
  const currentTime = Date.now();
  if (category_id === 'Immediate Delivery') {
    return {
      start: new Date(currentTime + 45 * 60 * 1000).toISOString(),
      end: new Date(currentTime + 60 * 60 * 1000).toISOString(),
    };
  }
  if (category_id === 'Same Day Delivery') {
    return {
      start: new Date(currentTime + 240 * 60 * 1000).toISOString(),
      end: new Date(currentTime + 360 * 60 * 1000).toISOString(),
    };
  }
  if (category_id === 'Next Day Delivery') {
    const currentDate = new Date();
    const startTime = new Date();
    const endTime = new Date();
    startTime.setDate(currentDate.getDate() + 1);
    startTime.setHours(14, 0, 0, 0);
    endTime.setDate(currentDate.getDate() + 1);
    endTime.setHours(16, 0, 0, 0);
    return { start: new Date(startTime).toISOString(), end: new Date(endTime).toISOString() };
  }
  if (category_id === 'Express Delivery') {
    const currentDate = new Date();
    const startTime = new Date();
    const endTime = new Date();
    startTime.setDate(currentDate.getDate() + 4);
    startTime.setHours(14, 0, 0, 0);
    endTime.setDate(currentDate.getDate() + 4);
    endTime.setHours(16, 0, 0, 0);

    return { start: new Date(startTime).toISOString(), end: new Date(endTime).toISOString() };
  } else {
    return { start: new Date(currentTime).toISOString(), end: new Date(currentTime + 15 * 60 * 1000).toISOString() };
  }
};

function addISODurationToDate({ currentDateISO,durationISO}:{currentDateISO:string, durationISO:string}) {
  const currentDate = new Date(currentDateISO);
  let durationMillis = 0;

  // Parse the ISO 8601 duration
  const isoDurationRegex = /P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/;
  const matches = durationISO.match(isoDurationRegex);

  if (matches) {
    const days = parseInt(matches[1], 10) || 0;
    const hours = parseInt(matches[2], 10) || 0;
    const minutes = parseInt(matches[3], 10) || 0;
    const seconds = parseInt(matches[4], 10) || 0;

    durationMillis += days * 86400000; // 24 * 60 * 60 * 1000
    durationMillis += hours * 3600000; // 60 * 60 * 1000
    durationMillis += minutes * 60000; // 60 * 1000
    durationMillis += seconds * 1000;  // 1000
  }

  const newDate = new Date(currentDate.getTime() + durationMillis);
  return newDate.toISOString();
}


// function subtractDurations(totalDuration:string, subDuration:string) {
//   const parseISODuration = (isoDuration:any) => {
//     const regex = /P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/;
//     const matches = isoDuration.match(regex);
//     return {
//       days: parseInt(matches[1] || 0, 10),
//       hours: parseInt(matches[2] || 0, 10),
//       minutes: parseInt(matches[3] || 0, 10),
//       seconds: parseInt(matches[4] || 0, 10),
//     };
//   };

//   const formatISODuration = ({ days, hours, minutes, seconds }:any) => {
//     let result = 'P';
//     if (days > 0) result += `${days}D`;
//     if (hours > 0 || minutes > 0 || seconds > 0) result += 'T';
//     if (hours > 0) result += `${hours}H`;
//     if (minutes > 0) result += `${minutes}M`;
//     if (seconds > 0) result += `${seconds}S`;
//     if (result === 'P' || result === 'PT') result += '0S'; // Handle case where the duration is zero
//     return result;
//   };

//   const total = parseISODuration(totalDuration);
//   const sub = parseISODuration(subDuration);

//   // Convert total and sub durations to seconds
//   const totalSeconds = total.days * 24 * 3600 + total.hours * 3600 + total.minutes * 60 + total.seconds;
//   const subSeconds = sub.days * 24 * 3600 + sub.hours * 3600 + sub.minutes * 60 + sub.seconds;

//   // Subtract the durations in seconds
//   let remainingSeconds = totalSeconds - subSeconds;
//   if (remainingSeconds < 0) {
//     throw new Error('Subtraction results in a negative duration');
//   }

//   const resultDays = Math.floor(remainingSeconds / (24 * 3600));
//   remainingSeconds %= (24 * 3600);
//   const resultHours = Math.floor(remainingSeconds / 3600);
//   remainingSeconds %= 3600;
//   const resultMinutes = Math.floor(remainingSeconds / 60);
//   remainingSeconds %= 60;
//   const resultSeconds = remainingSeconds;

//   const result = {
//     days: resultDays,
//     hours: resultHours,
//     minutes: resultMinutes,
//     seconds: resultSeconds,
//   };

//   return formatISODuration(result);
// }


export function startRangeAndEndRange({currentTimeIsoString,duration,tat}:{currentTimeIsoString:string,duration:string,tat:string}){

  const starterStartRange = addISODurationToDate({currentDateISO:currentTimeIsoString,durationISO:duration})
  const starterEndRange = addISODurationToDate({currentDateISO:starterStartRange,durationISO:duration})


  // const endDuration = subtractDurations(tat,duration)
  const endEndRange =  addISODurationToDate({currentDateISO:starterEndRange,durationISO:tat})
  return {
    startRang:{
      start:currentTimeIsoString,
      end:starterEndRange
    },
    endRange:{
      start:starterEndRange,
      end:endEndRange
    }
  }
}






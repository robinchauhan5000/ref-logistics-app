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


function subtractISODurations(duration1ISO:any, duration2ISO:any) {
  const parseISODuration = (durationISO:any) => {
    const isoDurationRegex = /P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/;
    const matches = durationISO.match(isoDurationRegex);
    
    if (matches) {
      const days = parseInt(matches[1], 10) || 0;
      const hours = parseInt(matches[2], 10) || 0;
      const minutes = parseInt(matches[3], 10) || 0;
      const seconds = parseInt(matches[4], 10) || 0;

      return {
        days,
        hours,
        minutes,
        seconds
      };
    }
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  };

  const duration1 = parseISODuration(duration1ISO);
  const duration2 = parseISODuration(duration2ISO);

  let totalSeconds1 = duration1.days * 86400 + duration1.hours * 3600 + duration1.minutes * 60 + duration1.seconds;
  let totalSeconds2 = duration2.days * 86400 + duration2.hours * 3600 + duration2.minutes * 60 + duration2.seconds;

  let totalSeconds = totalSeconds1 - totalSeconds2;

  const days = Math.floor(totalSeconds / 86400);
  totalSeconds %= 86400;
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  totalSeconds %= 60;
  const seconds = totalSeconds;

  let resultISO = 'P';
  if (days > 0) resultISO += `${days}D`;
  if (hours > 0 || minutes > 0 || seconds > 0) resultISO += 'T';
  if (hours > 0) resultISO += `${hours}H`;
  if (minutes > 0) resultISO += `${minutes}M`;
  if (seconds > 0) resultISO += `${seconds}S`;

  return resultISO || 'P0D';
}

export function startRangeAndEndRange({currentTimeIsoString,duration,tat}:{currentTimeIsoString:string,duration:string,tat:string}){

  const starterStartRange = addISODurationToDate({currentDateISO:currentTimeIsoString,durationISO:duration})
  // const starterEndRange = addISODurationToDate({currentDateISO:starterStartRange,durationISO:duration})


  const endDuration = subtractISODurations(tat,duration)
  const endEndRange =  addISODurationToDate({currentDateISO:starterStartRange,durationISO:endDuration})
  return {
    startRang:{
      start:currentTimeIsoString,
      end:starterStartRange
    },
    endRange:{
      start:starterStartRange,
      end:endEndRange
    }
  }
}







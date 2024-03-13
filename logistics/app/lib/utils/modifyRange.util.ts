export const generateStartTime = async (category_id: string) => {
  const currentTime = Date.now();
  if (category_id === 'Immediate Delivery') {
    return { start: new Date(currentTime).toISOString(), end: new Date(currentTime + 15 * 60 * 1000).toISOString() };
  }
  
  if (category_id === 'Same Day Delivery') {
    return { start: new Date(currentTime).toISOString(), end: new Date(currentTime + 120 * 60 * 1000).toISOString() };
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

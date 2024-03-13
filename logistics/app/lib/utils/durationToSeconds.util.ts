export const durationToSeconds = (duration: String) => {
    const regex = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;
    const match = duration.match(regex);
    console.log({match})
  
    if (!match) {
      throw new Error('Invalid ISO 8601 duration format');
    }
  
    const years = match[1] ? parseInt(match[1]) : 0;
    const months = match[2] ? parseInt(match[2]) : 0;
    const days = match[3] ? parseInt(match[3]) : 0;
    const hours = match[4] ? parseInt(match[4]) : 0;
    const minutes = match[5] ? parseInt(match[5]) : 0;
    const seconds = match[6] ? parseFloat(match[6]) : 0;
  
    const totalSeconds = years * 31536000 + months * 2592000 + days * 86400 + hours * 3600 + minutes * 60 + seconds;
  
    return totalSeconds * 1000;
  };
  
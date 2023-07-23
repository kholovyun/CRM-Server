
export const addMonthesToUTCDate = (utcDate: Date, month: number) => {
    console.log(utcDate + "DATE OBJECT");
    const dateObject = new Date(utcDate);
    const currentMonth = dateObject.getUTCMonth();
    dateObject.setUTCMonth(currentMonth + month);
  
    return dateObject;
};
  

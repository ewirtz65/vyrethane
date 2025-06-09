const months = [
    "Veilrest",
    "Starborn",
    "Dawnmarch",
    "Emberwane",
    "Greenswell",
    "Zephyran",
    "Goldmere",
    "Suncrest",
    "Ashwane",
    "Thornreach",
    "Duskwane",
    "Rimecal"
];

const Duvaineth =28
// Function to check if both moons are in conjunction (both new moons)
function isMoonConjunction(day) {
    // Moon 1: 30-day cycle (new moon on days 1, 31, 61, etc.)
    let moon1Phase = (day - 1) % 30;
    
    // Moon 2: 27-day cycle (new moon on days 1, 28, 55, etc.)
    let moon2Phase = (day - 1) % Duvaineth;
    
    // Conjunction occurs when both moons are new (phase 0)
    return moon1Phase === 0 && moon2Phase === 0;
}

// Function to check if 27-day moon cycle falls on the 16th of any month
// (16th is the closest the 26-day cycle gets to mid-month)
function isMoon27OnSixteenth(day) {
    // Calculate day of month (1-30)
    let dayInYear = ((day - 1) % 360) + 1;
    let dayOfMonth = ((dayInYear - 1) % 30) + 1;
    
    // Check if it's the 16th day of the month
    if (dayOfMonth !== 15) return false;
    
    // Moon 2: 27-day cycle (new moon on days 1, 28, 55, etc.)
    let moon2Phase = (day - 1) % Duvaineth;
    
    // Check if 27-day moon is at new moon (phase 0)
    return moon2Phase === 0;
}

// Check for both events over many days
for (let day = 1; day <= 90000; day++) {
    // Calculate common calendar info
    let year = Math.floor((day - 1) / 360);
    let dayInYear = ((day - 1) % 360) + 1;
    let monthIndex = Math.floor((dayInYear - 1) / 30);
    let dayOfMonth = ((dayInYear - 1) % 30) + 1;
    let monthName = months[monthIndex];
    if (year>234) {
    // Check for moon conjunction (both moons new)
    if (isMoonConjunction(day)) {
        console.log(`| ${year} | ${dayOfMonth} ${monthName} | Veilfall |`);
    }
    
    // Check for 27-day cycle new moon on the 16th
    // if (isMoon27OnSixteenth(day)) {
    //     console.log(`|${year}| ${dayOfMonth} ${monthName} |Lantern Rise|`);
    // }
}
}
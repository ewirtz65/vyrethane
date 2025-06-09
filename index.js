const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { classifySettlement, calculateAge, formatMarkdown } = require('./utils.js');
const { generateEventsJSON } = require('./generators/eventGenerator.js'); // Updated import


const INPUT_CSV = './input/Alborough Duchy.csv';
// const INPUT_CSV = './input/Kingdom of Ashendral.csv';
// const INPUT_CSV = './input/Vyrethane Burgs (2).csv';
const OUTPUT_DIR = './output';

const settlements = [];

async function process() {
    fs.createReadStream(INPUT_CSV)
        .pipe(csv())
        .on('data', (row) => {
            // Ensure default values for missing fields
            row["Province Full Name"] = row["Province Full Name"]?.trim() || "None";
            row["State Full Name"] = row["State Full Name"]?.trim() || "None";
            settlements.push(row);
        })
        .on('end', async () => {
            for (const settlement of settlements) {
                console.log(`==============================================================`);
                console.log(`Generating Markdown for: ${settlement.Burg}`, settlement.Id, settlement.State);
                
                const classification = classifySettlement(settlement);
                const ageInfo = calculateAge(settlement);
                const eventCount = Math.floor(Math.random() * 20) + ageInfo.ageModifier;
                console.info(`Event Count: ${eventCount}`);

                // Updated to use generateEventsJSON - now returns JSON format
                const events = await generateEventsJSON(settlement, eventCount, ageInfo.founded);

                const markdown = await formatMarkdown(settlement, ageInfo, events);

                const stateDir = path.join(OUTPUT_DIR, settlement.State.replace(/\s+/g, '_'));
                if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true });

                const filePath = path.join(stateDir, `${settlement.Burg.replace(/\s+/g, '_')}.md`);
                fs.writeFileSync(filePath, markdown);
                console.log(`Finished Generating: ${settlement.Burg}`);
                console.log(`==============================================================`);
            }

            console.log('Markdown files generated.');
        });
}

process();
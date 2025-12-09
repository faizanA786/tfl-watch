//background script

async function main(naptanID) {
    chrome.alarms.create("updateTrains",{periodInMinutes: 0.5});

    function handleAlarm(alarm) {
        if (alarm.name === "updateTrains") {
            main(naptanID);
            console.log("UPDATING")
        }
    }
    chrome.alarms.onAlarm.addListener(handleAlarm)

    try {
        const url = "https://api.tfl.gov.uk/StopPoint/" + naptanID + "/Arrivals"; //arrival predictions
        const res = await fetch(url);
        const data = await res.json();
        
        let trains = []
        let outboundCount = 0;
        let inboundCount = 0;

        function sortByTime(a, b) {
            const timeA = new Date(a.expectedArrival).getTime();
            const timeB = new Date(b.expectedArrival).getTime();
            return timeA - timeB; //ascending order 
        }       
        data.sort(sortByTime) //compare every pair of train

        for (let i=0; i<data.length; i++) {

            if (inboundCount < 3 && data[i].direction === "inbound") {
                trains.push(data[i])
                inboundCount++;
            }
            if (outboundCount < 3 && data[i].direction === "outbound") {
                trains.push(data[i])
                outboundCount++;
            }
        }

        console.log(trains.length)
        for (let j=0; j<trains.length; j++) {
            console.log(trains[j].destinationName)
            console.log(trains[j].direction)
            console.log(trains[j].expectedArrival) //seconds
            console.log("\n")
        }

        chrome.storage.session.set({
            arrivals: trains //store array
        })
    }

    catch (error) {
        console.log(error)
    }
}

const id = "910GMANRPK" //manor park rail station naptan ID
main(id);
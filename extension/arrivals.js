//background script

async function getId() {
    try {
        const res = await chrome.storage.session.get(["naptanId"])
        const id = res.naptanId || false
        return id
    }
    catch(error) {
        console.log(error)
    }

}

async function main() {
    const naptanID = await getId();
    if (!naptanID) {
        return
    }
    console.log(naptanID)
    
    try {
        const errRes = await chrome.storage.session.get(["error"])
        const error = errRes.error || false
        if (error == "invalid" || error == "undefined") {
            return
        }

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

        if (trains.length == 0) {
            chrome.storage.session.set({
                error: "empty"
            })
            return
        }
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

chrome.alarms.create("updateTrains",{periodInMinutes: 0.5});

function handleAlarm(alarm) {
    if (alarm.name === "updateTrains") {
        main();
        console.log("UPDATING")
    }
}

function handleMessage(msg) {
    if (msg.type == "trigger" && msg.name == "updateTrains") {
        console.log("msg validated")
        main();

        function create() {
            chrome.alarms.create("updateTrains",{periodInMinutes: 0.5});
        }
        chrome.alarms.clear("updateTrains", create) //create alarm AFTER clearing is complete
    }
}

chrome.runtime.onMessage.addListener(handleMessage)
chrome.alarms.onAlarm.addListener(handleAlarm);

main();
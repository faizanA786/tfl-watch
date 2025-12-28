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

function sortByTime(a, b) {
    const timeA = new Date(a.expectedArrival).getTime();
    const timeB = new Date(b.expectedArrival).getTime();
    return timeA - timeB; //ascending order 
}  

async function main() {
    const naptanID = await getId();
    let bus = false;
    if (!naptanID) {
        return
    }
    if (Array.isArray(naptanID)) {
        bus = true;
    }
    console.log(naptanID)

    try {
        const errRes = await chrome.storage.session.get(["error"])
        const error = errRes.error || false
        if (error == "invalid" || error == "undefined") {
            return
        }

        if (bus) {
            let buses = []

            if (naptanID.length == 1) {
                const res = await fetch("https://api.tfl.gov.uk/StopPoint/" + naptanID  + "/Arrivals"); 
                const data = await res.json();
                data.sort(sortByTime) 

                let busCount = 0;
                for (let i=0; i<data.length; i++) {
                    if (busCount < 3) {
                        buses.push(data[i])
                        busCount++;
                    }
                    else if (busCount >= 3) {
                        break;
                    }
                }
            }
            else {
                for (const directionalNaptan of naptanID) { //for each bus stop
                    const res = await fetch("https://api.tfl.gov.uk/StopPoint/" + directionalNaptan  + "/Arrivals"); 
                    const data = await res.json();
                    data.sort(sortByTime) 

                    let busCount = 0;
                    for (let i=0; i<data.length; i++) {
                        if (busCount < 3) {
                            buses.push(data[i])
                            busCount++;
                        }
                        else if (busCount >= 3) {
                            break;
                        }
                    }
                }
            }

            if (buses.length == 0) {
                chrome.storage.session.set({
                    error: "empty"
                })
                return
            }

            chrome.storage.session.set({
                arrivals: buses //store array
            })
            return
        }

        const res = await fetch("https://api.tfl.gov.uk/StopPoint/" + naptanID  + "/Arrivals"); //arrival predictions
        const data = await res.json();
        console.log(data)
        data.sort(sortByTime) //compare every pair of train
        
        let trains = []
        let outboundCount = 0;
        let inboundCount = 0;
        for (let i=0; i<data.length; i++) {
            if (inboundCount < 3 && data[i].direction === "inbound") {
                trains.push(data[i])
                inboundCount++;
            }
            else if (inboundCount >= 3) {
                break
            }
        }
        for (let i=0; i<data.length; i++) {
            if (outboundCount < 3 && data[i].direction === "outbound") {
                trains.push(data[i])
                outboundCount++;
            }
            else if (outboundCount >= 3) {
                break
            }
        }

        if (trains.length == 0) {
            chrome.storage.session.set({
                error: "empty"
            })
            return
        }
        // for (let j=0; j<trains.length; j++) {
        //     console.log(trains[j].destinationName)
        //     console.log(trains[j].direction)
        //     console.log(trains[j].expectedArrival) //seconds
        //     console.log("\n")
        // }

        chrome.storage.session.set({
            arrivals: trains //store array
        })
        chrome.runtime.sendMessage({type: "trigger", name: "updateFrontend"})
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
import {main} from "./arrivals.js";
import {disruptions} from "./disruptions.js";

function handleAlarms(alarm) {
    if (alarm.name === "updateTrains") {
        main();
    }
}

function handleMessage(msg, sender, sendResponse) {
    try {
        if (msg.type == "trigger" && msg.name == "getDisruptions") {
            async function handleDisruptions() {
                await disruptions();
                sendResponse({ready: true})
            }
            handleDisruptions();
            return true
        }
        else if (msg.type == "trigger" && msg.name == "updateTrains") {
            main();

            function create() {
                chrome.alarms.create("updateTrains",{periodInMinutes: 1});
            }
            chrome.alarms.clear("updateTrains", create) //create alarm AFTER clearing is complete so we dont double fetch
            
        }
    }
    catch(error) {
        console.log(error)
    }

}

chrome.runtime.onMessage.addListener(handleMessage)
chrome.alarms.onAlarm.addListener(handleAlarms);
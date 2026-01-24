import {main} from "./arrivals.js";
import {disruptions} from "./disruptions.js";

function handleMessage(msg, sender, sendResponse) {
    try {
        if (msg.type == "trigger" && msg.name == "getDisruptions") {
            async function handleDisruptions(params) {
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
            chrome.alarms.clear("updateTrains", create) //create alarm AFTER clearing is complete
        }
    }
    catch(error) {
        console.log(error)
    }

}

chrome.runtime.onMessage.addListener(handleMessage)
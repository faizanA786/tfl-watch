async function liveArrivals() {
    try {
        const errRes = await chrome.storage.session.get(["error"])
        const error = errRes.error || false
        document.getElementById("main").innerHTML = "";

        let p = document.getElementById("msg");
        if (!p) {
            p = document.createElement("p")
            p.textContent = "Loading..."
            p.id = "msg";
            document.getElementById("main").appendChild(p)
        }


        if (error == "empty") {
            p.textContent = "This mode of transport is not currently operating at this station."
            return
        }
        if (error == "undefined") {
            p.textContent = "Please choose a mode of transport for this station"
            return
        }
        else if (error == "invalid") {
            p.textContent = "This station was not found with the chosen mode of transport."
            return
        }

        const res = await chrome.storage.session.get(["arrivals"]);
        const arrivals = res.arrivals || [] 
        if (arrivals.length == 0) {
            p.textContent = "Search for a station to see arrival predictions"
            return
        }
        p.remove()

        const main = document.getElementById("main");

        const resMode = await chrome.storage.session.get(["mode"]);
        const mode = resMode.mode
        let elizabethLine = false;
        if (mode == "elizabeth-line") {
            elizabethLine = true
        }

        for (const vehicle of arrivals) {
            const p = document.createElement("p")
            const minuteStr = vehicle.expectedArrival.split("T")[1].substring(0, 5);
            p.innerHTML = (elizabethLine ? "" : "<b>" + vehicle.lineName + "</b>" + "<br>") + "To: " + vehicle.destinationName + "<br>" + "Expected: " + minuteStr;

            main.appendChild(p)
            main.appendChild(document.createElement("br"))

        }

    }
    catch(error) {
        console.log(error)
    }

}

async function getDisruptions() {
    try{ 
        const response = await chrome.runtime.sendMessage({type: "trigger", name: "getDisruptions"})

        const res = await chrome.storage.local.get(["disruptionsCache"])
        const disruptions = res.disruptionsCache.data || false
        if (!disruptions) {
            console.log("null disruptions")
            return
        }

        for (const disruption of disruptions) {
            const lineName = disruption.name
            const status = disruption.lineStatuses[0].statusSeverityDescription
            let reason = disruption.lineStatuses[0].reason
            if (status == "Good Service") {
                continue
            }
            reason = reason.substring(reason.indexOf(":") + 1).trim();

            const p = document.createElement("p")
            p.innerHTML = "<b>" + lineName + "</b>" + "<br>" + reason;

            main.appendChild(p)
            main.appendChild(document.createElement("br"))

        }
    }
    catch(error) {
        console.log(error)
    }
}

function handleFeature() {
    chrome.storage.session.set({
        "naptanId": null,
    })
    document.getElementById("main").innerHTML = ""
    const arrivalsForm = document.getElementById("searchForm")

    const feature = features.value;
    if (feature == "arrivals") {
        arrivalsForm.style.display = "flex"
        liveArrivals();
    }
    else if (feature == "disruptions") {
        arrivalsForm.style.display = "none"
        getDisruptions();
    }
}

const features = document.getElementById("feature")
features.addEventListener("change", handleFeature)
handleFeature();

function handleChange(changes, areaName) { //arrivals have been updated or error
    if (areaName == "session" && changes.error || changes.arrivals) {
        liveArrivals();   
    }
}
chrome.storage.onChanged.addListener(handleChange);
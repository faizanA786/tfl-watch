
async function updateFrontend() {
    try {
        const errRes = await chrome.storage.session.get(["error"])
        const error = errRes.error || false
        document.getElementById("main").innerHTML = "";


        let p = document.getElementById("msg");
        if (!p) {
            p = document.createElement("p")
            p.textContent = "Loading..."
            p.id = "msg";
            document.body.appendChild(p)
        }

        if (error == "undefined") {
            p.textContent = "Please choose a mode of transport for this station"
            return
        }
        else if (error == "invalid") {
            p.textContent = "This station was not found with the chosen mode of transport."
            return
        }
        else if (error == "empty") {
            p.textContent = "This mode of transport is not currently operating at this station."
            return
        }

        const res = await chrome.storage.session.get(["arrivals"]);
        const arrivals = res.arrivals || [] 
        if (arrivals.length == 0) {
            p.textContent = "Search for a station to see arrival predictions"
            return
        }
        p.remove()

        let sectionCount = 0;
        let section = []
        const main = document.getElementById("main");
        for (const vehicle of arrivals) {
            const p = document.createElement("p")
            const minuteStr = vehicle.expectedArrival.split("T")[1].substring(0, 5);
            p.innerHTML = "[" + vehicle.lineName + "]" + "<br>" + vehicle.destinationName + "<br>" + "Expected: " + minuteStr;

            section.push(p)
            sectionCount++;

            if (sectionCount >= 3) {
                const border = document.createElement("hr")
                for (const p of section) {
                    main.appendChild(p)
                }
                main.appendChild(border)
                section = []
                sectionCount = 0;
            }

        }

        // document.getElementById("border").style.visibility = "visible";

        // let inboundTrains = [];
        // let outboundTrains = [];
        // for (let train of trains) {
        //     if (train.direction == "inbound") {
        //         inboundTrains.push(train)
        //     }
        //     else {
        //         outboundTrains.push(train)
        //     }
        // }

        // for (let j=0; j<inboundTrains.length; j++) {
        //     let minutesStr = inboundTrains[j].expectedArrival.split("T")[1].substring(0, 5);
        //     document.getElementById(j+"a").innerHTML = inboundTrains[j].destinationName
        //     document.getElementById(j+"a").innerHTML += " - " + minutesStr
        // }
        // for (let j=0; j<outboundTrains.length; j++) {
        //     let minutesStr = outboundTrains[j].expectedArrival.split("T")[1].substring(0, 5);
        //     document.getElementById(j+"b").innerHTML = outboundTrains[j].destinationName
        //     document.getElementById(j+"b").innerHTML += " - " + minutesStr
        // }
    }
    catch(error) {
        console.log(error)
    }

    // let inboundTrain, outboundTrain;
    // for (let i=0; i<trains.length; i++) {
    //     if (inboundTrain == null && trains[i].direction == "inbound") {
    //         inboundTrain = trains[i]
    //     }
    //     if (outboundTrain == null && trains[i].direction == "outbound") {
    //         outboundTrain = trains[i]
    //     }

    //     if (inboundTrain && outboundTrain) {
    //         break;
    //     }
    // }
}

setInterval(updateFrontend, 1000)
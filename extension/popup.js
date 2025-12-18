
async function updateFrontend() {
    try {
        const errRes = await chrome.storage.session.get(["error"])
        const error = errRes.error || false
        for (let i=0; i<3; i++) {
            document.getElementById(i + "a").innerHTML = ""
        }
        for (let i=0; i<3; i++) {
            document.getElementById(i + "b").innerHTML = ""
        }

        if (error == "undefined") {
            document.getElementById("border").style.visibility = "hidden"
            document.getElementById("0a").innerHTML = "Please choose a mode of transport for this station"
            return
        }
        else if (error == "invalid") {
            document.getElementById("border").style.visibility = "hidden"
            document.getElementById("0a").innerHTML = "This station was not found with the chosen mode of transport."
            return
        }
        else if (error == "empty") {
            document.getElementById("border").style.visibility = "hidden"
            document.getElementById("0a").innerHTML = "This mode of transport is not currently operating at this station."
            return
        }

        const res = await chrome.storage.session.get(["arrivals"]);
        const trains = res.arrivals || [] 
        if (trains.length == 0) {
            document.getElementById("0a").innerHTML = "Search for a station to see arrival predictions"
            document.getElementById("border").style.visibility = "hidden";
            return
        }

        document.getElementById("border").style.visibility = "visible";

        let inboundTrains = [];
        let outboundTrains = [];
        for (let train of trains) {
            if (train.direction == "inbound") {
                inboundTrains.push(train)
            }
            else {
                outboundTrains.push(train)
            }
        }

        for (let j=0; j<inboundTrains.length; j++) {
            let minutesStr = inboundTrains[j].expectedArrival.split("T")[1].substring(0, 5);
            document.getElementById(j+"a").innerHTML = inboundTrains[j].destinationName
            document.getElementById(j+"a").innerHTML += " - " + minutesStr
        }
        for (let j=0; j<outboundTrains.length; j++) {
            let minutesStr = outboundTrains[j].expectedArrival.split("T")[1].substring(0, 5);
            document.getElementById(j+"b").innerHTML = outboundTrains[j].destinationName
            document.getElementById(j+"b").innerHTML += " - " + minutesStr
        }


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

setInterval(updateFrontend, 1500)
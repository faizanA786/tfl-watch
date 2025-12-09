
async function updateFrontend() {
    const res = await chrome.storage.session.get(["arrivals"]);
    const trains = res.arrivals || [] 
    if (trains.length == 0) {
        console.log("NOT FETCHED YET")
        return
    }

    let inboundTrain, outboundTrain;
    for (let i=0; i<trains.length; i++) {
        if (inboundTrain == null && trains[i].direction == "inbound") {
            inboundTrain = trains[i]
        }
        if (outboundTrain == null && trains[i].direction == "outbound") {
            outboundTrain = trains[i]
        }

        if (inboundTrain && outboundTrain) {
            break;
        }
    }

    let minutesStr = inboundTrain.expectedArrival.split("T")[1].substring(0, 5);
    document.getElementById("1a").innerHTML = inboundTrain.direction
    document.getElementById("1b").innerHTML = inboundTrain.destinationName
    document.getElementById("1c").innerHTML = minutesStr

    minutesStr = outboundTrain.expectedArrival.split("T")[1].substring(0, 5);
    document.getElementById("2a").innerHTML = outboundTrain.direction
    document.getElementById("2b").innerHTML = outboundTrain.destinationName
    document.getElementById("2c").innerHTML = minutesStr
}

setInterval(updateFrontend, 1000)
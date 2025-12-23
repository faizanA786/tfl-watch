async function search(searchStr) {
    let mode;
    let data;

    try {
        for (const radio of radios) {
            if (radio.checked) {
                mode = radio.value
                break;
            }
        }
        if (mode == null || searchStr == "") {
            chrome.storage.session.set({
                error: "undefined"
            })

            console.log("UNDEFINED")
            return
        }

        chrome.storage.session.set({
            error: false
        })

        //searching
        const res = await fetch("https://api.tfl.gov.uk/StopPoint/Search?query=" + encodeURIComponent(searchStr) + "&modes=" + mode)
        const data = await res.json()
        console.log(data)
        if (data.matches.length == 0) {
            chrome.storage.session.set({
                error: "invalid"
            })

            console.log("INVALID MODE")
            return
        }

        let naptanId;
        if (!data.matches[0].topMostParentId) { //hub
            const hubRes = await fetch("https://api.tfl.gov.uk/StopPoint/" + encodeURIComponent(data.matches[0].id))
            const hubData = await hubRes.json()
            console.log(hubData)

            let stopPoints = [];
            for (let i=0; i<hubData.children.length; i++) {
                const child = hubData.children[i]

                if (child.stopType == "NaptanMetroStation" || "NaptanRailStation") {
                    if (child.modes.includes(mode)) {
                        stopPoints.push(child)
                    }
                }

            }
            console.log(stopPoints)

            naptanId = stopPoints[0].naptanId;
        }
        else { //normal stopPoint
            naptanId = data.matches[0].topMostParentId;

            if (mode == "bus") {
                const busRes = await fetch("https://api.tfl.gov.uk/StopPoint/" + naptanId) //bus mode special query/behaviour
                const busData = await busRes.json()
                console.log(busData)

                if (busData.children.length == 0) {
                    naptanId = [busData.naptanId]
                }
                else {
                    let directionalNaptans = []
                    for (let bus of busData.children) {
                        directionalNaptans.push(bus.naptanId)
                    }
                    console.log(directionalNaptans)

                    naptanId = directionalNaptans
                }
            }
        }

        // for (let i=0; i<data.length; i++) {
        //     console.log(data[i].matches)
        // }

        chrome.storage.session.set({
            "naptanId": naptanId
        })

        console.log("naptan id: " + naptanId)
        console.log("done")

        chrome.runtime.sendMessage({type: "trigger", name: "updateTrains"})
    }
    catch(error) {
        console.log(error)
    }

}

async function preventDefault(event) {
    console.log("searching")
    event.preventDefault();

    const searchStr = input.value.trim()
    await search(searchStr)
}

const form = document.getElementById("searchForm")
form.addEventListener("submit", preventDefault)

const input = document.getElementById("searchInput")
const radios = document.getElementsByName("mode");
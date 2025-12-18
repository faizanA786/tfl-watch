function handleError() {
    
}

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
        if (mode == null) {
            chrome.storage.session.set({
                error: "undefined"
            })

            console.log("UNDEFINED MODE")
            return
        }
        chrome.storage.session.set({
            error: false
        })

        let res = await fetch("https://api.tfl.gov.uk/StopPoint/Search?query=" + encodeURIComponent(searchStr) + "&modes=" + mode)
        data = await res.json()
        console.log(data)
        if (data.matches.length == 0) {
            chrome.storage.session.set({
                error: "invalid"
            })

            console.log("INVALID MODE")
            return
        }

        if (!data.matches[0].topMostParentId) { //hub
            let children_res = await fetch("https://api.tfl.gov.uk/StopPoint/" + encodeURIComponent(data.matches[0].id))
            let children_data = await children_res.json()

            console.log(children_data)
        }

        // for (let i=0; i<data.length; i++) {
        //     console.log(data[i].matches)
        // }

        const naptanId = data.matches[0].topMostParentId
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
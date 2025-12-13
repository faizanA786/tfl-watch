async function search(searchStr) {
    try {
        let res = await fetch("https://api.tfl.gov.uk/StopPoint/Search?query=" + encodeURIComponent(searchStr) + "&modes=tube,overground,elizabeth-line,national-rail")
        let data = await res.json()

        console.log(data)

        for (let i=0; i<data.length; i++) {
            console.log(data[i].matches)
        }

        const naptanId = data.matches[0].topMostParentId
        chrome.storage.session.set({
            "naptanId": naptanId
        })

        console.log("naptan id: " + naptanId)
        console.log("done")
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
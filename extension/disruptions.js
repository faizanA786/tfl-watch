export async function disruptions() {
    const res = await fetch("https://api.tfl.gov.uk/Line/Mode/tube,overground,elizabeth-line,dlr,tram/Status")
    const data = await res.json()
    console.log(data)

    chrome.storage.session.set({
        disruptions: data
    })
}

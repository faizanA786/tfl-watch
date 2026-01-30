async function getCachedDisruptions() {
    try {
        const res = await chrome.storage.local.get(["disruptionsCache"])
        const data = res.disruptionsCache?.data || false
        const time = res.disruptionsCache?.time || false
        if (!data || !time) {
            return false //missing cache
        }
        const maxTimeToLive = 5*60*1000; //10 minutes
        const timeNow = Date.now()-time

        if (timeNow < maxTimeToLive) {
            return true //using cached data
        }
    }
    catch(error) {
        console.log(error)
    }
}

export async function disruptions() {
    if(await getCachedDisruptions()) {
        console.log("using cached data")
        return
    }

    try {
        const res = await fetch("https://api.tfl.gov.uk/Line/Mode/tube,overground,elizabeth-line,dlr,tram/Status")
        const data = await res.json()
        const time = Date.now()
        console.log(data)

        const object = {data, time}

        chrome.storage.local.set({
            disruptionsCache: object
        })
    }
    catch(error) {
        console.log(error)
    }

}

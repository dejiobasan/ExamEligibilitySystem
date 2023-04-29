const reader = new dp.devices.FingerprintReader()
const image = document.querySelector("#fingerprint")
const button = document.querySelector("#fingerprint_button")
const Utf8 = dp.core.Utf8
const Base64 = dp.core.Base64
const fingerprintImages = document.querySelectorAll(".fingerprint_image")
const modal = document.querySelector(".modal-custom")
const scanButton = document.querySelector("#scan_button")
const scanCount = document.querySelector("#scan-count")
const left = document.querySelector(".left")
const right = document.querySelector(".right")
const saveButton = document.querySelector("#save_button")
const formSubmit = document.querySelector("#form_submit")
const recordCount = ["/ExamCheckIn", "/ExamCheckOut"].includes(window.location.pathname) ? 1 : 5;



const recordedImages = []
let deviceUid = 0

let scanning = false

let imagePos = 0


document.querySelector(".modal-child").addEventListener("click", (e) => {
    e.stopPropagation()
})
modal.addEventListener("click", () => {
    modal.classList.toggle("hidden")
})
left?.addEventListener("click", (e) => {
    if (recordedImages.length === 0) return
    imagePos = Math.max(0, --imagePos)

    image.src = recordedImages[imagePos]
})

right?.addEventListener("click", (e) => {
    if (recordedImages.length === 0) return
    imagePos = Math.min(recordedImages.length - 1, ++imagePos)
    image.src = recordedImages[imagePos]
})
reader.on("SamplesAcquired",async (e) => {
    console.log(e)
    const sample = e.samples[0]
    const src = "data:image/png;base64," + btoa(Utf8.fromBase64Url(sample))
    recordedImages.push(src)
    scanCount.textContent = `${recordedImages.length}`
    imagePos = recordedImages.length - 1
    image.src = recordedImages[imagePos]
    console.log(recordedImages.length)
    scanning = false
    console.log("stoping fingerprint acquisition")
    await reader.stopAcquisition(deviceUid);
    scanButton.textContent = "Scan"
});		

reader.on("DeviceConnected", (e) => {
    console.log(e)
});
async function wait(duration) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), duration * 1000)
    })
}


button.addEventListener("click", (e) => {
    modal.classList.toggle("hidden")
})
scanButton.addEventListener("click", async (e) => {
    if (scanning || recordedImages.length === recordCount) return
   
    const devices = await reader.enumerateDevices()

    if (devices.length === 0) {
        throw new Error("No fingerprint reader is connected")
    }
    scanning = true
    scanButton.textContent = "Scanning..."
    deviceUid = devices[0]

    console.log("starting fingerprint acquisition")
    await reader.startAcquisition(dp.devices.SampleFormat.PngImage, deviceUid)

    await wait(5)
    if (!scanning) return
    console.log("stoping fingerprint acquisition")
    await reader.stopAcquisition(deviceUid)
    scanning = false
    scanButton.textContent = "Scan"
});


saveButton.addEventListener("click", (e) => {
    if (recordedImages.length !== recordCount) return
    modal.classList.toggle("hidden")
})

formSubmit?.addEventListener("submit", async (e) => {
    e.preventDefault()
    if (recordedImages.length !== recordCount) return;
    const form = new FormData(e.target)

    if (["/ExamCheckIn", "/ExamCheckOut"].includes(window.location.pathname)) {
        form.append("image", recordedImages[0])

        let res = await fetch(window.location.pathname, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(form.entries())),
        })

        if (res.ok) {
            window.location.href = "/AuthSuccess"
        } else {
            window.location.href = "/AuthFailure"
        }
    }   else {

    

    for (let i = 0; i < recordCount; i++) {
        form.append(`image${i + 1}`, recordedImages[i])
    }

    let res = await fetch("/EnrollStudents", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(form.entries())),
    })

    if (res.ok) {
        window.location.href = "/EnrollSuccess"
    } else {
        console.error("An error occured with saving the student data")
    }
}
})
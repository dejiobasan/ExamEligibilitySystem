const reader = new dp.devices.FingerprintReader()
const outputContainer = document.querySelector(".fingerprints-container")
const button = document.querySelector("#EnrollButton")
const Utf8 = dp.core.Utf8
const Base64 = dp.core.Base64

reader.on("SamplesAcquired", (e) => {
    console.log(e)
    const image = new Image()
    const sample = e.samples[0]
    image.src = "data:image/png;base64," + btoa(Utf8.fromBase64Url(sample))
    outputContainer.appendChild(image)
});		

reader.on("DeviceConnected", (e) => {
    console.log(e)
});
async function wait(duration) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), duration * 1000)
    })
}

button.addEventListener("click", async (e) => {
    const devices = await reader.enumerateDevices()

    if (devices.length === 0) {
        throw new Error("No fingerprint reader is connected")
    }

    const deviceUid = devices[0]

    console.log("starting fingerprint acquisition")
    await reader.startAcquisition(dp.devices.SampleFormat.PngImage, deviceUid)

    await wait(10)

    console.log("stoping fingerprint acquisition")
    await reader.stopAcquisition(deviceUid)
});

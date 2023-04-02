const reader = new dp.devices.FingerprintReader()
const image = document.querySelector("#fingerprint")
const button = document.querySelector("#fingerprint_button")
const Utf8 = dp.core.Utf8
const Base64 = dp.core.Base64
const fingerprintImage = document.querySelector("#fingerprint_image")

image.style.display = 'none'

reader.on("SamplesAcquired", (e) => {
    image.style.display = 'inline'
    console.log(e)
    const sample = e.samples[0]
    const src = "data:image/png;base64," + btoa(Utf8.fromBase64Url(sample))
    image.src = src
    fingerprintImage.value = src
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
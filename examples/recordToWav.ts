/**
 * A basic example of recording audio into a buffer and then saving it to a .wav file
 *
 * @module
 */

import { PortAudio, SampleFormat, StreamFlags } from "../mod.ts";

const NUM_CHANNELS = 1;
const NUM_SECONDS = 5;
const SAMPLE_RATE = 44100;
const FRAMES_PER_BUFFER = 1024;

PortAudio.initialize();

const inputDevice = PortAudio.getDefaultInputDevice();

const inputStream = PortAudio.openStream(
  {
    device: inputDevice,
    channelCount: NUM_CHANNELS,
    sampleFormat: SampleFormat.int32,
    suggestedLatency:
      PortAudio.getDeviceInfo(inputDevice).defaultLowInputLatency,
  },
  null,
  SAMPLE_RATE,
  FRAMES_PER_BUFFER,
  StreamFlags.clipOff,
);

PortAudio.startStream(inputStream);

console.log("=== Now recording!! Please speak into the microphone. ===");

const TOTAL_SAMPLES = NUM_SECONDS * SAMPLE_RATE * NUM_CHANNELS;
const audioBuffer = new Int32Array(TOTAL_SAMPLES + FRAMES_PER_BUFFER);

let recorded = 0;

while (recorded < TOTAL_SAMPLES) {
  const available = PortAudio.getStreamReadAvailable(inputStream);

  if (available > FRAMES_PER_BUFFER) {
    const buffer = new Int32Array(FRAMES_PER_BUFFER);
    PortAudio.readStream(inputStream, buffer, FRAMES_PER_BUFFER);

    audioBuffer.set(buffer, recorded);

    recorded += FRAMES_PER_BUFFER as number;
  }
}

console.log(
  `Recorded ${Math.round(audioBuffer.length / SAMPLE_RATE)} seconds of audio`,
);

PortAudio.closeStream(inputStream);
PortAudio.terminate();

console.log("=== Saving the file to demo.wav... please wait a bit. ===");

// Implemented based on the following resources
// https://isip.piconepress.com/projects/speech/software/tutorials/production/fundamentals/v1.0/section_02/s02_01_p05.html
// https://ccrma.stanford.edu/courses/422-winter-2014/projects/WaveFormat/
const fileBuffer = new ArrayBuffer(44 + TOTAL_SAMPLES * 4);
const view = new DataView(fileBuffer);

view.setInt32(0, 0x52494646); // "RIFF"
view.setInt32(4, 36 + TOTAL_SAMPLES * 4); // file size - 8
view.setInt32(8, 0x57415645); // "WAVE"
view.setInt32(12, 0x666d7420); // "fmt "
view.setInt32(16, 16, true); // fmt header size
view.setInt16(20, 1, true); // audio format, PCM = 1
view.setInt16(22, NUM_CHANNELS, true); // number of channels
view.setInt32(24, SAMPLE_RATE, true); // sample rate
view.setInt32(28, SAMPLE_RATE * NUM_CHANNELS * 4, true); // byte rate (sample rate * number of channels * bytes per sample)
view.setInt16(32, NUM_CHANNELS * 4, true); // block alignment (number of channels * bytes per sample)
view.setInt16(34, 32, true); // bits per sample
view.setInt32(36, 0x64617461); // "data"
view.setInt32(40, TOTAL_SAMPLES * 4, true); // number of bytes in rest of data

for (let i = 0; i < TOTAL_SAMPLES; i++) {
  view.setInt32(44 + (i * 4), audioBuffer[i], true);
}

Deno.writeFile("demo.wav", new Uint8Array(fileBuffer));

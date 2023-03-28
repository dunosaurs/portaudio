/**
 * A basic example of recording audio into a buffer and then playing it back out.
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
    sampleFormat: SampleFormat.float32,
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
const buffers: Float32Array[] = [];

let recorded = 0;

while (recorded < TOTAL_SAMPLES) {
  const available = PortAudio.getStreamReadAvailable(inputStream);

  if (available > FRAMES_PER_BUFFER) {
    const buffer = new Float32Array(FRAMES_PER_BUFFER);
    PortAudio.readStream(inputStream, buffer, FRAMES_PER_BUFFER);

    buffers.push(buffer);

    recorded += FRAMES_PER_BUFFER as number;
  }
}

console.log(
  `Recorded ${
    Math.round((buffers.length * FRAMES_PER_BUFFER) / SAMPLE_RATE)
  } seconds of audio`,
);

PortAudio.closeStream(inputStream);

console.log("=== Recording has been stopped. Commencing playback.  ===");

const outputDevice = PortAudio.getDefaultOutputDevice();
const outputStream = PortAudio.openStream(
  null,
  {
    device: outputDevice,
    channelCount: NUM_CHANNELS,
    sampleFormat: SampleFormat.float32,
    suggestedLatency:
      PortAudio.getDeviceInfo(outputDevice).defaultLowOutputLatency,
  },
  SAMPLE_RATE,
  FRAMES_PER_BUFFER,
  StreamFlags.clipOff,
);

PortAudio.startStream(outputStream);

for (const buffer of buffers) {
  try {
    PortAudio.writeStream(outputStream, buffer, FRAMES_PER_BUFFER);
  } catch {
    // no-op
  }
}
PortAudio.closeStream(outputStream);

PortAudio.terminate();

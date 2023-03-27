/**
 * A basic example of playing a sine wave. This is directly ported from portaudio's paex_write_sine.c so the code is definitely more dubious then it has to be.
 *
 * @module
 */
import {
  PortAudio,
  SampleFormat,
  StreamFlags,
  type StreamParameters,
} from "../mod.ts";

const NUM_SECONDS = 5;
const SAMPLE_RATE = 44100;
const FRAMES_PER_BUFFER = 1024;
const TABLE_SIZE = 200;

const buffer = new Float32Array(FRAMES_PER_BUFFER * 2);
const sine = new Float32Array(TABLE_SIZE);
let left_phase = 0;
let right_phase = 0;
let left_inc = 1;
let right_inc = 3; /* higher pitch so we can distinguish left and right. */
let bufferCount;

console.log(
  `PortAudio Test: output sine wave. SR = ${SAMPLE_RATE}, BufSize = ${FRAMES_PER_BUFFER}`,
);

/* initialise sinusoidal wavetable */
for (let i = 0; i < TABLE_SIZE; i++) {
  sine[i] = Math.sin((i / TABLE_SIZE) * Math.PI * 2);
}

PortAudio.initialize();

const outputParameters: StreamParameters = {
  device: PortAudio.getDefaultOutputDevice(), /* default output device */
  channelCount: 2, /* stereo output */
  sampleFormat: SampleFormat.float32, /* 32 bit floating point output */
  suggestedLatency: 0.050, // Pa_GetDeviceInfo( outputParameters.device )->defaultLowOutputLatency;
};

const stream = PortAudio.openStream(
  null, /* no input */
  outputParameters,
  SAMPLE_RATE,
  FRAMES_PER_BUFFER,
  StreamFlags
    .clipOff, /* we won't output out of range samples so don't bother clipping them */
);

console.log("Play 3 times, higher each time.");

for (let k = 0; k < 3; ++k) {
  PortAudio.startStream(stream);

  console.log(`Play for ${NUM_SECONDS} seconds.`);

  bufferCount = (NUM_SECONDS * SAMPLE_RATE) / FRAMES_PER_BUFFER;

  for (let i = 0; i < bufferCount; i++) {
    for (let j = 0; j < FRAMES_PER_BUFFER; j++) {
      buffer[j * 2] = sine[left_phase]; /* left */
      buffer[j * 2 + 1] = sine[right_phase]; /* right */
      left_phase += left_inc;
      if (left_phase >= TABLE_SIZE) left_phase -= TABLE_SIZE;
      right_phase += right_inc;
      if (right_phase >= TABLE_SIZE) right_phase -= TABLE_SIZE;
    }

    PortAudio.writeStream(stream, buffer, FRAMES_PER_BUFFER);
  }

  PortAudio.stopStream(stream);

  left_inc++;
  right_inc++;

  PortAudio.sleep(1000);
}

PortAudio.closeStream(stream);
PortAudio.terminate();
console.log("Test finished.\n");

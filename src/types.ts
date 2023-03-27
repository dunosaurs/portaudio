export interface HostApiInfo {
  structVersion: number;
  type: number;
  name: string;
  deviceCount: number;
  defaultInputDevice: number;
  defaultOutputDevice: number;
}

export interface DeviceInfo {
  structVersion: number;
  name: string;
  hostApi: number;
  maxInputChannels: number;
  maxOutputChannels: number;
  defaultLowInputLatency: number;
  defaultLowOutputLatency: number;
  defaultHighInputLatency: number;
  defaultHighOutputLatency: number;
  defaultSampleRate: number;
}

export interface StreamInfo {
  structVersion: number;
  inputLatency: number;
  outputLatency: number;
  sampleRate: number;
}

export interface StreamParameters {
  device: number;
  channelCount: number;
  sampleFormat: number | bigint;
  suggestedLatency: number;
}

export enum SampleFormat {
  float32 = 0x00000001,
  int32 = 0x00000002,
  int24 = 0x00000004,
  int16 = 0x00000008,
  int8 = 0x00000010,
  uint8 = 0x00000020,
  customFormat = 0x00010000,
  nonInterleaved = 0x80000000,
}

export enum StreamFlags {
  noFlag = 0,
  clipOff = 0x00000001,
  ditherOff = 0x00000002,
  neverDropInput = 0x00000004,
}

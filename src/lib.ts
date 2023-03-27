import { dlopen } from "https://deno.land/x/plug@1.0.1/mod.ts";

/**
 * The output ffi lib for portaudio. We consciously chose not to export the following as FFI callbacks with Deno are very scary:
 * - Pa_SetStreamFinishedCallback
 * - Pa_GetStreamCpuLoad
 *
 * We also choose to prevent users from even touching the options in the main exported lib
 */
export const lib = await dlopen({
  name: "portaudio",
  url: "./build/",
}, {
  Pa_GetVersion: {
    parameters: [],
    result: "i32",
  },
  Pa_GetVersionText: {
    parameters: [],
    result: "buffer",
  },
  Pa_GetErrorText: {
    parameters: ["i32"],
    result: "buffer",
  },
  Pa_Initialize: {
    parameters: [],
    result: "i32",
  },
  Pa_Terminate: {
    parameters: [],
    result: "i32",
  },
  Pa_GetHostApiCount: {
    parameters: [],
    result: "i32",
  },
  Pa_GetDefaultHostApi: {
    parameters: [],
    result: "i32",
  },
  Pa_GetHostApiInfo: {
    parameters: ["i32"],
    result: "buffer",
  },
  Pa_HostApiTypeIdToHostApiIndex: {
    parameters: ["i32"],
    result: "i32",
  },
  Pa_HostApiDeviceIndexToDeviceIndex: {
    parameters: ["i32", "i32"],
    result: "i32",
  },
  Pa_GetDeviceCount: {
    parameters: [],
    result: "i32",
  },
  Pa_GetDefaultInputDevice: {
    parameters: [],
    result: "i32",
  },
  Pa_GetDefaultOutputDevice: {
    parameters: [],
    result: "i32",
  },
  Pa_GetDeviceInfo: {
    parameters: ["i32"],
    result: "buffer",
  },
  Pa_IsFormatSupported: {
    parameters: ["buffer", "buffer", "f64"],
    result: "i32",
  },
  Pa_OpenStream: {
    parameters: [
      "pointer",
      "buffer",
      "buffer",
      "f64",
      "u64",
      "u64",
      "pointer",
      "pointer",
    ],
    result: "i32",
  },
  Pa_OpenDefaultStream: {
    parameters: [
      "pointer",
      "i32",
      "i32",
      "u64",
      "f64",
      "u64",
      "pointer",
      "pointer",
    ],
    result: "i32",
  },
  Pa_CloseStream: {
    parameters: ["pointer"],
    result: "i32",
  },
  Pa_StartStream: {
    parameters: ["pointer"],
    result: "i32",
  },
  Pa_StopStream: {
    parameters: ["pointer"],
    result: "i32",
  },
  Pa_AbortStream: {
    parameters: ["pointer"],
    result: "i32",
  },
  Pa_IsStreamStopped: {
    parameters: ["pointer"],
    result: "i32",
  },
  Pa_IsStreamActive: {
    parameters: ["pointer"],
    result: "i32",
  },
  Pa_GetStreamInfo: {
    parameters: ["pointer"],
    result: "buffer",
  },
  Pa_GetStreamTime: {
    parameters: ["pointer"],
    result: "f64",
  },
  Pa_GetStreamCpuLoad: {
    parameters: ["pointer"],
    result: "f64",
  },
  Pa_ReadStream: {
    parameters: ["pointer", "buffer", "u64"],
    result: "i32",
  },
  Pa_WriteStream: {
    parameters: ["pointer", "buffer", "u64"],
    result: "i32",
  },
  Pa_GetStreamReadAvailable: {
    parameters: ["pointer"],
    result: "u64",
  },
  Pa_GetStreamWriteAvailable: {
    parameters: ["pointer"],
    result: "u64",
  },
  Pa_GetSampleSize: {
    parameters: ["u64"],
    result: "i32",
  },
  Pa_Sleep: {
    parameters: ["i32"],
    result: "void",
  },
});

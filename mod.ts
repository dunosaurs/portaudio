import type {
  DeviceInfo,
  HostApiInfo,
  StreamInfo,
  StreamParameters,
} from "./src/types.ts";
import { lib } from "./src/lib.ts";
import { endianess } from "./src/util.ts";

export * from "./src/types.ts";

function throwIfNegative<T>(val: T): T {
  if (val < 0) {
    // If it gets here it is always a number
    throw PortAudio.getErrorText(val as number);
  }
  return val;
}

function createStreamParams(params: StreamParameters) {
  const inputParams = new DataView(new ArrayBuffer(32));
  inputParams.setInt32(0, params.device, endianess),
    inputParams.setInt32(4, params.channelCount, endianess);
  inputParams.setBigUint64(
    8,
    BigInt(params.sampleFormat),
    endianess,
  );
  inputParams.setFloat64(16, params.suggestedLatency, endianess);
  return inputParams;
}

export class PortAudio {
  /** Retrieve the release number of the currently running PortAudio build. For example, for version "19.5.1" this will return 0x00130501. */
  static getVersion() {
    return lib.symbols.Pa_GetVersion();
  }

  /** Retrieve a textual description of the current PortAudio build, e.g. "PortAudio V19.5.0-devel, revision 1952M". The format of the text may change in the future. Do not try to parse the returned string. */
  static getVersionText() {
    return new Deno.UnsafePointerView(lib.symbols.Pa_GetVersionText()!)
      .getCString();
  }

  /** Translate the supplied PortAudio error code into a human readable message. */
  static getErrorText(error: number) {
    return new Deno.UnsafePointerView(lib.symbols.Pa_GetErrorText(error)!)
      .getCString();
  }

  /**
   * Library initialization function - call this before using PortAudio. This function initializes internal data structures and prepares underlying host APIs for use. With the exception of `getVersion()` and `getVersionText()`, this function MUST be called before using any other PortAudio API functions.
   *
   * If `initialize()` is called multiple times, each successful call must be matched with a corresponding call to `terminate()`. Pairs of calls to `initialize()`/`terminate()` may overlap, and are not required to be fully nested.
   */
  static initialize() {
    throwIfNegative(lib.symbols.Pa_Initialize());
  }

  /**
   * Library termination function - call this when finished using PortAudio. This function deallocates all resources allocated by PortAudio since it was initialized by a call to `initialize()`. In cases where `initialize()` has been called multiple times, each call must be matched with a corresponding call to `terminate()`. The final matching call to `terminate()` will automatically close any PortAudio streams that are still open.
   *
   * `terminate()` MUST be called before exiting a program which uses PortAudio. Failure to do so may result in serious resource leaks, such as audio devices not being available until the next reboot.
   */
  static terminate() {
    throwIfNegative(lib.symbols.Pa_Terminate());
  }

  /** Retrieve the number of available host APIs. Even if a host API is available it may have no devices available. */
  static getHostApiCount() {
    return throwIfNegative(lib.symbols.Pa_GetHostApiCount());
  }

  /** Retrieve the index of the default host API. The default host API will be the lowest common denominator host API on the current platform and is unlikely to provide the best performance. */
  static getDefaultHostApi() {
    return throwIfNegative(lib.symbols.Pa_GetDefaultHostApi());
  }

  /** Retrieve a `HostApiInfo` object containing information about a specific host api. */
  static getHostApiInfo(hostApi: number): HostApiInfo {
    const raw = new Deno.UnsafePointerView(
      lib.symbols.Pa_GetHostApiInfo(hostApi)!,
    );

    return {
      structVersion: raw.getInt32(0),
      type: raw.getInt32(4),
      name: new Deno.UnsafePointerView(
        Deno.UnsafePointer.create(raw.getBigInt64(8))!,
      ).getCString(),
      deviceCount: raw.getInt32(12),
      defaultInputDevice: raw.getInt32(16),
      defaultOutputDevice: raw.getInt32(20),
    };
  }

  /** Convert a static host API unique identifier, into a runtime host API index. */
  static hostApiTypeIdToHostApiIndex(type: number) {
    return throwIfNegative(lib.symbols.Pa_HostApiTypeIdToHostApiIndex(type));
  }

  /** Convert a host-API-specific device index to standard PortAudio device index. This function may be used in conjunction with the deviceCount field of `HostApiInfo` to enumerate all devices for the specified host API. */
  static hostApiDeviceIndexToDeviceIndex(
    hostApi: number,
    hostApiDeviceIndex: number,
  ) {
    return throwIfNegative(
      lib.symbols.Pa_HostApiDeviceIndexToDeviceIndex(
        hostApi,
        hostApiDeviceIndex,
      ),
    );
  }

  /** Retrieve the number of available devices. The number of available devices may be zero. */
  static getDeviceCount() {
    return lib.symbols.Pa_GetDeviceCount();
  }

  /** Retrieve the index of the default input device. The result can be used in the inputDevice parameter to `openStream()`. */
  static getDefaultInputDevice() {
    return throwIfNegative(lib.symbols.Pa_GetDefaultInputDevice());
  }

  /** Retrieve the index of the default output device. The result can be used in the outputDevice parameter to `openStream()`. */
  static getDefaultOutputDevice() {
    return throwIfNegative(lib.symbols.Pa_GetDefaultOutputDevice());
  }

  /** Retrieve a `DeviceInfo` object containing information about the specified device. */
  static getDeviceInfo(device: number): DeviceInfo {
    const raw = new Deno.UnsafePointerView(
      lib.symbols.Pa_GetDeviceInfo(device)!,
    );

    return {
      structVersion: raw.getInt32(0),
      name: new Deno.UnsafePointerView(
        Deno.UnsafePointer.create(raw.getBigInt64(8))!,
      ).getCString(),
      hostApi: raw.getInt32(16),
      maxInputChannels: raw.getInt32(20),
      maxOutputChannels: raw.getInt32(24),
      defaultLowInputLatency: raw.getFloat64(32),
      defaultLowOutputLatency: raw.getFloat64(40),
      defaultHighInputLatency: raw.getFloat64(48),
      defaultHighOutputLatency: raw.getFloat64(56),
      defaultSampleRate: raw.getFloat64(64),
    };
  }

  /** Determine whether it would be possible to open a stream with the specified parameters. */
  static isFormatSupported(
    inputParameters: StreamParameters | null,
    outputParameters: StreamParameters | null,
    sampleRate: number,
  ) {
    const inputParams: DataView | null = inputParameters !== null
      ? createStreamParams(inputParameters)
      : null;
    const outputParams: DataView | null = outputParameters !== null
      ? createStreamParams(outputParameters)
      : null;

    throwIfNegative(
      lib.symbols.Pa_IsFormatSupported(inputParams, outputParams, sampleRate),
    );
  }

  /** Opens a stream for either input, output or both. */
  static openStream(
    inputParameters: StreamParameters | null,
    outputParameters: StreamParameters | null,
    sampleRate: number,
    framesPerBuffer: number,
    streamFlags: number,
  ) {
    const pointer = new ArrayBuffer(8);

    const inputParams: DataView | null = inputParameters !== null
      ? createStreamParams(inputParameters)
      : null;
    const outputParams: DataView | null = outputParameters !== null
      ? createStreamParams(outputParameters)
      : null;

    throwIfNegative(
      lib.symbols.Pa_OpenStream(
        Deno.UnsafePointer.of(pointer),
        inputParams,
        outputParams,
        sampleRate,
        framesPerBuffer,
        streamFlags,
        null,
        null,
      ),
    );

    return Deno.UnsafePointer.create(
      new DataView(pointer).getBigUint64(0, endianess),
    );
  }

  /** A simplified version of `openStream()` that opens the default input and/or output devices. */
  static openDefaultStream(
    numInputChannels: number,
    numOutputChannels: number,
    sampleFormat: number | bigint,
    sampleRate: number,
    framesPerBuffer: number | bigint,
  ) {
    const pointer = new ArrayBuffer(8);

    throwIfNegative(
      lib.symbols.Pa_OpenDefaultStream(
        Deno.UnsafePointer.of(pointer),
        numInputChannels,
        numOutputChannels,
        sampleFormat,
        sampleRate,
        framesPerBuffer,
        null,
        null,
      ),
    );

    return Deno.UnsafePointer.create(
      new DataView(pointer).getBigUint64(0, endianess),
    );
  }

  /** Closes an audio stream. If the audio stream is active it discards any pending buffers as if `abortStream()` had been called. */
  static closeStream(stream: Deno.PointerValue) {
    throwIfNegative(lib.symbols.Pa_CloseStream(stream));
  }

  /** Commences audio processing. */
  static startStream(stream: Deno.PointerValue) {
    throwIfNegative(lib.symbols.Pa_StartStream(stream));
  }

  /** Terminates audio processing. It waits until all pending audio buffers have been played before it returns. */
  static stopStream(stream: Deno.PointerValue) {
    throwIfNegative(lib.symbols.Pa_StopStream(stream));
  }

  /** Terminates audio processing immediately without waiting for pending buffers to complete. */
  static abortStream(stream: Deno.PointerValue) {
    throwIfNegative(lib.symbols.Pa_AbortStream(stream));
  }

  /** Determine whether the stream is stopped. A stream is considered to be stopped prior to a successful call to `startStream()` and after a successful call to `stopStream()` or `abortStream()`. */
  static isStreamStopped(stream: Deno.PointerValue) {
    return throwIfNegative(lib.symbols.Pa_IsStreamStopped(stream)) > 0;
  }

  /** Determine whether the stream is active. A stream is active after a successful call to `startStream()`, until it becomes inactive either as a result of a call to `stopStream()` or `abortStream()`. */
  static isStreamActive(stream: Deno.PointerValue) {
    return throwIfNegative(lib.symbols.Pa_IsStreamActive(stream)) > 0;
  }

  /** Retrieve an object containing information about the specified stream. */
  static getStreamInfo(stream: Deno.PointerValue): StreamInfo {
    const raw = new Deno.UnsafePointerView(
      lib.symbols.Pa_GetStreamInfo(stream)!,
    );

    return {
      structVersion: raw.getInt32(0),
      inputLatency: raw.getFloat64(8),
      outputLatency: raw.getFloat64(16),
      sampleRate: raw.getFloat64(24),
    };
  }

  /**
   * Returns the current time in seconds for a stream. The time values are monotonically increasing and have unspecified origin.
   *
   * `getStreamTime()` returns valid time values for the entire life of the stream, from when the stream is opened until it is closed. Starting and stopping the stream does not affect the passage of time returned by `getStreamTime()`.
   *
   * This time may be used for synchronizing other events to the audio stream, for example synchronizing audio to MIDI.
   */
  static getStreamTime(stream: Deno.PointerValue) {
    return lib.symbols.Pa_IsStreamActive(stream);
  }

  /** Read samples from an input stream. The function doesn't return until the entire buffer has been filled - this may involve waiting for the operating system to supply the data. */
  static readStream(
    stream: Deno.PointerValue,
    buffer: BufferSource,
    frames: number,
  ) {
    throwIfNegative(lib.symbols.Pa_ReadStream(stream, buffer, frames));
  }

  /** Write samples to an output stream. This function doesn't return until the entire buffer has been written - this may involve waiting for the operating system to consume the data. */
  static writeStream(
    stream: Deno.PointerValue,
    buffer: BufferSource,
    frames: number,
  ) {
    throwIfNegative(lib.symbols.Pa_WriteStream(stream, buffer, frames));
  }

  /** Retrieve the number of frames that can be read from the stream without waiting. */
  static getStreamReadAvailable(stream: Deno.PointerValue) {
    return throwIfNegative(lib.symbols.Pa_GetStreamReadAvailable(stream));
  }

  /** Retrieve the number of frames that can be written to the stream without waiting. */
  static getStreamWriteAvailable(stream: Deno.PointerValue) {
    return throwIfNegative(lib.symbols.Pa_GetStreamWriteAvailable(stream));
  }

  /** Retrieve the size of a given sample format in bytes. */
  static getSampleSize(format: number | bigint) {
    return throwIfNegative(lib.symbols.Pa_GetSampleSize(format));
  }

  /**
   * Put the caller to sleep for at least 'msec' milliseconds. This function is provided only as a convenience for authors of portable code (such as the tests and examples in the PortAudio distribution.)
   *
   * The function may sleep longer than requested so don't rely on this for accurate musical timing.
   */
  static sleep(msec: number) {
    lib.symbols.Pa_Sleep(msec);
  }
}

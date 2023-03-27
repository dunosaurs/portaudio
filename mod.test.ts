import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.181.0/testing/asserts.ts";
import { PortAudio } from "./mod.ts";

Deno.test("static methods work", () => {
  assertEquals(PortAudio.getVersion(), 1246976);
  assertEquals(
    PortAudio.getVersionText(),
    "PortAudio V19.7.0-devel, revision unknown",
  );
  assertEquals(PortAudio.getErrorText(-10000), "PortAudio not initialized");
});

Deno.test("able to initialize", () => {
  PortAudio.initialize();
});

Deno.test("able to get host apis", () => {
  assert(PortAudio.getHostApiCount() > 0);

  const defaultHostApi = PortAudio.getDefaultHostApi();
  assert(defaultHostApi >= 0);

  const hostApiInfo = PortAudio.getHostApiInfo(defaultHostApi);
  assertEquals(hostApiInfo.structVersion, 1);

  assertEquals(
    PortAudio.hostApiTypeIdToHostApiIndex(hostApiInfo.type),
    defaultHostApi,
  );
});

Deno.test("able to get device apis", () => {
  const deviceCount = PortAudio.getDeviceCount();
  assert(deviceCount >= 0);

  assert(PortAudio.getDefaultInputDevice() >= 0);
  assert(PortAudio.getDefaultInputDevice() < deviceCount);

  assert(PortAudio.getDefaultOutputDevice() >= 0);
  assert(PortAudio.getDefaultOutputDevice() < deviceCount);

  for (let i = 0; i < deviceCount; i++) {
    console.log(PortAudio.getDeviceInfo(i).name);
  }
});

Deno.test("able to start and stop stream", () => {
  const deviceCount = PortAudio.getDeviceCount();

  if (deviceCount > 0) {
    const stream = PortAudio.openDefaultStream(1, 0, 1, 44100, 16384);

    PortAudio.startStream(stream);

    PortAudio.sleep(1000);

    const streamInfo = PortAudio.getStreamInfo(stream);
    assertEquals(streamInfo.sampleRate, 44100);

    const readAvailable = PortAudio.getStreamReadAvailable(stream);
    assert(readAvailable > 0);

    PortAudio.stopStream(stream);

    PortAudio.closeStream(stream);
  } else {
    console.log("Skipping test because device has no audio devices");
  }
});

Deno.test("able to terminate", () => {
  PortAudio.terminate();
});

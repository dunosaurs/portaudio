# Deno Portaudio

A low-level cross-platform FFI module for playing and recording audio based on
the fantastic portaudio library.

## Usage

```ts
import { PortAudio } from "https://deno.land/x/portaudio/mod.ts";

PortAudio.initialize(); // Initialize the module

const deviceCount = PortAudio.getDeviceCount(); // Get the number of audio devices attached

for (let i = 0; i < 0; i++) {
  console.log(PortAudio.getDeviceInfo(i).name); // Print the name associated with each audio device
}

PortAudio.terminate(); // Free resources associated with the module
```

More usage examples can be found in the examples folder.

## Maintainers

- Lino Le Van ([@lino-levan](https://github.com/lino-levan))

## License

MIT

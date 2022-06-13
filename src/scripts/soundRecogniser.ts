import * as tf from "@tensorflow/tfjs";
import * as speechCommands from "@tensorflow-models/speech-commands";

// more documentation available at
// https://github.com/tensorflow/tfjs-models/tree/master/speech-commands

// Code doesn'n work if this is ran, it doesn't find the backend
tf.getBackend();

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/CpusitpNa/";

async function createModel() {
  const checkpointURL = URL + "model.json"; // model topology
  const metadataURL = URL + "metadata.json"; // model metadata

  const recognizer = speechCommands.create(
    "BROWSER_FFT", // fourier transform type, not useful to change
    undefined, // speech commands vocabulary feature, not useful for your models
    checkpointURL,
    metadataURL
  );

  // check that model and metadata are loaded via HTTPS requests.
  await recognizer.ensureModelLoaded();

  return recognizer;
}

export async function recognizeSounds(callback: Function) {
  console.log("Recognizing sounds.");
  const recognizer = await createModel();
  const labels = recognizer.wordLabels(); // get class labels
  console.log(labels);
  let sounds = labels.map((label) => {
    return { label: label, confidence: 0, isActive: false };
  });
  console.log("sounds:", sounds);

  // listen() takes two arguments:
  // 1. A callback function that is invoked anytime a word is recognized.
  // 2. A configuration object with adjustable fields
  recognizer.listen(
    // Did not work unless async since callback should return Promise<Void>(?)
    async (result) => {
      // const scores = result.scores; // probability of prediction for each class
      // const indexOfMostConfident = argMax(Object.values(result.scores));
      // const sound = {
      //   label: labels[indexOfMostConfident],
      //   confidence: scores[indexOfMostConfident],
      // };
      // callback(sound);
      const scores = result.scores; // probability of prediction for each class

      sounds.forEach(
        (
          sound: {
            label: string;
            confidence: number | Float32Array;
            isActive: boolean;
          },
          index: number
        ) => {
          sound.confidence = scores[index];
          sound.isActive = scores[index] > 0.8 ? true : false;
        }
      );
    },
    {
      includeSpectrogram: true, // in case listen should return result.spectrogram
      probabilityThreshold: 0.75,
      invokeCallbackOnNoiseAndUnknown: true,
      overlapFactor: 0.5, // probably want between 0.5 and 0.75. More info in README
    }
  );

  callback(sounds);

  // Stop the recognition in 5 seconds.
  // setTimeout(() => recognizer.stopListening(), 5000);
}

// Returns largest argument
function argMax(arr: any) {
  return arr
    .map((x: any, i: any) => [x, i])
    .reduce((r: any, a: any) => (a[0] > r[0] ? a : r))[1];
}

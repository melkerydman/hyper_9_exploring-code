import * as tf from "@tensorflow/tfjs";
import * as speechCommands from "@tensorflow-models/speech-commands";

// more documentation available at
// https://github.com/tensorflow/tfjs-models/tree/master/speech-commands

// Code doesn'n work if this is ran, it doesn't find the backend
tf.getBackend();

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/Rta22WWsU/";

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
  console.log(recognizer);

  return recognizer;
}

export async function recognizeSounds() {
  console.log("hello");
  const recognizer = await createModel();
  const classLabels = recognizer.wordLabels(); // get class labels
  const labelContainer = document.getElementById("label-container");
  // for (let i = 0; i < classLabels.length; i++) {
  //     labelContainer.appendChild(document.createElement("div"));
  // }

  // listen() takes two arguments:
  // 1. A callback function that is invoked anytime a word is recognized.
  // 2. A configuration object with adjustable fields
  recognizer.listen(
    // Did not work unless async since callback should return Promise<Void>(?)
    async (result) => {
      console.log(result);
      const scores = result.scores; // probability of prediction for each class
      // render the probability scores per class
      // for (let i = 0; i < classLabels.length; i++) {
      //     const classPrediction = classLabels[i] + ': ' + result.scores[i].toFixed(2);
      //     labelContainer.childNodes[i].innerHTML = classPrediction;
      // }
    },

    {
      includeSpectrogram: true, // in case listen should return result.spectrogram
      probabilityThreshold: 0.75,
      invokeCallbackOnNoiseAndUnknown: true,
      overlapFactor: 0.5, // probably want between 0.5 and 0.75. More info in README
    }
  );

  // Stop the recognition in 5 seconds.
  // setTimeout(() => recognizer.stopListening(), 5000);
}

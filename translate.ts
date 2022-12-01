import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { Configuration, OpenAIApi } from "openai";
import * as fs from 'fs';

let ALLOWED_API_CALLS = 10; // by default, we will only run 10 open API calls
let trainerTxt = "";
let newTranslationJson = {};

dotenv.config()

// if the user passes in a --live flag, we'll up the calls to the max
if (process.argv.slice(2)[0] === "--live") {
  ALLOWED_API_CALLS = 10000
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

const loadFile = ((filename: string) => {
  return fs.readFileSync(filename,'utf8');
});

const translate = async function handler(text: string) {
  const process = async (text) => {
    const res = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: `${trainerTxt}${text}`,
      max_tokens: 147,
      temperature: 0,
      top_p: 1,
      presence_penalty: 0,
      frequency_penalty: 0.5
    });

    if (res?.data?.choices?.length > 0
      && res?.data?.choices[0] !== undefined) {
        //console.log(res?.data?.choices[0])
      return (res?.data?.choices[0].text ?? 'FAILEDTOTRANSLATE');
    }
  }

  try {
    return await process(text).catch(() => process(`FAILEDTOTRANSLATE`));
  } catch (e) {
    console.error(e);
    return 'FAILEDTOTRANSLATE'
  }
}

const main = async () => {
  trainerTxt = loadFile('trainer.txt');
  const translationJsonStr = loadFile('original.json');

  const translationJson = JSON.parse(translationJsonStr)

  newTranslationJson = await iterateObj(translationJson);

  fs.writeFile("translation.json", JSON.stringify(newTranslationJson, undefined, 4), function(err) {
    if (err) {
        console.error(err);
    }
});
}

let ctr = 0;
let rateCtr = 0;
const iterateObj = async (obj) => {
  let returnObj = {};

  for (const key of Object.keys(obj)) {
    returnObj[key] = {};

    let obj2 = (obj as {[key: string]: string})[key];

    if (typeof obj2 === 'object') {
      returnObj[key] = await iterateObj(obj2)
    } else {
      ctr++

      if (ctr <= ALLOWED_API_CALLS) {
        let str = `\nhuman: \"${obj2}\"\ndog: `;
        let res = await translate(str) ?? "FAILEDTOTRANSLATE";

        // result is typically in format: '\n\n"TEXT"'
        res = res.replace("\n\n", "")

        // result is due to the quotes and will be in format: '\n\n"\"TEXT\""' so we trim start and ending \"
        if (res.startsWith("\"")) {
          res = res.substring(1, res.length)
        }

        if (res.endsWith("\"")) {
          res = res.substring(0, res.length - 1)
        }

        console.log(`${key}: ${res}`)
        returnObj[key] = res;

        rateCtr++
        if (rateCtr > 17) {
          rateCtr = 0;
          await new Promise(f => setTimeout(f, 60000));
        }
      }
      else {
        returnObj[key] = obj2;
      }
    }
  }

  return returnObj;
}

main()
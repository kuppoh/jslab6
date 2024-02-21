const path = require("path");
/*
 * Project: Milestone 1
 * File Name: main.js
 * Description:
 *
 * Created Date:
 * Author:
 *
 */

const IOhandler = require("./IOhandler.js");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "grayscaled");

async function main() {
  try {
    await IOhandler.unzip(zipFilePath, pathUnzipped);
    const imgs = await IOhandler.readDir(pathUnzipped);
    const promises = imgs.map((img) => IOhandler.grayScale(img, pathProcessed));
    await Promise.all(promises);
  } catch (error) {
    console.log(error);
  }
}

main() // call it so it actually works lol

main() // call it so it actually works lol
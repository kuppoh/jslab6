 /*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date:
 * Author:
 *
 */

 const unzipper = require("yauzl-promise"),
 fs = require("fs"),
 PNG = require("pngjs").PNG,
 { pipeline } = require("stream/promises"),
 path = require("path");

/**
* Description: decompress file from given pathIn, write to given pathOut
*
* @param {string} pathIn
* @param {string} pathOut
* @return {promise} // unzip must return a promise
*/


const unzip = async(pathIn, pathOut) => { // made it asynchronous 
 const zip = await unzipper.open(pathIn);   // unzipper === "yauzl-promise"
 try { 
   for await (const entry of zip) {  // making each entry of zip(a zip file we open based on path) a constant to use in for loop
     if (entry.filename.startsWith('__') || entry.filename.startsWith('.')) { // if file starts with "__" OR "." >>> continue because they are invisible files
       continue;
     } else if (entry.filename.endsWith('/') && !entry.filename.startsWith('__')) { // however, if they are folders AND they don't start with "__" >>> make that folder
       await fs.promises.mkdir(`${pathOut}/${entry.filename}`)
     } else { // otherwise make the png files :)
       const readStream = await entry.openReadStream();
       const writeStream = fs.createWriteStream(`${pathOut}/${entry.filename}`);
       await pipeline(readStream, writeStream);
     }
   }
 } finally {
   await zip.close();
 }
}



/**
* Description: read all the png files from given directory and return Promise containing array of each png file path
*
* @param {string} path
* @return {promise}
*/
const readDir = (dir) => {
 return new Promise((resolve, reject) => {
   fs.readdir(dir, (err, files) => {
     if (err) {
       reject(err)
     } else {
       let imgs = [] 
       files.forEach(file => {
         if (path.extname(file) === "." + "png") // if file ends with ".png"
         {imgs.push(`${dir}/${file}`);} // push the file path name to the list
       resolve(imgs) // resolve the data (that way we can see it if we console.log, instead of undefined)
       });
     }
   })
 })
};

/**
* Description: Read in png file by given pathIn,
* convert to grayscale and write to given pathOut
*
* @param {string} filePath
* @param {string} pathProcessed
* @return {promise}
*/

const {
  Worker, isMainThread, parentPort, workerData,
} = require('node:worker_threads');


if (isMainThread) {
  module.exports = {
    unzip, 
    readDir,
    grayScale: async function grayScale (pathIn, pathOut) {
      return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: { pathIn, pathOut },
        });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
          if (code !== 0)
            reject(new Error(`Worker stopped with exit code ${code}`));
        });
      });
    }
  };
} else {
  // This code is executed in the worker thread
  const { pathIn, pathOut } = workerData;

  fs.createReadStream(pathIn)
    .pipe(
      new PNG({
        filterType: 4,
      })
    )
    .on('parsed', function () {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const idx = (this.width * y + x) << 2;

          // the standard R G B colors
          const R = this.data[idx];
          const G = this.data[idx + 1];
          const B = this.data[idx + 2];

          let newR = Math.min(255, 0.393 * R + 0.769 * G + 0.189 * B);
          let newG = Math.min(255, 0.349 * R + 0.686 * G + 0.168 * B);
          let newB = Math.min(255, 0.272 * R + 0.534 * G + 0.131 * B);

          this.data[idx] = newR;
          this.data[idx + 1] = newG;
          this.data[idx + 2] = newB;
        }
      }

      this.pack().pipe(
        fs.createWriteStream(`${pathOut}/${path.basename(pathIn)}`)
      );
      parentPort.postMessage('conversion completed');
    });
}
// take png image and apply a filter to it
// you have multiple filters you are providing (?)
// 


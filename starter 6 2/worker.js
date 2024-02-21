const { parentPort } = require('worker_threads');
const fs = require('fs');
const path = require('path');
const PNG = require('pngjs');

parentPort.on('message', (jobs) => {
  const grayScale = async (pathIn, pathOut) => {
    fs.createReadStream(pathIn)
      .pipe(
        new PNG({
          filterType: 4,
        })
      )
      .on("parsed", function () {
        for (var y = 0; y < this.height; y++) {
          for (var x = 0; x < this.width; x++) {
            var idx = (this.width * y + x) << 2;

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

        this.pack().pipe(fs.createWriteStream(`${pathOut}/${path.basename(pathIn)}`)); // path.basename from the "path" module, it takes the filename of the path
      });

    parentPort.postMessage('done');
  };
  grayScale(jobs.pathIn, jobs.pathOut);
});





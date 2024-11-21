const fs = require("fs");
const PNG = require("pngjs").PNG;
const path = require("path");
const yauzl= require('yauzl-promise');
const { pipeline } = require("stream/promises");

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
const unzip = async (pathIn, pathOut) => {
  const zip = await yauzl.open(pathIn);
  try {
    await fs.promises.mkdir(pathOut, { recursive: true });
    for await (const entry of zip) {
      const entryPath = path.join(pathOut, entry.filename);

      if (entry.filename.startsWith("__MACOSX") || path.basename(entry.filename).startsWith(".")) {
        continue;
      }

      if (entry.filename.endsWith("/")) {
        await fs.promises.mkdir(entryPath, { recursive: true });
      } else {
        const readStream = await entry.openReadStream();
        const writeStream = fs.createWriteStream(entryPath);
        await pipeline(readStream, writeStream);
      }
    }
    console.log("Extraction operation complete");
  } finally {
    await zip.close();
  }
};


/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = async (dir) => {
  try {
    const files = await fs.promises.readdir(dir, { withFileTypes: true });
    return files
      .filter(
        (file) =>
          file.isFile() &&
          file.name.endsWith(".png") && !file.name.startsWith("._") // Exclude hidden files
      )
      .map((file) => path.join(dir, file.name));
  } catch (error) {
    console.error("Error reading directory:", error);
    throw error;
  }
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const grayScale = (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    try {
      fs.createReadStream(pathIn)
        .pipe(new PNG())
        .on("parsed", function () {
          // Loop through
          for (let i = 0; i < this.data.length; i += 4) {
            const r = this.data[i];     // Red
            const g = this.data[i + 1]; // Green
            const b = this.data[i + 2]; // Blue

            // Calculate grayscale value
            const gray = Math.round((0.3 * r) + (0.59 * g) + (0.11 * b));

            // Set RGB channels to the grayscale value
            this.data[i] = gray;       // Red
            this.data[i + 1] = gray;   // Green
            this.data[i + 2] = gray;   // Blue
            // Alpha channel (i + 3) not needed
          }

          // Write the modified PNG data to pathOut
          this.pack().pipe(fs.createWriteStream(pathOut)).on("finish", resolve);
        })
        .on("error", reject); // Handle any errors during the parsing process
    } catch (error) {
      console.error("Error in grayscale processing:", error);
      reject(error);
    }
  });
};


/**
 * Description: Read in png file by given pathIn,
 * convert to photo without Red and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const redRemove = (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    try {
      fs.createReadStream(pathIn)
        .pipe(new PNG())
        .on("parsed", function () {
          // Loop through
          for (let i = 0; i < this.data.length; i += 4) {
            const r = this.data[i];     // Red
            const g = this.data[i + 1]; // Green
            const b = this.data[i + 2]; // Blue

            // Calculate grayscale value
            const red = Math.round((0 * r));

            // Set RGB channels to the grayscale value
            this.data[i] = red;       // Red
               // Blue
            // Alpha channel (i + 3) not needed
          }

          // Write the modified PNG data to pathOut
          this.pack().pipe(fs.createWriteStream(pathOut)).on("finish", resolve);
        })
        .on("error", reject); // Handle any errors during the parsing process
    } catch (error) {
      console.error("Error in grayscale processing:", error);
      reject(error);
    }
  });
};



/**
 * Description: Read in png file by given pathIn,
 * convert to Warm and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const warm = (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    try {
      fs.createReadStream(pathIn)
        .pipe(new PNG())
        .on("parsed", function () {
          // Loop through
          for (let i = 0; i < this.data.length; i += 4) {
            const r = this.data[i];     // Red
            const g = this.data[i + 1]; // Green
            const b = this.data[i + 2]; // Blue

            const warmR = Math.min(255, r + 30); // Boost red
            const warmG = Math.min(255, g + 15); // Slightly boost green
            const warmB = Math.max(0, b - 20); // reduce blue

           // Apply new values
           this.data[i] = warmR;
           this.data[i + 1] = warmG;
           this.data[i + 2] = warmB;
            // Alpha channel (i + 3) not needed
          }

          // Write the modified PNG data to pathOut
          this.pack().pipe(fs.createWriteStream(pathOut)).on("finish", resolve);
        })
        .on("error", reject); // Handle any errors during the parsing process
    } catch (error) {
      console.error("Error in grayscale processing:", error);
      reject(error);
    }
  });
};



/**
 * Description: Read in png file by given pathIn,
 * convert to Cool and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const cool = (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    try {
      fs.createReadStream(pathIn)
        .pipe(new PNG())
        .on("parsed", function () {
          // Loop through
          for (let i = 0; i < this.data.length; i += 4) {
            const r = this.data[i];     // Red
            const g = this.data[i + 1]; // Green
            const b = this.data[i + 2]; // Blue

            const coolB = Math.min(255, b + 50); // Boost blue
            const coolG = Math.min(255, g + 15); // Slightly boost green
            const coolR = Math.max(0, r - 10); // reduce red

           // Apply new values
           this.data[i] = coolR;
           this.data[i + 1] = coolG;
           this.data[i + 2] = coolB;
            // Alpha channel (i + 3) not needed
          }

          // Write the modified PNG data to pathOut
          this.pack().pipe(fs.createWriteStream(pathOut)).on("finish", resolve);
        })
        .on("error", reject); // Handle any errors during the parsing process
    } catch (error) {
      console.error("Error in grayscale processing:", error);
      reject(error);
    }
  });
};

/**
 * Description: Read in png file by given pathIn,
 * convert to Sepia and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const sepia = (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    try {
      fs.createReadStream(pathIn)
        .pipe(new PNG())
        .on("parsed", function () {
          // Loop through
          for (let i = 0; i < this.data.length; i += 4) {
            const r = this.data[i];     // Red
            const g = this.data[i + 1]; // Green
            const b = this.data[i + 2]; // Blue

            const sepiaB = Math.min((.272 * r) + (.534 * g) + (.131 * (b)), 255.0); // Boost blue
            const sepiaG = Math.min((.349 * r) + (.686 * g) + (.168 * (b)), 255.0); // Slightly boost green
            const sepiaR = Math.min((.393 * r) + (.769 * g) + (.189 * (b)), 255.0); // reduce red

           // Apply new values
           this.data[i] = sepiaR;
           this.data[i + 1] = sepiaG;
           this.data[i + 2] = sepiaB;
            // Alpha channel (i + 3) not needed
          }

          // Write the modified PNG data to pathOut
          this.pack().pipe(fs.createWriteStream(pathOut)).on("finish", resolve);
        })
        .on("error", reject); // Handle any errors during the parsing process
    } catch (error) {
      console.error("Error in grayscale processing:", error);
      reject(error);
    }
  });
};



module.exports = {
  unzip,
  readDir,
  grayScale,
  redRemove,
  warm,
  cool,
  sepia,
};



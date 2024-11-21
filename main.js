const path = require("path");
const fs = require("fs");
const IOhandler = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessedGS = path.join(__dirname, "grayscaled");
const pathProcessedW = path.join(__dirname, "Warm Filtered");
const pathProcessedC = path.join(__dirname, "Cool Filtered");

const extractAndProcessPngs = async () => {
    try {
      await IOhandler.unzip(zipFilePath, pathUnzipped);
  
      const pngFiles = await IOhandler.readDir(pathUnzipped);
      console.log("PNG Files to be processed:", pngFiles);

      await fs.promises.mkdir(pathProcessedGS, { recursive: true });
      await fs.promises.mkdir(pathProcessedW, { recursive: true });
      await fs.promises.mkdir(pathProcessedC, { recursive: true });
  
      for (const filePath of pngFiles) {
        const fileName = path.basename(filePath); // Extract file name
        // const outputFilePath = path.join(pathProcessedGS, fileName); // Set output path
        await IOhandler.grayScale(filePath, path.join(pathProcessedGS, fileName)); // Process and save
        await IOhandler.warm(filePath, path.join(pathProcessedW, fileName)); // Process and save
        await IOhandler.cool(filePath, path.join(pathProcessedC, fileName)); // Process and save
        console.log(`Processed: ${filePath} -> ${pathProcessedGS}`);
        console.log(`Processed: ${filePath} -> ${pathProcessedW}`);
        console.log(`Processed: ${filePath} -> ${pathProcessedC}`);
      }
  
      console.log("All PNG files have been processed and saved in:", pathProcessedGS);
    } catch (error) {
      console.error("Error during processing:", error);
    }
  };
  
  extractAndProcessPngs();
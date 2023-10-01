// Impoting the required libraries
import express from "express";
import * as dotenv from 'dotenv';
import { Configuration, OpenAIApi } from "openai";
import multer from "multer";
import fs from "fs"
import sharp from "sharp";

// generate random Id 
let id = "id" + Math.random().toString(16).slice(2);
// Declare the global file  path
let filePath;

// setup the storage Information

const storage = multer.diskStorage({
    destination: (req, file, next) => {
        next(null, "../server/public")
    },
    filename: (req, file, next) => {
        // console.log("file", file)
        next(null, Date.now() + "-" + file.originalname)
    }
})

// upload the file to the local-storage

const upload = multer({ storage: storage }).single("file")

dotenv.config();
const router = express.Router();

// Configuration of Open AI API

const configuration = new Configuration({
    apiKey: OPENAI_API_KEY
    // apiKey: "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"
    // apiKey: "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"

});

const openai = new OpenAIApi(configuration);

//  Route 01 => Image Generating through Command prompt => method :> POST => localhost:8080/api/v1/dalle
router.route('/').post(async (req, res) => {

    try {
        // destructuring the request body
        const { prompt } = req.body;

        const aiResponse = await openai.createImage({
            prompt,
            n: 1,
            size: "1024x1024",
            response_format: "b64_json"
        });
        // res.status(200).json(aiResponse)
        const image = aiResponse.data.data[0].b64_json;
        res.status(200).json({ photo: image })
    } catch (error) {
        res.json(error);
        res.status(500).send(error?.response.data.error.massage)
    }
})

//  Route 02 => Image Varation Generating => method :> POST => localhost:8080/api/v1/dalle/variation

router.route("/variation").post(async (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
        } else if (err) {
            // An unknown error occurred when uploading.
        }

        // Store the path in the filePath variable
        filePath = req.file.path
        // setup the sharp library for resize the Image for API request
        let inputImage = filePath;
        let outputImage = `../server/cropImage/${id}.png`
        sharp(inputImage)
            .resize({ width: 512, height: 512 })
            .toFile(outputImage)
            .then(async() => {await generateImage(); fs.unlinkSync(filePath)})
            .catch(err => console.log(err, "Error occured"))

    })

    // function for requesting the Open AI API and  generate the Variation of the Image

    const generateImage = async () => {
        const response = await openai.createImageVariation(
            fs.createReadStream(`../server/cropImage/${id}.png`),
            1,
            "1024x1024",
            "b64_json"
        );

        const image = response.data.data[0].b64_json
        fs.unlinkSync(`../server/cropImage/${id}.png`)
        res.status(200).json(image)
    }
})


export default router;
const { File, validate } = require("../models/file");
const fs = require("fs");
const readline = require("readline");
const SpellChecker = require("simple-spellchecker").getDictionarySync("en-GB");
const stringSimilarity = require("string-similarity");
const BASE_URL = "https://ed-5989763781230592.educative.run";

const spellCheck = async (path) => {
  const readInterface = readline.createInterface({
    input: fs.createReadStream(path),
    output: process.stdout,
    console: false,
  });

  let text = "";

  for await (const line of readInterface) {
    const correctedLine = line
      .split(" ")
      .map((word) => {
        if (!SpellChecker.spellCheck(word)) {
          const suggestions = SpellChecker.getSuggestions(word);

          const matches = stringSimilarity.findBestMatch(
            word,
            suggestions.length === 0 ? [word] : suggestions
          );

          return matches.bestMatch.target;
        }
        return word;
      })
      .join(" ");

    text += correctedLine + "\n";
  }

  fs.writeFile(`${path}.txt`, text, (err, res) => {
    if (err) console.log("error", err);
  });
};

exports.upload = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { name, description } = req.body;
    let path = req.file.path;

    if (req.file.mimetype === "text/plain") {
      await spellCheck(req.file.path);
      path = `${req.file.path}.txt`;
    }

    const file = await File.create({
      name,
      createdBy: req.user.user_id,
      description,
      createdAt: Date.now(),
      filePath: BASE_URL + "/" + path,
    });

    res.status(200).json({ message: "File uploaded successfully", data: file });
  } catch (err) {
    console.log(err);
    return res.status(400).send(err.message);
  }
};
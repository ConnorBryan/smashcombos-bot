require("dotenv").config();

const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const getUuid = require("uuid/v4");
const sha1 = require("sha1");
const GitHubService = require("./GitHubService");

const app = express();

// Middleware
app.use(bodyParser());
app.use(
  cors({
    origin: process.env.ORIGIN
  })
);

// Add Combo
app.post(`/characters/:character/combos`, async (req, res) => {
  try {
    const { character } = req.params;
    const { combo } = req.body;
    const uuid = getUuid();
    const branch = `add-combo/${character}/${uuid}`;
    const existingCharacterData = await GitHubService.getExistingCharacterData(
      character
    );
    const newCharacterData = {
      ...existingCharacterData,
      combos: [...existingCharacterData.combos, combo]
    };
    const newBranch = await GitHubService.createBranch(branch);

    if (newBranch) {
      const newCommit = await GitHubService.createCommit(
        character,
        newCharacterData,
        branch
      );

      if (newCommit) {
        const newPullRequest = await GitHubService.createPullRequest(
          branch,
          `Adding a combo for ${character}`,
          "..."
        );

        if (newPullRequest) {
          return res.json({
            success: true
          });
        } else {
          return res.json({
            success: false,
            error: `Failed to create a new pull request.`
          });
        }
      } else {
        return res.json({
          success: false,
          error: `Failed to create a new commit.`
        });
      }
    } else {
      return res.json({
        success: false,
        error: `Failed to create a new branch.`
      });
    }
  } catch (error) {
    console.log("General error.");

    return res.json({
      success: false
    });
  }
});

app.listen(process.env.PORT, () =>
  console.info(`SmashCombos Bot listening on port ${process.env.PORT}.`)
);

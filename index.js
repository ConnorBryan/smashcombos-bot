require("dotenv").config();

const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const getUuid = require("uuid/v4");
const sha1 = require("sha1");
const GitHubService = require("./GitHubService");
const { getUsername } = require("./helpers");

const app = express();

// Middleware
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(
  cors({
    origin: process.env.ORIGIN
  })
);

// Test
app.get("/", (req, res) =>
  res.json({
    success: true,
    message: "Accessed SmashCombot Bot!"
  })
);

// Edit Profile
app.post(`/characters/:character/profile`, async (req, res) => {
  try {
    const { character } = req.params;
    const { user, description, tags } = req.body;
    const username = getUsername(user);
    const uuid = getUuid();
    const branch = `edit-profile/${character}/${uuid}`;
    const existingCharacterData = await GitHubService.getExistingCharacterData(
      character
    );
    const newCharacterData = {
      ...existingCharacterData,
      description,
      tags
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
          `Editing the profile of ${character}`,
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
    console.error("General error in Edit Profile");

    return res.json({
      success: false
    });
  }
});

// Edit Combo
app.post(`/characters/:character/combos/:comboId`, async (req, res) => {
  try {
    const { character, comboId } = req.params;
    const { user, combo } = req.body;
    const username = getUsername(user);
    const uuid = getUuid();
    const branch = `edit-combo/${character}/${uuid}`;
    const existingCharacterData = await GitHubService.getExistingCharacterData(
      character
    );
    const newCharacterData = {
      ...existingCharacterData,
      combos: existingCharacterData.combos.map(existingCombo =>
        existingCombo.uuid === comboId ? combo : existingCombo
      )
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
          `Editing a combo for ${character}`,
          `Submitted by ${username}`
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
    console.error("General error in Edit Combo");

    return res.json({
      success: false
    });
  }
});

// Add Combo
app.post(`/characters/:character/combos`, async (req, res) => {
  try {
    const { character } = req.params;
    const { user, combo } = req.body;
    const username = getUsername(user);
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
          `Submitted by ${username}`
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

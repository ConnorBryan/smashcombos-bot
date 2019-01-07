const axios = require("axios");

module.exports = class GitHubService {
  static async getExistingCharacterData(character) {
    try {
      const { data } = await axios.get(
        `https://raw.githubusercontent.com/ConnorBryan/smashcombos/master/src/characters/${character}.json`
      );

      return data;
    } catch (error) {
      console.error(`Error in GitHubService#getExistingCharacterData`);

      return null;
    }
  }

  static async getMostRecentHash() {
    try {
      const { data: commits } = await axios.get(
        `${process.env.REPO_URL}/commits`
      );
      const { sha } = commits[0];

      return sha;
    } catch (error) {
      console.error(`Error in GitHubService#getMostRecentHash`);
    }
  }

  static async createBranch(name) {
    try {
      const sha = await GitHubService.getMostRecentHash();

      await axios.post(
        `${process.env.REPO_URL}/git/refs?access_token=${
          process.env.GITHUB_ACCESS_TOKEN
        }`,
        {
          ref: `refs/heads/${name}`,
          sha
        }
      );

      return true;
    } catch (error) {
      console.error(`Error in GitHubService#createBranch`);

      return false;
    }
  }

  static async createCommit(character, data, branch) {
    try {
      const url = `${
        process.env.REPO_URL
      }/contents/src/characters/${character}.json?access_token=${
        process.env.GITHUB_ACCESS_TOKEN
      }`;
      const {
        data: { sha }
      } = await axios.get(url);

      await axios.put(url, {
        message: "...",
        content: Buffer.from(JSON.stringify(data, null, 2)).toString("base64"),
        sha,
        branch
      });

      return true;
    } catch (error) {
      console.error(`Error in GitHubService#createCommit`);

      return false;
    }
  }

  static async createPullRequest(branch, title, body) {
    try {
      const { data: derp } = await axios.post(
        `
            ${process.env.REPO_URL}/pulls?access_token=${
          process.env.GITHUB_ACCESS_TOKEN
        }`,
        {
          head: branch,
          base: "master",
          title,
          body
        }
      );

      return true;
    } catch (error) {
      console.error(`Error in GitHubService#createPullRequest`);

      return false;
    }
  }
};

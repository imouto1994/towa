import "./App.css";

import React, { useEffect, useState } from "react";
import startCase from "lodash.startcase";

import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.REACT_APP_GITHUB_ACCESS_TOKEN,
});

function decryptName(name) {
  if (!name.startsWith("rev-")) {
    return name;
  }

  return name.substring(4).split("").reverse().join("");
}

const GITHUB_USERNAME = "hilda127";
const TEMPLATE_REPO_NAME = "boilerplate";

function naturalCompare(s1, s2) {
  return s1.localeCompare(s2, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function App() {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: newRepos } = await octokit.rest.repos.listForUser({
        username: GITHUB_USERNAME,
      });
      for (const repo of newRepos) {
        repo.displayedName = startCase(decryptName(repo.name));
      }
      newRepos.sort((r1, r2) =>
        naturalCompare(r1.displayedName, r2.displayedName)
      );
      setRepos(newRepos.filter((r) => r.name !== TEMPLATE_REPO_NAME));
    })();
  }, []);

  return (
    <div className="App">
      {repos.map((repo) => (
        <AppLink key={repo.name} repo={repo} />
      ))}
    </div>
  );
}

function AppLink(props) {
  const {
    repo: { name, displayedName },
  } = props;

  return (
    <a
      className="App-link"
      target="_blank"
      rel="noopener noreferrer"
      href={`https://${GITHUB_USERNAME}.github.io/${name}/`}
    >
      {displayedName}
    </a>
  );
}

export default App;

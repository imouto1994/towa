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

function getGroupName(str) {
  const normalRegex = /(.*) \d*$/;
  const tankRegex = /(.*) Tank( \d*)?$/;

  const normalMatch = str.match(normalRegex);
  if (normalMatch != null) {
    return normalMatch[1];
  }

  const tankMatch = str.match(tankRegex);
  if (tankMatch != null) {
    return tankMatch[1];
  }

  return str;
}

function useRepoGroups() {
  const [repoGroups, setRepoGroups] = useState([]);

  useEffect(() => {
    (async () => {
      // Fetch repos
      let { data: repos } = await octokit.rest.repos.listForUser({
        username: GITHUB_USERNAME,
      });

      repos = repos.filter((repo) => repo.name !== TEMPLATE_REPO_NAME);

      // Set displayed name for each repo
      for (const repo of repos) {
        repo.displayedName = startCase(decryptName(repo.name));
      }

      // Group repos
      const map = {};
      for (const repo of repos) {
        const groupName = getGroupName(repo.displayedName);
        if (map[groupName] == null) {
          map[groupName] = [];
        }
        map[groupName].push(repo);
      }

      // Sort repos within group
      for (const grouName of Object.keys(map)) {
        const groupRepos = map[grouName];
        groupRepos.sort((r1, r2) =>
          naturalCompare(r1.displayedName, r2.displayedName)
        );
      }

      const newRepoGroups = Object.entries(map);
      newRepoGroups.sort(([groupName1], [groupName2]) =>
        naturalCompare(groupName1, groupName2)
      );

      setRepoGroups(newRepoGroups);
    })();
  }, []);

  return repoGroups;
}

function App() {
  const repoGroups = useRepoGroups();

  return (
    <div className="App">
      {repoGroups.map(([groupName, repos]) => (
        <AppGroup key={groupName} repos={repos} />
      ))}
    </div>
  );
}

function AppGroup(props) {
  const { repos } = props;

  return (
    <div className="App-group">
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

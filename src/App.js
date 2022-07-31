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
        per_page: 100,
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
    repo: {
      name,
      displayedName,
      html_url: htmlUrl,
      owner: { login: username },
    },
  } = props;
  console.log(props.repo);

  return (
    <div className="App-link-wrapper">
      <a
        className="App-link-github"
        target="_blank"
        rel="noopener noreferrer"
        href={htmlUrl}
      >
        <GithubIcon className="App-link-github-icon" />
      </a>
      <a
        className="App-link"
        target="_blank"
        rel="noopener noreferrer"
        href={`https://${username}.github.io/${name}/`}
      >
        {displayedName}
      </a>
    </div>
  );
}

function GithubIcon(props) {
  const { className } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={className}
    >
      <path d="M16 .4a16 16 0 0 0-5.06 31.18c.8.15 1.09-.34 1.09-.77l-.01-2.72c-4.46.96-5.4-2.15-5.4-2.15-.73-1.85-1.78-2.34-1.78-2.34-1.45-1 .12-.97.12-.97 1.6.1 2.45 1.65 2.45 1.65 1.42 2.44 3.74 1.74 4.66 1.32a3.39 3.39 0 0 1 1-2.13c-3.54-.4-7.28-1.78-7.28-7.9 0-1.76.62-3.19 1.65-4.3a5.7 5.7 0 0 1 .14-4.24s1.34-.43 4.4 1.64a15.25 15.25 0 0 1 8 0c3.04-2.07 4.38-1.64 4.38-1.64.86 2.2.31 3.83.16 4.23a6.22 6.22 0 0 1 1.63 4.3c0 6.15-3.74 7.5-7.3 7.9.56.47 1.08 1.46 1.08 2.95l-.01 4.39c0 .41.28.91 1.1.75C27.42 29.45 32 23.45 32 16.4a16 16 0 0 0-16-16z" />
    </svg>
  );
}

export default App;

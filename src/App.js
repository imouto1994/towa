import "./App.css";

import React, { useEffect, useState, useMemo } from "react";
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

function App() {
  const [names, setNames] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: repos } = await octokit.rest.repos.listForUser({
        username: GITHUB_USERNAME,
      });
      setNames(
        repos
          .map((repo) => repo.name)
          .filter((name) => name !== TEMPLATE_REPO_NAME)
      );
    })();
  }, []);

  return (
    <div className="App">
      {names.map((name) => (
        <AppLink key={name} name={name} />
      ))}
    </div>
  );
}

function AppLink(props) {
  const { name } = props;

  const displayedName = useMemo(() => {
    return startCase(decryptName(name));
  }, [name]);

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

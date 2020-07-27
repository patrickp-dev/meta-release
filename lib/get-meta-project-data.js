const path = require('path');
const DepGraph = require('dependency-graph').DepGraph;

const addDependencies = ({ projectPackageJSON, dependencyType, dependencyInfo }) => {
  if (projectPackageJSON[dependencyType]) {
    if (!dependencyInfo[dependencyType]) {
      dependencyInfo[dependencyType] = {};
    }

    Object.keys(projectPackageJSON[dependencyType]).forEach(depName => {
      dependencyInfo[dependencyType][depName] = {
        version: projectPackageJSON[dependencyType][depName]
      };
    });
  }
};

const getMetaProjectData = ({ metaDirectory, metaConfig }) => {
  const dependencyGraph = new DepGraph();
  const metaProjectInfo = {};

  const dependencyTypes = ['dependencies', 'devDependencies', 'peerDependencies'];

  Object.keys(metaConfig.projects).forEach(projectFolder => {
    const projectPackageJSON = require(path.join(metaDirectory, projectFolder, 'package.json'));
    dependencyGraph.addNode(projectPackageJSON.name);
    metaProjectInfo[projectPackageJSON.name] = {
      version:  projectPackageJSON.version,
      projectFolder,
    };

    dependencyTypes.forEach(
      dependencyType => {
        addDependencies({
          projectPackageJSON,
          dependencyType,
          dependencyInfo: metaProjectInfo[projectPackageJSON.name],
        });
      }
    );
  });

  Object.keys(metaProjectInfo).forEach(projectName => {
    dependencyTypes.forEach(dependencyType => {
      const currentDependenciesForType = metaProjectInfo[projectName][dependencyType];
      if (currentDependenciesForType) {
        Object.keys(currentDependenciesForType).forEach(
          dependencyName => {
            if (metaProjectInfo[dependencyName]) {
              dependencyGraph.addDependency(projectName, dependencyName);
            }
          }
        );
      }
    });
  });

  return {
    dependencyGraph,
    metaProjectInfo,
  };
};

module.exports = getMetaProjectData;
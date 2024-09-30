// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"public/Workflow-Builder/tasksRunner.ts":[function(require,module,exports) {
"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
function getTasksRunner() {
  var taskIdCounter = 0;
  var allTasks = {};
  function addTask(task, dependencies) {
    if (dependencies === void 0) {
      dependencies = [];
    }
    var taskId = taskIdCounter++;
    var dependentPromises = dependencies.map(function (id) {
      return allTasks[id];
    });
    allTasks[taskId] = Promise.all(dependentPromises).then(task);
    return taskId;
  }
  function buildStrictWorkflow(tasks, dependencies) {
    if (dependencies === void 0) {
      dependencies = [];
    }
    var taskIds = tasks.map(function (task) {
      return addTask(task, dependencies);
    });
    return {
      doNext: function (tasks) {
        return buildStrictWorkflow(tasks, taskIds);
      }
    };
  }
  function defineTaskPurpose(taskDefinition) {
    var _a;
    var task = taskDefinition.task,
      dependencies = taskDefinition.dependencies;
    var dependentPromises = (_a = dependencies === null || dependencies === void 0 ? void 0 : dependencies.map(defineTaskPurpose)) !== null && _a !== void 0 ? _a : [];
    return addTask(task, dependentPromises);
  }
  function determineDependencyLevels(dependencies) {
    var totalTasks = Object.keys(dependencies).length;
    var depsClone = __assign({}, dependencies);
    var dependencyLevels = [];
    var leveledTasks = [];
    var _loop_1 = function () {
      var currentLevel = [];
      Object.entries(depsClone).forEach(function (_a) {
        var name = _a[0],
          deps = _a[1];
        var canBeLeveled = deps.every(function (dep) {
          return leveledTasks.includes(dep);
        });
        if (canBeLeveled && !leveledTasks.includes(name)) {
          currentLevel.push(name);
          leveledTasks.push(name);
        }
      });
      if (currentLevel.length === 0) {
        throw new Error("Circular dependency detected or the task structure is unresolvable.");
      }
      currentLevel.forEach(function (task) {
        delete depsClone[task];
      });
      dependencyLevels.push(currentLevel);
    };
    while (leveledTasks.length < totalTasks) {
      _loop_1();
    }
    return dependencyLevels;
  }
  function configureTaskGraph(graph, dependencies) {
    var dependencyLevels = determineDependencyLevels(dependencies);
    var firedTaskIds = {};
    dependencyLevels.forEach(function (level) {
      level.forEach(function (task) {
        var mappedDependencies = dependencies[task].map(function (taskName) {
          return firedTaskIds[taskName];
        });
        firedTaskIds[task] = addTask(graph[task], mappedDependencies);
      });
    });
  }
  return {
    addTask: addTask,
    buildStrictWorkflow: buildStrictWorkflow,
    defineTaskPurpose: defineTaskPurpose,
    configureTaskGraph: configureTaskGraph
  };
}
exports.default = getTasksRunner();
},{}],"app.js":[function(require,module,exports) {
const http = require('http');
const fs = require('fs');
const path = require('path');
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.svg': 'application/image/svg+xml'
};
const app = http.createServer((request, response) => {
  let filePath = path.join(__dirname, 'public', request.url);
  if (filePath === path.join(__dirname, 'public', '/')) filePath = path.join(__dirname, 'public', 'index.html');
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(500);
      response.end(`Sorry, check with the site admin for error: ${error.code} ..\n`);
      response.end();
    } else {
      response.writeHead(200, {
        'Content-Type': contentType
      });
      response.end(content, 'utf-8');
    }
  });
});
module.exports = app;
},{}],"index.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
var tasksRunner_1 = __importDefault(require("./public/Workflow-Builder/tasksRunner"));
var app = require('./app');
var port = '8888';
var manuallySetTasksDependencies = function () {
  var taskId1 = tasksRunner_1.default.addTask(function () {
    return new Promise(function (resolve) {
      console.log('Task 1: yay');
      setTimeout(function () {
        console.log('Task 1 completed');
        resolve();
      }, 3000);
    });
  });
  var taskId2 = tasksRunner_1.default.addTask(function () {
    return new Promise(function (resolve) {
      console.log('Task 2: wow');
      setTimeout(function () {
        console.log('Task 2 completed');
        resolve();
      }, 2000);
    });
  }, [taskId1]);
};
var useStrictWorkflowLogic = function () {
  var workflowTask = tasksRunner_1.default.buildStrictWorkflow([function () {
    return new Promise(function (resolve) {
      console.log('Workflow Task 1: Executing task 1');
      setTimeout(function () {
        console.log('Workflow Task 1 completed');
        resolve();
      }, 1500);
    });
  }, function () {
    return new Promise(function (resolve) {
      console.log('Workflow Task 2: Executing task 2');
      setTimeout(function () {
        console.log('Workflow Task 2 completed');
        resolve();
      }, 1000);
    });
  }]).doNext([function () {
    return new Promise(function (resolve) {
      console.log('Workflow Task 3: Executing task 3');
      setTimeout(function () {
        console.log('Workflow Task 3 completed');
        resolve();
      }, 2500);
    });
  }]).doNext([function () {
    return new Promise(function (resolve) {
      console.log('Workflow Task 4: Executing task 4');
      setTimeout(function () {
        console.log('Workflow Task 4 completed');
        resolve();
      }, 500);
    });
  }, function () {
    return new Promise(function (resolve) {
      console.log('Workflow Task 5: Executing task 5');
      setTimeout(function () {
        console.log('Workflow Task 5 completed');
        resolve();
      }, 2500);
    });
  }, function () {
    return new Promise(function (resolve) {
      console.log('Workflow Task 6: Executing task 6');
      setTimeout(function () {
        console.log('Workflow Task 6 completed');
        resolve();
      }, 1500);
    });
  }]).doNext([function () {
    return new Promise(function (resolve) {
      console.log('Workflow Task 7: Executing task 7');
      setTimeout(function () {
        console.log('Workflow Task 7 completed');
        resolve();
      }, 1000);
    });
  }]);
};
var usePurposeFlow = function () {
  var purposeTaskId = tasksRunner_1.default.defineTaskPurpose({
    task: function () {
      return new Promise(function (resolve) {
        console.log('Purpose Task: Running purpose task');
        setTimeout(function () {
          console.log('Purpose Task completed');
          resolve();
        }, 2000);
      });
    },
    dependencies: [{
      task: function () {
        return new Promise(function (resolve) {
          console.log('Dependent Task A: Running dependent task A');
          setTimeout(function () {
            console.log('Dependent Task A completed');
            resolve();
          }, 1000);
        });
      }
    }, {
      task: function () {
        return new Promise(function (resolve) {
          console.log('Dependent Task B: Running dependent task B');
          setTimeout(function () {
            console.log('Dependent Task B completed');
            resolve();
          }, 1500);
        });
      },
      dependencies: [{
        task: function () {
          return new Promise(function (resolve) {
            console.log('Dependent Task C: Running dependent task C');
            setTimeout(function () {
              console.log('Dependent Task C completed');
              resolve();
            }, 800);
          });
        }
      }]
    }]
  });
};
var useGraphDenpendenciesLogic = function () {
  tasksRunner_1.default.configureTaskGraph({
    taskA: function () {
      return new Promise(function (resolve) {
        console.log('Task A: Executing task A');
        setTimeout(function () {
          console.log('Task A completed');
          resolve();
        }, 3000);
      });
    },
    taskB: function () {
      return new Promise(function (resolve) {
        console.log('Task B: Executing task B');
        setTimeout(function () {
          console.log('Task B completed');
          resolve();
        }, 2500);
      });
    },
    taskC: function () {
      return new Promise(function (resolve) {
        console.log('Task C: Executing task C');
        setTimeout(function () {
          console.log('Task C completed');
          resolve();
        }, 1500);
      });
    },
    taskD: function () {
      return new Promise(function (resolve) {
        console.log('Task D: Executing task D');
        setTimeout(function () {
          console.log('Task D completed');
          resolve();
        }, 2000);
      });
    },
    taskE: function () {
      return new Promise(function (resolve) {
        console.log('Task E: Executing task E');
        setTimeout(function () {
          console.log('Task E completed');
          resolve();
        }, 1200);
      });
    }
  }, {
    taskA: [],
    taskB: ['taskA'],
    taskC: [],
    taskD: ['taskB'],
    taskE: ['taskC', 'taskD']
  });
};
app.listen(port, function () {
  console.log("Start runnin exmaple");
  //manuallySetTasksDependencies();
  //useStrictWorkflowLogic();
  //usePurposeFlow();
  useGraphDenpendenciesLogic();
});
},{"./public/Workflow-Builder/tasksRunner":"public/Workflow-Builder/tasksRunner.ts","./app":"app.js"}]},{},["index.ts"], null)
//# sourceMappingURL=/index.js.map
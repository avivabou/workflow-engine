import tasksRunner from './public/Workflow-Builder/tasksRunner';

const app = require('./app');

const port = '8888';

const manuallySetTasksDependencies = () => {
  const taskId1 = tasksRunner.addTask(() => {
    return new Promise<void>((resolve) => {
      console.log('Task 1: yay');
      setTimeout(() => {
        console.log('Task 1 completed');
        resolve();
      }, 3000); 
    });
  });

  const taskId2 = tasksRunner.addTask(() => {
    return new Promise<void>((resolve) => {
      console.log('Task 2: wow');
      setTimeout(() => {
        console.log('Task 2 completed');
        resolve();
      }, 2000); 
    });
  }, [taskId1]);
}

const useStrictWorkflowLogic = () => {
  const workflowTask = tasksRunner.buildStrictWorkflow([
    () => {
      return new Promise<void>((resolve) => {
        console.log('Workflow Task 1: Executing task 1');
        setTimeout(() => {
          console.log('Workflow Task 1 completed');
          resolve();
        }, 1500); 
      });
    },
    () => {
      return new Promise<void>((resolve) => {
        console.log('Workflow Task 2: Executing task 2');
        setTimeout(() => {
          console.log('Workflow Task 2 completed');
          resolve();
        }, 1000); 
      });
    }
  ]).doNext([
    () => {
      return new Promise<void>((resolve) => {
        console.log('Workflow Task 3: Executing task 3');
        setTimeout(() => {
          console.log('Workflow Task 3 completed');
          resolve();
        }, 2500); 
      });
    }
  ]).doNext([
    () => {
      return new Promise<void>((resolve) => {
        console.log('Workflow Task 4: Executing task 4');
        setTimeout(() => {
          console.log('Workflow Task 4 completed');
          resolve();
        }, 500); 
      });
    },
    () => {
      return new Promise<void>((resolve) => {
        console.log('Workflow Task 5: Executing task 5');
        setTimeout(() => {
          console.log('Workflow Task 5 completed');
          resolve();
        }, 2500); 
      });
    },
    () => {
      return new Promise<void>((resolve) => {
        console.log('Workflow Task 6: Executing task 6');
        setTimeout(() => {
          console.log('Workflow Task 6 completed');
          resolve();
        }, 1500); 
      });
    },
  ]).doNext([
    () => {
      return new Promise<void>((resolve) => {
        console.log('Workflow Task 7: Executing task 7');
        setTimeout(() => {
          console.log('Workflow Task 7 completed');
          resolve();
        }, 1000); 
      });
    }
  ]);
}

const usePurposeFlow = () => {
  const purposeTaskId = tasksRunner.defineTaskPurpose({
    task: () => {
      return new Promise<void>((resolve) => {
        console.log('Purpose Task: Running purpose task');
        setTimeout(() => {
          console.log('Purpose Task completed');
          resolve();
        }, 2000); 
      });
    },
    dependencies: [
      {
        task: () => {
          return new Promise<void>((resolve) => {
            console.log('Dependent Task A: Running dependent task A');
            setTimeout(() => {
              console.log('Dependent Task A completed');
              resolve();
            }, 1000); 
          });
        }
      },
      {
        task: () => {
          return new Promise<void>((resolve) => {
            console.log('Dependent Task B: Running dependent task B');
            setTimeout(() => {
              console.log('Dependent Task B completed');
              resolve();
            }, 1500); 
          });
        },
        dependencies: [
          {
            task: () => {
              return new Promise<void>((resolve) => {
                console.log('Dependent Task C: Running dependent task C');
                setTimeout(() => {
                  console.log('Dependent Task C completed');
                  resolve();
                }, 800); 
              });
            }
          }
        ]
      }
    ]
  });
}

const useGraphDenpendenciesLogic = () => {
  tasksRunner.configureTaskGraph({
    taskA: () => {
      return new Promise<void>((resolve) => {
        console.log('Task A: Executing task A');
        setTimeout(() => {
          console.log('Task A completed');
          resolve();
        }, 3000);
      });
    },
    taskB: () => {
      return new Promise<void>((resolve) => {
        console.log('Task B: Executing task B');
        setTimeout(() => {
          console.log('Task B completed');
          resolve();
        }, 2500); 
      });
    },
    taskC: () => {
      return new Promise<void>((resolve) => {
        console.log('Task C: Executing task C');
        setTimeout(() => {
          console.log('Task C completed');
          resolve();
        }, 1500); 
      });
    },
    taskD: () => {
      return new Promise<void>((resolve) => {
        console.log('Task D: Executing task D');
        setTimeout(() => {
          console.log('Task D completed');
          resolve();
        }, 2000); 
      });
    },
    taskE: () => {
      return new Promise<void>((resolve) => {
        console.log('Task E: Executing task E');
        setTimeout(() => {
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
}

app.listen(port, () => {
  console.log(`Start runnin exmaple`);
  //manuallySetTasksDependencies();
  //useStrictWorkflowLogic();
  //usePurposeFlow();
  useGraphDenpendenciesLogic();
});

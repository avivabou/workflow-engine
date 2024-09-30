type Task = () => Promise<any>;

type TaskDefinition = {
    task: Task,
    dependencies?: TaskDefinition[],
};

function getTasksRunner() {
    let taskIdCounter = 0;
    const allTasks: Record<number, Promise<any>> = {};

    function addTask(task: Task, dependencies: number[] = []) {
        const taskId = taskIdCounter++;
        const dependentPromises = dependencies.map((id) => allTasks[id]);
        allTasks[taskId] = Promise.all(dependentPromises).then(task);
        return taskId;
    }

    function buildStrictWorkflow(tasks: Task[], dependencies: number[] = []) {
        const taskIds = tasks.map((task) => addTask(task, dependencies));
        return {
            doNext: (tasks: Task[]) => buildStrictWorkflow(tasks, taskIds)
        };
    }

    function defineTaskPurpose(taskDefinition: TaskDefinition) {
        const { task, dependencies } = taskDefinition;
        const dependentPromises: number[] = dependencies?.map(defineTaskPurpose) ?? [];
        return addTask(task, dependentPromises);
    }

    function determineDependencyLevels(dependencies: Record<string, string[]>) {
        const totalTasks = Object.keys(dependencies).length;
        const depsClone = { ...dependencies };
        const dependencyLevels: string[][] = [];
        const leveledTasks: string[] = [];

        while (leveledTasks.length < totalTasks) {
            const currentLevel: string[] = [];

            Object.entries(depsClone).forEach(([name, deps]) => {
                const canBeLeveled = deps.every(dep => leveledTasks.includes(dep));
                if (canBeLeveled && !leveledTasks.includes(name)) {
                    currentLevel.push(name);
                    leveledTasks.push(name);
                }
            });

            if (currentLevel.length === 0) {
                throw new Error("Circular dependency detected or the task structure is unresolvable.");
            }
            currentLevel.forEach(task => {
                delete depsClone[task];
            });

            dependencyLevels.push(currentLevel);
        }

        return dependencyLevels;
    }

    function configureTaskGraph<T extends Record<string, Task>>(graph: T, dependencies: Record<keyof T, (keyof T)[]>) {
        const dependencyLevels = determineDependencyLevels(dependencies as Record<string, string[]>);

        const firedTaskIds: Record<string, number> = {};
        dependencyLevels.forEach(level => {
            level.forEach(task => {
                const mappedDependencies = dependencies[task].map((taskName) => firedTaskIds[taskName as string]);
                firedTaskIds[task] = addTask(graph[task], mappedDependencies);
            });
        });
    }

    return {
        addTask,
        buildStrictWorkflow,
        defineTaskPurpose,
        configureTaskGraph
    };
}

export default getTasksRunner();

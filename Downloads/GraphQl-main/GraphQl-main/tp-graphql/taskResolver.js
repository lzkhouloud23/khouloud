// taskResolver.js

let tasks = [
  {
    id: '1',
    title: 'Développement Front-end pour Site E-commerce',
    description:
      'Créer une interface utilisateur réactive en utilisant React et Redux pour un site e-commerce.',
    completed: false,
    duration: 10,
  },
  {
    id: '2',
    title: "Développement Back-end pour Authentification Utilisateur",
    description:
      "Implémenter un système d'authentification et d'autorisation pour une application web en utilisant Node.js, Express, et Passport.js",
    completed: false,
    duration: 8,
  },
  {
    id: '3',
    title: "Tests et Assurance Qualité pour Application Web",
    description:
      'Développer et exécuter des plans de test et des cas de test complets.',
    completed: false,
    duration: 5,
  },
];

const taskResolver = {
  Query: {
    // Récupérer une tâche par ID
    task: (_, { id }) => tasks.find((task) => task.id === id),

    // Récupérer toutes les tâches
    tasks: () => tasks,
  },

  Mutation: {
    // Q10 Ajouter une nouvelle tâche
    addTask: (_, { title, description, completed, duration }) => {
      const task = {
        id: String(tasks.length + 1),
        title,
        description,
        completed,
        duration: duration ?? null,
      };
      tasks.push(task);
      return task;
    },

    // Q11 Marquer une tâche comme terminée
    completeTask: (_, { id }) => {
      const taskIndex = tasks.findIndex((task) => task.id === id);
      if (taskIndex !== -1) {
        tasks[taskIndex].completed = true;
        return tasks[taskIndex];
      }
      return null;
    },

    // Q12 Changer la description d'une tâche 
    changeDescription: (_, { id, description }) => {
      const taskIndex = tasks.findIndex((task) => task.id === id);
      if (taskIndex !== -1) {
        tasks[taskIndex].description = description;
        return tasks[taskIndex];
      }
      return null;
    },

    // Q13 Supprimer une tâche par ID 
    deleteTask: (_, { id }) => {
      const taskIndex = tasks.findIndex((task) => task.id === id);
      if (taskIndex !== -1) {
        const [deletedTask] = tasks.splice(taskIndex, 1);
        return deletedTask;
      }
      return null;
    },
  },
};

module.exports = taskResolver;

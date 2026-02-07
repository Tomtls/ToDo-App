export const saveTasks = (username, tasks) => {
  if (!username) return;
  localStorage.setItem(`tasks_${username}`, JSON.stringify(tasks));
};

export const loadTasks = (username) => {
  if (!username) return [];
  const stored = localStorage.getItem(`tasks_${username}`);
  return stored ? JSON.parse(stored) : [];
};

export const saveLabels = (username, labels) => {
  if (!username) return;
  localStorage.setItem(`labels_${username}`, JSON.stringify(labels));
};

export const loadLabels = (username) => {
  if (!username) return [];
  const stored = localStorage.getItem(`labels_${username}`);
  return stored ? JSON.parse(stored) : [];
};

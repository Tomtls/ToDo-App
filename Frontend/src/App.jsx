import { useEffect, useState } from "react";
import Login from "./Login";
import "./App.css";

function App() {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser"))
  );
  const [tasks, setTasks] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [description, setDescription] = useState("");

  /* ---------- Task Storage ---------- */
  const saveTasks = (username, tasks) => {
    localStorage.setItem(`tasks_${username}`, JSON.stringify(tasks));
  };

  const loadTasks = (username) => {
    const stored = localStorage.getItem(`tasks_${username}`);
    return stored ? JSON.parse(stored) : [];
  };

  /* ---------- Effects ---------- */
  useEffect(() => {
    if (currentUser) {
      const userTasks = loadTasks(currentUser.username);
      setTasks(userTasks);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      saveTasks(currentUser.username, tasks);
    }
  }, [tasks, currentUser]);

  /* ---------- Auth ---------- */
  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  const logout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setTasks([]);
  };

  /* ---------- Task Logic ---------- */
  const addTask = () => {
    if (!title.trim() || !dueDate) return;

    const newTask = {
      id: Date.now(),
      title,
      dueDate,
      dueTime,
      description,
      completed: false,
    };

    setTasks([...tasks, newTask]);
    closeModal();
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setTitle("");
    setDueDate("");
    setDueTime("");
    setDescription("");
  };

  /* ---------- UI ---------- */
  return (
    <>
      {/* Header außerhalb des Containers für volle Breite */}
      <div className="header">
        <h1>📋 ToDo App</h1>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Hauptcontainer für Tasks */}
      <div className="app-container">
        <button className="add-task-btn" onClick={openModal}>
          Neue Aufgabe hinzufügen
        </button>

        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task-item">
              <span className={`task-title ${task.completed ? "completed" : ""}`}>
  {task.title} – {task.dueDate}
  {task.dueTime && ` um ${task.dueTime}`}
  {task.description && <div>{task.description}</div>}
</span>

{/* Haken-Button für erledigt */}
<button className="complete-btn" onClick={() => toggleTask(task.id)}>✔️</button>

{/* Löschen */}
<button className="delete-btn" onClick={() => deleteTask(task.id)}>❌</button>

            </li>
          ))}
        </ul>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <input
                className="modal-input"
                type="text"
                placeholder="Titel hinzufügen"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <label>Fälligkeitsdatum</label>
              <input
                className="modal-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <label>Uhrzeit (optional)</label>
              <input
                className="modal-input"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
              <label>Beschreibung</label>
              <textarea
                className="modal-textarea"
                placeholder="Beschreibung hinzufügen"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="modal-buttons">
                <button className="modal-add-btn" onClick={addTask}>
                  Hinzufügen
                </button>
                <button className="modal-cancel-btn" onClick={closeModal}>
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import personService from './personService'; // Import the service module
import Notification from './Notification'; // Import Notification component
import ErrorNotification from './ErrorNotification'; // Import ErrorNotification component
import './App.css'; // Import styles

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [filter, setFilter] = useState('');
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    personService.getAll().then((initialPersons) => {
      setPersons(initialPersons);
    });
  }, []);

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const addPerson = (event) => {
    event.preventDefault();

    const existingPerson = persons.find((person) => person.name === newName);

    if (existingPerson) {
      const confirmed = window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`
      );
      if (confirmed) {
        const updatedPerson = { ...existingPerson, number: newNumber };
        personService
          .update(existingPerson.id, updatedPerson)
          .then((returnedPerson) => {
            setPersons(
              persons.map((person) =>
                person.id !== existingPerson.id ? person : returnedPerson
              )
            );
            setNewName('');
            setNewNumber('');
            setNotification(`${returnedPerson.name} updated`);
            setTimeout(() => {
              setNotification(null);
            }, 5000);
          })
          .catch((error) => {
            setError(
              `Information of ${existingPerson.name} has already been removed from server.`
            );
            setTimeout(() => {
              setError(null);
            }, 5000);
          });
      }
    } else {
      const newPerson = { name: newName, number: newNumber };
      personService.create(newPerson).then((returnedPerson) => {
        setPersons([...persons, returnedPerson]);
        setNewName('');
        setNewNumber('');
        setNotification(`${returnedPerson.name} added`);
        setTimeout(() => {
          setNotification(null);
        }, 5000);
      });
    }
  };

  const deletePerson = (id, name) => {
    const confirmed = window.confirm(`Delete ${name} ?`);
    if (confirmed) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter((person) => person.id !== id));
          setNotification(`${name} deleted`);
          setTimeout(() => {
            setNotification(null);
          }, 5000);
        })
        .catch((error) => {
          setError(
            `Information of ${name} has already been removed from server.`
          );
          setTimeout(() => {
            setError(null);
          }, 5000);
        });
    }
  };

  const filteredPersons = persons.filter((person) =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification message={notification} />
      <ErrorNotification message={error} />

      <div>
        filter shown with:{' '}
        <input value={filter} onChange={handleFilterChange} />
      </div>

      <form onSubmit={addPerson}>
        <h3>Add a new</h3>
        <div>
          name: <input value={newName} onChange={handleNameChange} />
        </div>
        <div>
          number: <input value={newNumber} onChange={handleNumberChange} />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>

      <div>
        <h3>Numbers</h3>
        <ul>
          {filteredPersons.map((person) => (
            <li key={person.id}>
              {person.name}: {person.number}
              <button onClick={() => deletePerson(person.id, person.name)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;

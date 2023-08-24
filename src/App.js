import React, { useState, useEffect } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './App.css';

//Al hacer clic en un bug, muestra más detalles del mismo en una vista detallada.
function BugListItem({ issue, selectedBug, handleBugClick }) {
  // Componente funcional que recibe props para mostrar un elemento de la lista de bugs
  return (
    <li key={issue.id} className="list-group-item mb-3 borde">
      <div className="card bg-ligh mb-3 cardPersonalizada">
        <div className="card-header">
          <h4 className="mb-2" onClick={() => handleBugClick(issue)}>
          <p className="strong-text">Título:</p>{issue.title}
          </h4>
        </div>
        <div className="card-body">
          <p className="card-text textCard">
            {selectedBug === issue && (
              <div>
                <p className="strong-text">Descripción:</p>{issue.body}
                <p className="strong-text">Fecha de creación:</p>{new Date(issue.created_at).toLocaleDateString()}
                <p className="strong-text">Creado por:</p>{issue.user.login}
              </div>
            )}
          </p>
        </div>
      </div>
    </li>
  );
}

function App() {
  // Estados definidos con useState
  const [results, setResults] = useState([]);
  const [keywords, setKeywords] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [currentResults, setCurrentResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedBug, setSelectedBug] = useState(null); 
  const [errorMessage, setErrorMessage] = useState('');
  const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;

  // Funciones para manejar la búsqueda, el clic en botón y otros eventos...

  const handleSearch = async () => {

    if (keywords.trim() === '') {
      setErrorMessage("Por favor, introduce un texto para buscar.");
      return;
    }
  
    try {
      const response = await fetch(`https://api.github.com/search/issues?q=${keywords}+type:issue`, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      });
      const data = await response.json();

      if (data.items) {
        // Filtrar solo los issues etiquetados como "bug"
        const bugIssues = data.items.filter((issue) =>
          issue.labels.some((label) => label.name === "bug")
        );
  
        setResults(bugIssues);
        if (bugIssues.length === 0) {
          setErrorMessage("El bug que ingresaste no existe.");
        } else {
          setErrorMessage('');
        }
        
      } else {
        setResults([]);
      }
      
      // Restablecer la página actual a 1 después de una nueva búsqueda
      setCurrentPage(1);
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };
  
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };
  
  const loadMoreResults = () => {
    if (!isLoading && currentResults.length < results.length) {
      setIsLoading(true);

      // Simulamos una pausa de 1 segundo para obtener más resultados
      setTimeout(() => {
        const newPage = currentPage + 1;
        setCurrentPage(newPage);

        const newCurrentResults = [
          ...currentResults,
          ...results.slice((newPage - 1) * resultsPerPage, newPage * resultsPerPage)
        ];

        setCurrentResults(newCurrentResults);
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleBugClick = (bug) => {
    setSelectedBug(bug);
  };
  
  useEffect(() => {
    // Aplicar un "debounce" utilizando setTimeout
    console.log('Debounce timer started'); 
    const debounceTimer = setTimeout(() => {
      console.log('Debounce timer expired'); 
      setSearchValue(keywords);
    }, 300); // Cambiar el valor para ajustar el tiempo de "debounce"
  
    // Limpiar el temporizador en cada cambio
    return () => {
      console.log('Debounce timer cleared'); 
      clearTimeout(debounceTimer);
    };
  }, [keywords]);

  useEffect(() => {
    const initialResults = results.slice(0, resultsPerPage);
    setCurrentResults(initialResults);
  }, [results, resultsPerPage]);


  return (
    <div className="App">
      <header className="App-header">
      {/* Logo */}
      <img
        src="../assets/img/bug.png"
        alt="Imagen de encabezado"
        className="imagen-encabezado"
        />

        <h1 className="mb-4">Buscador de bugs</h1>
        {/* Barra de búsqueda */}
        <div className="mb-2 d-flex align-items-center">
          <input
            type="text"
            className="form-control mr-2"
            placeholder="Introduce palabras clave..."
            value={keywords}
            onChange={(e) => {
              setKeywords(e.target.value);
              setErrorMessage('');
            }}
            onKeyPress={handleKeyPress}
          />
          <button className="btn btn-primary mx-3" onClick={handleSearch}>
            Buscar
          </button>
        </div>
        {/* Mensaje de error */}
        <CSSTransition
          in={errorMessage !== ''}
          timeout={300}
          classNames="error-message"
          unmountOnExit
        >
          <p className="error-message">{errorMessage}</p>
        </CSSTransition>

        {/* Lista de resultados */}
        <TransitionGroup component="ul" className="list-group">
          {currentResults.map((issue) => (
            <CSSTransition key={issue.id} timeout={300} classNames="fade">
              <BugListItem
                issue={issue}// Prop para representar un bug específico
                selectedBug={selectedBug}// Prop para el bug seleccionado para vista detallada
                handleBugClick={handleBugClick}// Prop para manejar el clic en un bug
              />
            </CSSTransition>
          ))}
        </TransitionGroup>
         {/* Botón de carga o lazy loading*/}
        {currentResults.length > 0 && (
          <div>
            <button
              className="btn btn-primary"
              onClick={loadMoreResults}
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Cargar más'}
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
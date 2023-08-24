
import React, { useState, useEffect } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './App.css';


function BugListItem({ issue, selectedBug, handleBugClick }) {
  return (
    <li key={issue.id} className="list-group-item mb-3 borde">
      <div className="card bg-ligh mb-3 cardPersonalizada">
        <div className="card-header">
          <h4 className="mb-2" onClick={() => handleBugClick(issue)}>
            Titulo: {issue.title}
          </h4>
        </div>
        <div className="card-body">
          <p className="card-text textCard">
            {selectedBug === issue && (
              <div>
                <p>Descripcion: {issue.body}</p>
                <p>Creado por: {issue.user.login}</p>
                <p>Fecha de creación: {new Date(issue.created_at).toLocaleDateString()}</p>
              </div>
            )}
          </p>
        </div>
      </div>
    </li>
  );
}

function App() {
  const [results, setResults] = useState([]);
  const [keywords, setKeywords] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [currentResults, setCurrentResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedBug, setSelectedBug] = useState(null); // Nuevo estado para el bug seleccionado
  const [errorMessage, setErrorMessage] = useState('');


  const handleSearch = async () => {

    if (keywords.trim() === '') {
      setErrorMessage("Por favor, introduce un texto para buscar.");
      return;
    }
  
    try {
      const response = await fetch(`https://api.github.com/search/issues?q=${keywords}+type:issue`, {
        headers: {
          Authorization: `Bearer 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`,
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
    console.log('Debounce timer started'); // Agrega este mensaje de registro
    const debounceTimer = setTimeout(() => {
      console.log('Debounce timer expired'); // Agrega este mensaje de registro
      setSearchValue(keywords);
    }, 300); // Cambiar el valor para ajustar el tiempo de "debounce"
  
    // Limpiar el temporizador en cada cambio
    return () => {
      console.log('Debounce timer cleared'); // Agrega este mensaje de registro
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
      <img
        src="../assets/img/bug.png"
        alt="Imagen de encabezado"
        className="imagen-encabezado"
        />

        <h1 className="mb-4">Buscador de bugs</h1>
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
        <CSSTransition
          in={errorMessage !== ''}
          timeout={300}
          classNames="error-message"
          unmountOnExit
        >
          <p className="error-message">{errorMessage}</p>
        </CSSTransition>

        <TransitionGroup component="ul" className="list-group">
          {currentResults.map((issue) => (
            <CSSTransition key={issue.id} timeout={300} classNames="fade">
              <BugListItem
                issue={issue}
                selectedBug={selectedBug}
                handleBugClick={handleBugClick}
              />
            </CSSTransition>
          ))}
        </TransitionGroup>
        
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
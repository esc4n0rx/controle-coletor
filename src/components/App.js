// src/components/App.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import EntradaModal from './EntradaModal';
import SaidaModal from './SaidaModal';
import Relatorios from './Relatorios';
import { FaLightbulb, FaRegLightbulb } from 'react-icons/fa';
import '../styles/App.css';

function App() {
  const [showEntrada, setShowEntrada] = useState(false);
  const [showSaida, setShowSaida] = useState(false);
  const [viewRelatorios, setViewRelatorios] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Persistir a escolha do usuário no localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setDarkMode(JSON.parse(savedMode));
    }
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Container className="d-flex">
      <div className="position-absolute top-0 end-0 m-3">
        <Button variant="light" onClick={toggleDarkMode} className="shadow">
          {darkMode ? <FaLightbulb /> : <FaRegLightbulb />}
        </Button>
      </div>
      <div className="card text-center">
        <Card.Body>
          <Card.Title>Controle de Coletores</Card.Title>
          <Button variant="primary" className="m-2" onClick={() => setShowEntrada(true)}>
            Entrada
          </Button>
          <Button variant="success" className="m-2" onClick={() => setShowSaida(true)}>
            Saída
          </Button>
          <Button variant="info" className="m-2" onClick={() => setViewRelatorios(true)}>
            Relatórios
          </Button>
        </Card.Body>
      </div>

      <EntradaModal show={showEntrada} handleClose={() => setShowEntrada(false)} />
      <SaidaModal show={showSaida} handleClose={() => setShowSaida(false)} />
      {viewRelatorios && <Relatorios handleClose={() => setViewRelatorios(false)} />}
    </Container>
  );
}

export default App;

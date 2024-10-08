// src/components/Relatorios.js
import React, { useEffect, useState } from 'react';
import { Modal, Button, Table, Spinner, Alert, Form } from 'react-bootstrap';
import { supabase } from '../supabaseClient';

function Relatorios({ handleClose }) {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [dataFiltro, setDataFiltro] = useState('');
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');

  useEffect(() => {
    fetchRegistros();
    // eslint-disable-next-line
  }, []);

  const fetchRegistros = async (filtro = {}) => {
    setLoading(true);
    setErro('');
    try {
      let query = supabase
        .from('registros')
        .select(`
          id,
          tipo,
          status,
          data,
          hora,
          usuario: matriculas!registros_usuario_id_fkey(nome),
          coletor: coletores(codigo)
        `);

      // Filtro por data específica
      if (filtro.data) {
        query = query.eq('data', filtro.data);
      }

      // Filtro por intervalo de datas
      if (filtro.dataInicial && filtro.dataFinal) {
        query = query.gte('data', filtro.dataInicial).lte('data', filtro.dataFinal);
      }

      // Filtro por status (trabalhando ou entregue)
      // Este filtro é aplicado por padrão se nenhum filtro de status for especificado
      if (filtro.statuses && filtro.statuses.length > 0) {
        query = query.in('status', filtro.statuses);
      } else {
        query = query.in('status', ['trabalhando', 'entregue']);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log('Registros:', data); // Para depuração
      setRegistros(data);
    } catch (error) {
      setErro('Erro ao buscar registros.');
      console.error(error);
    }
    setLoading(false);
  };

  const handleFiltroData = (e) => {
    e.preventDefault();
    if (dataFiltro) {
      fetchRegistros({ data: dataFiltro });
    }
  };

  const handleFiltroIntervalo = (e) => {
    e.preventDefault();
    if (dataInicial && dataFinal) {
      fetchRegistros({ dataInicial, dataFinal });
    }
  };

  return (
    <Modal show={true} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Relatórios de Coletores</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {erro && <Alert variant="danger">{erro}</Alert>}
        <Form className="mb-4">
          <Form.Group className="mb-3" controlId="formData">
            <Form.Label>Filtrar por Data</Form.Label>
            <Form.Control
              type="date"
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
            />
            <Button variant="primary" className="mt-2" onClick={handleFiltroData}>
              Filtrar
            </Button>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formIntervaloData">
            <Form.Label>Filtrar por Intervalo de Datas</Form.Label>
            <div className="d-flex">
              <Form.Control
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                className="me-2"
              />
              <Form.Control
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
              />
            </div>
            <Button variant="primary" className="mt-2" onClick={handleFiltroIntervalo}>
              Filtrar Intervalo
            </Button>
          </Form.Group>
          <Button variant="secondary" onClick={() => fetchRegistros()}>
            Limpar Filtros
          </Button>
        </Form>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Nome do Usuário</th>
                <th>Código do Coletor</th>
                <th>Status</th>
                <th>Data</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody>
              {registros.length > 0 ? (
                registros.map((registro) => (
                  <tr key={registro.id}>
                    <td>{registro.usuario.nome}</td>
                    <td>{registro.coletor.codigo}</td>
                    <td>
                      {registro.status.charAt(0).toUpperCase() + registro.status.slice(1)}
                    </td>
                    <td>{registro.data}</td>
                    <td>{registro.hora}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Relatorios;

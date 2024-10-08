// src/components/EntradaModal.js
import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { supabase } from '../supabaseClient';
import ConfirmModal from './ConfirmModal';
import '../styles/EntradaModal.css';

function EntradaModal({ show, handleClose }) {
  const [matricula, setMatricula] = useState('');
  const [nome, setNome] = useState('');
  const [codigoColetor, setCodigoColetor] = useState('');
  const [erro, setErro] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleMatriculaChange = async (e) => {
    setMatricula(e.target.value);
    if (e.target.value.length >= 3) { // Por exemplo, após 3 caracteres
      const { data, error } = await supabase
        .from('matriculas')
        .select('nome')
        .eq('matricula', e.target.value)
        .single();
      if (error) {
        setNome('');
        setErro('Matrícula não encontrada.');
      } else {
        setNome(data.nome);
        setErro('');
      }
    } else {
      setNome('');
      setErro('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validações básicas
    if (!matricula || !codigoColetor || !nome) {
      setErro('Por favor, preencha todos os campos corretamente.');
      return;
    }

    // Verifica se o coletor está disponível
    const { data: coletor, error: coletorError } = await supabase
      .from('coletores')
      .select('id')
      .eq('codigo', codigoColetor)
      .single();

    if (coletorError) {
      setErro('Coletor não encontrado.');
      return;
    }

    // Verifica se o coletor já está em uso
    const { data: registroAtivo } = await supabase
      .from('registros')
      .select('*')
      .eq('coletor_id', coletor.id)
      .eq('status', 'trabalhando')
      .single();

    if (registroAtivo) {
      setErro('Este coletor já está em uso.');
      return;
    }

    // Busca o usuário
    const { data: usuario } = await supabase
      .from('matriculas')
      .select('*')
      .eq('matricula', matricula)
      .single();

    // Insere o registro de entrada
    const { error } = await supabase
      .from('registros')
      .insert([
        {
          usuario_id: usuario.id,
          coletor_id: coletor.id,
          tipo: 'entrada',
          data: new Date().toISOString().split('T')[0],
          hora: new Date().toTimeString().split(' ')[0],
          status: 'trabalhando',
        },
      ]);

    if (error) {
      setErro('Erro ao registrar a entrada.');
    } else {
      setErro('');
      // Mostrar modal de confirmação
      setShowConfirm(true);
      // Limpa os campos
      setMatricula('');
      setNome('');
      setCodigoColetor('');
    }
  };

  const handleConfirmClose = () => {
    setShowConfirm(false);
    handleClose();
  };

  return (
    <>
      <Modal show={show} onHide={() => { setErro(''); handleClose(); }}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Entrada de Coletor</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {erro && <Alert variant="danger">{erro}</Alert>}
            <Form.Group className="mb-3" controlId="formMatricula">
              <Form.Label className="form-label">Matrícula</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite ou bipar a matrícula"
                value={matricula}
                onChange={handleMatriculaChange}
                required
              />
            </Form.Group>

            {nome && (
              <Form.Group className="mb-3" controlId="formNome">
                <Form.Label className="form-label">Nome</Form.Label>
                <Form.Control type="text" value={nome} readOnly />
              </Form.Group>
            )}

            <Form.Group className="mb-3" controlId="formColetor">
              <Form.Label className="form-label">Código do Coletor</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite ou bipar o código do coletor"
                value={codigoColetor}
                onChange={(e) => setCodigoColetor(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setErro(''); handleClose(); }}>
              Fechar
            </Button>
            <Button variant="primary" type="submit">
              Registrar Entrada
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal
        show={showConfirm}
        handleClose={handleConfirmClose}
        title="Entrada Registrada"
        body="A entrada do coletor foi registrada com sucesso!"
        onConfirm={handleConfirmClose}
        confirmText="OK"
      />
    </>
  );
}

export default EntradaModal;

// src/components/SaidaModal.js
import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { supabase } from '../supabaseClient';
import ConfirmModal from './ConfirmModal';
import '../styles/SaidaModal.css';

function SaidaModal({ show, handleClose }) {
  const [matricula, setMatricula] = useState('');
  const [nome, setNome] = useState('');
  const [codigoColetor, setCodigoColetor] = useState('');
  const [supervisorMatricula, setSupervisorMatricula] = useState('');
  const [supervisorNome, setSupervisorNome] = useState('');
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

  const handleSupervisorChange = async (e) => {
    setSupervisorMatricula(e.target.value);
    if (e.target.value.length >= 3) { // Por exemplo, após 3 caracteres
      const { data, error } = await supabase
        .from('matriculas')
        .select('nome')
        .eq('matricula', e.target.value)
        .eq('categoria', 'supervisor')
        .single();
      if (error) {
        setSupervisorNome('');
        setErro('Supervisor não encontrado.');
      } else {
        setSupervisorNome(data.nome);
        setErro('');
      }
    } else {
      setSupervisorNome('');
      setErro('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validações básicas
    if (!matricula || !codigoColetor || !supervisorMatricula || !nome || !supervisorNome) {
      setErro('Por favor, preencha todos os campos corretamente.');
      return;
    }

    // Busca o usuário
    const { data: usuario, error: usuarioError } = await supabase
      .from('matriculas')
      .select('*')
      .eq('matricula', matricula)
      .single();

    if (usuarioError) {
      setErro('Erro ao buscar usuário.');
      return;
    }

    // Busca o coletor
    const { data: coletor, error: coletorError } = await supabase
      .from('coletores')
      .select('id')
      .eq('codigo', codigoColetor)
      .single();

    if (coletorError) {
      setErro('Coletor não encontrado.');
      return;
    }

    // Verifica se o coletor está em uso pelo usuário
    const { data: registroAtivo, error: registroError } = await supabase
      .from('registros')
      .select('*')
      .eq('coletor_id', coletor.id)
      .eq('usuario_id', usuario.id)
      .eq('status', 'trabalhando')
      .single();

    if (registroError || !registroAtivo) {
      setErro('Nenhum registro ativo encontrado para este coletor e usuário.');
      return;
    }

    // Busca o supervisor
    const { data: supervisor, error: supervisorError } = await supabase
      .from('matriculas')
      .select('*')
      .eq('matricula', supervisorMatricula)
      .single();

    if (supervisorError) {
      setErro('Erro ao buscar supervisor.');
      return;
    }

    // Verifica se é supervisor
    if (supervisor.categoria !== 'supervisor') {
      setErro('A matrícula informada não pertence a um supervisor.');
      return;
    }

    // Atualiza o registro para saída
    const { error } = await supabase
      .from('registros')
      .update({
        tipo: 'saida',
        data: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().split(' ')[0],
        status: 'entregue',
        supervisor_id: supervisor.id,
      })
      .eq('id', registroAtivo.id);

    if (error) {
      setErro('Erro ao registrar a saída.');
    } else {
      setErro('');
      // Mostrar modal de confirmação
      setShowConfirm(true);
      // Limpa os campos
      setMatricula('');
      setNome('');
      setCodigoColetor('');
      setSupervisorMatricula('');
      setSupervisorNome('');
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
            <Modal.Title>Saída de Coletor</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {erro && <Alert variant="danger">{erro}</Alert>}
            <Form.Group className="mb-3" controlId="formMatricula">
              <Form.Label className="form-label">Matrícula do Usuário</Form.Label>
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

            <Form.Group className="mb-3" controlId="formSupervisor">
              <Form.Label className="form-label">Matrícula do Supervisor</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite ou bipar a matrícula do supervisor"
                value={supervisorMatricula}
                onChange={handleSupervisorChange}
                required
              />
            </Form.Group>

            {supervisorNome && (
              <Form.Group className="mb-3" controlId="formSupervisorNome">
                <Form.Label className="form-label">Nome do Supervisor</Form.Label>
                <Form.Control type="text" value={supervisorNome} readOnly />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setErro(''); handleClose(); }}>
              Fechar
            </Button>
            <Button variant="success" type="submit">
              Registrar Saída
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal
        show={showConfirm}
        handleClose={handleConfirmClose}
        title="Saída Registrada"
        body="A saída do coletor foi registrada com sucesso!"
        onConfirm={handleConfirmClose}
        confirmText="OK"
      />
    </>
  );
}

export default SaidaModal;

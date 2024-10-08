// src/components/ConfirmModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function ConfirmModal({ show, handleClose, title, body, onConfirm, confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          {cancelText}
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmModal;

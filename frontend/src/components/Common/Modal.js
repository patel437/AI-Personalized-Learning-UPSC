/**
 * Modal Component
 * Reusable modal dialog for forms and confirmations
 */

import React, { useEffect, useCallback } from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer = null
}) => {
  // Handle escape key press
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Size classes
  const sizeClasses = {
    small: 'modal-small',
    medium: 'modal-medium',
    large: 'modal-large',
    full: 'modal-full'
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal ${sizeClasses[size]}`}>
        {/* Modal Header */}
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          {showCloseButton && (
            <button className="modal-close" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        
        {/* Modal Body */}
        <div className="modal-body">
          {children}
        </div>
        
        {/* Modal Footer */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Confirmation Modal
export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const footer = (
    <>
      <button className="btn btn-secondary" onClick={onClose}>
        {cancelText}
      </button>
      <button className={`btn btn-${confirmVariant}`} onClick={handleConfirm}>
        {confirmText}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      footer={footer}
    >
      <p>{message}</p>
    </Modal>
  );
};

export default Modal;
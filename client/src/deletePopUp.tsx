import React, { useState } from 'react';
import './deletePopUp.css';

interface DeletePopUpProps {
  handleDelete: (e: any) => Promise<void>;
  onClose: () => void;  
}

const DeletePopUp: React.FC<DeletePopUpProps> = ({ onClose, handleDelete }) => {
  const [confirmationText, setConfirmationText] = useState('');

  return (
    <div className="PopUp-overlay">
      <div className="PopUp-content">
        <div className="PopUp-header">
          <h2>Delete all related data?</h2>
          <button className="close-button" onClick={onClose}>✖</button>
        </div>
        <div className="PopUp-body">
          <p>There is no going back!</p>
          <p>Type “yes” in the box below to confirm.</p>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder="Type yes to confirm"
            className="confirmation-input"
          />
        </div>
        <div className="PopUp-footer">
          <button className="delete-button" onClick={handleDelete} type="button">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePopUp;

import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const MedicationModal = ({ isOpen, onClose, onSubmit, medicationToEdit }) => {
  const [formData, setFormData] = useState({
    pillName: '',
    dosage: '',
    times: '',
    frequency: 'daily',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && medicationToEdit) {
      setFormData({
        pillName: medicationToEdit.pillName,
        dosage: medicationToEdit.dosage,
        times: medicationToEdit.times.join(', '),
        frequency: medicationToEdit.frequency,
      });
    } else {
      setFormData({ pillName: '', dosage: '', times: '', frequency: 'daily' });
    }
  }, [medicationToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const submissionData = {
      ...formData,
      times: formData.times.split(',').map(t => t.trim()).filter(Boolean),
    };
    await onSubmit(submissionData);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white', padding: '2rem', borderRadius: '8px',
        width: '90%', maxWidth: '500px'
      }} onClick={e => e.stopPropagation()}>
        <h2>{medicationToEdit ? 'Edit Medication' : 'Add a New Medication'}</h2>
        <form onSubmit={handleSubmit}>
          <Input label="Pill Name" name="pillName" value={formData.pillName} onChange={handleChange} />
          <Input label="Dosage" name="dosage" value={formData.dosage} onChange={handleChange} />
          <Input label="Times (comma-separated)" name="times" value={formData.times} onChange={handleChange} />
          <div style={{ marginBottom: '1rem' }}>
            <label>Frequency</label>
            <select name="frequency" value={formData.frequency} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="as_needed">As Needed</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
            <Button type="button" onClick={onClose} style={{ backgroundColor: '#ccc' }}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : (medicationToEdit ? 'Update Medication' : 'Add Medication')}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicationModal;

"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
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

    const inputStyle = {
        backgroundColor: 'white',
        color: '#1a202c',
        border: '1px solid #e2e8f0',
        borderRadius: '9999px',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        fontSize: '1rem'
    };

    const labelStyle = {
        display: 'block',
        fontWeight: 600,
        marginBottom: '0.25rem',
        color: '#1a202c',
        fontSize: '0.95rem'
    };

    return (
        <div
            // CORRECTED: Increased zIndex significantly to ensure modal is on top
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Inter', sans-serif",
                zIndex: 9999 // ⬅️ THIS IS THE CRITICAL CHANGE
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '1rem',
                    width: '90%',
                    maxWidth: '500px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                    position: 'relative'
                }}
                onClick={e => e.stopPropagation()}
            >
                <h2 style={{ color: "#9f7aea", fontSize: '1.75rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                    {medicationToEdit ? 'Edit Medication' : 'Add a New Medication'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <label style={labelStyle}>Pill Name</label>
                    <Input
                        name="pillName"
                        value={formData.pillName}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <label style={labelStyle}>Dosage</label>
                    <Input
                        name="dosage"
                        value={formData.dosage}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <label style={labelStyle}>Times (comma-separated)</label>
                    <Input
                        name="times"
                        value={formData.times}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Frequency</label>
                        <select
                            name="frequency"
                            value={formData.frequency}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                marginTop: '0.5rem',
                                borderRadius: '9999px',
                                border: '1px solid #e2e8f0',
                                outline: 'none',
                                fontSize: '1rem',
                                color: "#1a202c",
                                backgroundColor: 'white',
                            }}
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="as_needed">As Needed</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                        <Button
                            type="button"
                            onClick={onClose}
                            style={{
                                backgroundColor: "#e2e8f0",
                                color: "#1a202c",
                                padding: "0.75rem 1.5rem",
                                borderRadius: "9999px",
                                fontWeight: "500"
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                backgroundColor: "#9f7aea",
                                color: "white",
                                padding: "0.75rem 1.5rem",
                                borderRadius: "9999px",
                                fontWeight: "500"
                            }}
                        >
                            {isLoading ? 'Saving...' : (medicationToEdit ? 'Update Medication' : 'Add Medication')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MedicationModal;
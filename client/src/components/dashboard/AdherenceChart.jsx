// src/components/dashboard/AdherenceChart.jsx

import React, { useEffect, useState, useRef } from 'react';
import { getDashboardStats } from '../../api'; 
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2'; 

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const AdherenceChart = ({ chartKey }) => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Call the API function mapped to GET /api/v1/dashboard/stats
                const response = await getDashboardStats();
                setStats(response.data.data);
            } catch (err) {
                console.error("Error fetching dashboard stats:", err);
                setError("Could not load adherence statistics.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
        
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [chartKey]); 
    
    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Analyzing Adherence Data...</div>;
    }

    if (error) {
        return <p style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>;
    }
    
    if (!stats || stats.totalDoses === 0) {
        return <p style={{ textAlign: 'center', padding: '20px', border: '1px dashed #ccc' }}>No dose history found yet. Log a dose to see your adherence stats!</p>;
    }

    // Prepare data for the Doughnut chart
    const data = {
        labels: ['Taken Doses', 'Missed Doses'],
        datasets: [
            {
                label: 'Doses',
                data: [stats.takenDoses, stats.missedDoses],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)', // Green for Taken
                    'rgba(220, 53, 69, 0.8)', // Red for Missed
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(220, 53, 69, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };
    
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: `Overall Adherence: ${stats.adherenceRate}%`,
                font: { size: 18 }
            },
        },
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '15px' }}>Adherence Overview</h2>
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <Doughnut data={data} options={options} ref={chartRef} />
            </div>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <p>Total Doses Logged: <strong>{stats.totalDoses}</strong></p>
                <p>Adherence Rate: <strong style={{ color: stats.adherenceRate >= 80 ? 'green' : 'red' }}>{stats.adherenceRate}%</strong></p>
            </div>
        </div>
    );
};

export default AdherenceChart;
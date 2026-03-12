import React, { useState, useEffect } from 'react';

const PendingCrate = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Replace with your API endpoint
            const response = await fetch('/api/pending-crate');
            if (!response.ok) throw new Error('Failed to fetch data');
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pending-crate">
            <h1>Pending Crates</h1>
        </div>
    );
};

export default PendingCrate;
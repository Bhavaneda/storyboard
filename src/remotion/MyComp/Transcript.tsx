import React, { useState } from 'react';

const Transcript = ({ sceneTexts }: { sceneTexts: string[] }) => {
  const [transcript, setTranscript] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTranscript = async () => {
    if (sceneTexts.length === 0) {
      setError('No scene texts available for processing.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/refine-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sceneTexts }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to fetch transcript');
      }

      const data = await response.json();
      setTranscript(data.transcript);
    } catch (error: any) {
      setError(error.message || 'An error occurred while generating the transcript');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <button
        onClick={fetchTranscript}
        disabled={loading || sceneTexts.length === 0}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4285f4',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Loading...' : 'Get Transcript'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

      {transcript && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            borderRadius: '8px',
            maxHeight: '300px',
            overflowY: 'auto',
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            lineHeight: '1.5',
          }}
        >
          <h3>Transcript:</h3>
          <pre>{transcript}</pre>
        </div>
      )}
    </div>
  );
};

export default Transcript;

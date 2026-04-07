import React, { useState } from 'react';
import './App.css'; // You can style this later

function App() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // Your Master Knowledge Base & System Instructions
  const systemInstructions = `
    Role: You are the "World of Wonder AI" Lead Designer. 
    Core Rules: Always 9:16 aspect ratio, seamless unibody RV construction, integrated cockpit, 2-to-3 stories, luxury interior.
    Always change the US Geo-Location based on the scenery.
    
    Output Format:
    1. Concept Name
    2. Image Prompt (Highly detailed, emphasizing seamless automotive flow)
    3. Negative Prompt (disconnected cockpit, modular sections, house on a truck, etc.)
    4. Motion Prompt for Image-to-Video (Focus on camera movement, lone vehicle on empty road)
    5. #ytd
    Eye-catching Title: 
    Hook: 
    Description: 
    CTA: 
    Target Audience: U.S.
    SEO Post specific hashtags:
    Niche specific hashtags:
    Broad hashtags: #Viral #viralshorts #shorts #foryou #shortsfeed
    Other broad hashtags:
    SEO Post specific tags:
    Niche specific tags:
    Broad tags: Viral, viral shorts, shorts, for you, shorts feed
    Other broad tags:
    Geo Location: (Real US Location)
  `;

  const generateConcept = async (customPrompt) => {
    setLoading(true);
    setResult('');
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    // Using Gemini 1.5 Flash or Pro via REST API
    const url = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=\${apiKey}\`;

    const fullPrompt = \`\${systemInstructions}\\n\\nUser Request: \${customPrompt}\`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        setResult(data.candidates[0].content.parts[0].text);
      } else {
        setResult("Error generating content. Please try again.");
      }
    } catch (error) {
      console.error("API Error:", error);
      setResult("Failed to connect to Gemini API. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (prompt) generateConcept(prompt);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>🚐 WOW AI Builder Studio</h1>
      <p style={{ textAlign: 'center', color: '#555' }}>
        Your personal Seamless Luxury RV Concept Generator
      </p>

      {/* Quick Action Buttons / Starters */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => generateConcept("Create a modern Coastal Penthouse 2-Story RV")} style={btnStyle}>🌊 Coastal Vibe</button>
        <button onClick={() => generateConcept("Design a cozy Forest Cabin 2-Story RV with a fireplace")} style={btnStyle}>🌲 Forest Cabin</button>
        <button onClick={() => generateConcept("Generate a Golden Desert 3-Story RV concept")} style={btnStyle}>🏜️ Desert Oasis</button>
        <button onClick={() => generateConcept("Create an epic Snowy Mountain Blizzard 3-Story RV")} style={btnStyle}>❄️ Winter Blizzard</button>
      </div>

      {/* Manual Prompt Input */}
      <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)} 
          placeholder="Or type your custom RV idea here..." 
          style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" disabled={loading} style={{...btnStyle, background: '#007bff', color: 'white'}}>
          {loading ? 'Generating...' : 'Generate 🚀'}
        </button>
      </form>

      {/* Output Display */}
      {result && (
        <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '10px', whiteSpace: 'pre-wrap' }}>
          {result}
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  padding: '10px 15px',
  cursor: 'pointer',
  borderRadius: '5px',
  border: '1px solid #ccc',
  background: '#fff',
  fontWeight: 'bold'
};

export default App;
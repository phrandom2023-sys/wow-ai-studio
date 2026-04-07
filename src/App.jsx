import React, { useState } from 'react';
import './App.css';

function App() {
  // States for all inputs and dropdowns
  const [prompt, setPrompt] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [scenery, setScenery] = useState('');
  const [level, setLevel] = useState('');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [timeOfDay, setTimeOfDay] = useState('');

  // App States
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedImagePrompt, setCopiedImagePrompt] = useState(false);
  const [copiedVideoPrompt, setCopiedVideoPrompt] = useState(false);

  // Parse the generated result to extract specific sections
  const extractSection = (text, startMarker, endMarker) => {
    if (!text) return "";
    const startIndex = text.indexOf(startMarker);
    if (startIndex === -1) return "";
    const actualStartIndex = startIndex + startMarker.length;
    const endIndex = text.indexOf(endMarker, actualStartIndex);
    if (endIndex === -1) {
      return text.substring(actualStartIndex).trim();
    }
    return text.substring(actualStartIndex, endIndex).trim();
  };

  const copyToClipboard = async (text, setCopiedState) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const systemInstructions = `
    Role: You are the "World of Wonder AI" Lead Designer. 
    Core Rules: Generate seamless unibody RV construction concepts based on the user's specific parameter combinations.
    
    CRITICAL OUTPUT FORMAT:
    You must format your response EXACTLY like this (do not add extra conversational text):
    
    [Concept Name]

    **Image Prompt:**
    (Hyper-detailed architectural prompt here. End with: --ar [Insert chosen Aspect Ratio])

    **Negative Prompt:**
    (disconnected cockpit, modular sections, house on a truck, bad proportions, distorted lines)

    **Video Prompt:**
    (Camera motion prompt describing cinematic movement around or inside the vehicle)

    **Negative Video Prompt:**
    (other vehicles, cars, trucks, traffic, pedestrians, crowded road, flickering, morphing objects)
    
    **#ytd:**
    Title: 
    Hook:
    Description:
    SEO Tags:
  `;

  const generateConcept = async (isSurprise = false) => {
    setLoading(true);
    setResult('');
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      setResult("Error: API Key is missing. Please check your Vercel Environment Variables or .env file.");
      setLoading(false);
      return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    let userIntent = "";
    if (isSurprise || prompt.toLowerCase() === "surprise me") {
      userIntent = "Surprise me with a completely random, mind-blowing luxury RV concept. Choose the vehicle type, scenery, and levels yourself. Aspect Ratio: " + aspectRatio;
    } else {
      userIntent = `Create a luxury RV with the following specs: 
      Vehicle Type: ${vehicleType || 'AI Choice (Luxury standard)'}
      Scenery: ${scenery || 'AI Choice (Scenic)'}
      Level/Stories: ${level || 'AI Choice'}
      Time of Day: ${timeOfDay || 'AI Choice'}
      Aspect Ratio: ${aspectRatio}
      Additional Custom Ideas: ${prompt || 'Make it look highly realistic and aerodynamic.'}`;
    }

    const fullPrompt = `${systemInstructions}\n\nUser Request: ${userIntent}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        setResult(data.candidates[0].content.parts[0].text);
      } else if (data.error) {
         setResult(\`API Error: \${data.error.message}\`);
      } else {
        setResult("Error generating content. Please try again.");
      }
    } catch (error) {
      console.error("API Error:", error);
      setResult("Failed to connect to Gemini API.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    generateConcept();
  };

  const selectStyle = { padding: '8px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', cursor: 'pointer' };
  const btnStyle = { padding: '10px 15px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc', background: '#fff', fontWeight: 'bold' };
  const copyBtnStyle = { ...btnStyle, marginLeft: '10px', fontSize: '12px', padding: '5px 10px', background: '#e0e0e0', border: 'none' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Main Content Area */}
      <div style={{ flex: 1 }}>
        <h1 style={{ textAlign: 'center' }}>🚐 WOW AI Builder Studio</h1>
        <p style={{ textAlign: 'center', color: '#555' }}>Select your parameters or just hit Surprise Me!</p>

        {/* DROPDOWN OPTIONS CONTAINER */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '15px', flexWrap: 'wrap' }}>
          
          <select style={selectStyle} value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
            <option value="">🚙 Vehicle Type (Any)</option>
            <option value="Limousine RV">Limousine RV (Long)</option>
            <option value="Mega-Coach RV">Mega-Coach RV (Huge)</option>
            <option value="Compact Sprinter Van">Compact Sprinter Van (Small)</option>
            <option value="Expedition Truck">Expedition Truck (Rugged)</option>
            <option value="Futuristic Hover-Camper">Futuristic Cyber-Camper</option>
          </select>

          <select style={selectStyle} value={scenery} onChange={(e) => setScenery(e.target.value)}>
            <option value="">🌲 Scenery (Any)</option>
            <option value="Coastal Highway">Coastal Highway</option>
            <option value="Deep Pine Forest">Deep Pine Forest</option>
            <option value="Golden Desert Oasis">Golden Desert Oasis</option>
            <option value="Snowy Mountain Peak">Snowy Mountain Peak</option>
            <option value="Rocky Canyon">Rocky Canyon</option>
            <option value="Neon Cyberpunk City">Neon Cyberpunk City</option>
          </select>

          <select style={selectStyle} value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">🏢 Level (Any)</option>
            <option value="1 Story with Rooftop Deck">1 Story + Rooftop</option>
            <option value="2 Story">2 Story</option>
            <option value="3 Story Mega-structure">3 Story</option>
            <option value="Multi-level with Slide-outs">Multi-level (Expandable)</option>
          </select>

          <select style={selectStyle} value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)}>
            <option value="">🌅 Time (Any)</option>
            <option value="Golden Hour Sunset">Golden Hour Sunset</option>
            <option value="Foggy Morning">Foggy Morning</option>
            <option value="Midnight with Stars">Midnight with Stars</option>
          </select>

          <select style={selectStyle} value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
            <option value="9:16">📱 9:16 (Shorts/TikTok)</option>
            <option value="16:9">🖥️ 16:9 (Cinematic YT)</option>
            <option value="3:4">📸 3:4 (Instagram)</option>
            <option value="1:1">⬛ 1:1 (Square)</option>
          </select>
        </div>

        {/* INPUT FORM */}
        <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            placeholder='E.g. "Add a glass swimming pool" or type "Surprise me"' 
            style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button type="submit" disabled={loading} style={{...btnStyle, background: '#007bff', color: 'white', border: 'none'}}>
            {loading ? 'Building...' : 'Generate 🚀'}
          </button>
          <button type="button" onClick={() => generateConcept(true)} disabled={loading} style={{...btnStyle, background: '#ff4757', color: 'white', border: 'none'}}>
            Surprise Me 🎲
          </button>
        </form>

        {/* OUTPUT DISPLAY */}
        {result && (
          <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '10px', lineHeight: '1.6', textAlign: 'left', borderLeft: '5px solid #007bff' }}>
            <h2 style={{marginTop: '0'}}>**[ {extractSection(result, "[", "]")} ]**</h2>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <div>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <span style={{fontWeight: 'bold'}}>📋 Image Prompt:</span>
                  <button style={copyBtnStyle} onClick={() => copyToClipboard(extractSection(result, "**Image Prompt:**", "\n**"), setCopiedImagePrompt)}>
                     {copiedImagePrompt ? 'Copied!' : '📋 Copy'}
                  </button>
                </div>
                <div style={{ background: '#fff', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px', whiteSpace: 'pre-wrap', marginTop: '5px' }}>
                  {extractSection(result, "**Image Prompt:**", "\n**")}
                </div>
              </div>

              <div>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <span style={{fontWeight: 'bold'}}>🎬 Video Prompt:</span>
                  <button style={copyBtnStyle} onClick={() => copyToClipboard(extractSection(result, "**Video Prompt:**", "\n**"), setCopiedVideoPrompt)}>
                     {copiedVideoPrompt ? 'Copied!' : '🎬 Copy'}
                  </button>
                </div>
                <div style={{ background: '#fff', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px', whiteSpace: 'pre-wrap', marginTop: '5px' }}>
                  {extractSection(result, "**Video Prompt:**", "\n**")}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #ddd', paddingTop: '15px', marginTop: '10px', fontSize: '14px', whiteSpace: 'pre-wrap'}}>
                {extractSection(result, "**Negative Prompt:**", "\n**\n**\n**\n**\n")}
                {"\n**Negative Prompt:** " + extractSection(result, "**Negative Prompt:**", "\n**")}
                {"\n**Negative Video Prompt:** " + extractSection(result, "**Negative Video Prompt:**", "\n**")}
                {"\n**#ytd:** " + extractSection(result, "**#ytd:**", "")}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER SECTION */}
      <footer style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eaeaea', color: '#888', fontSize: '14px' }}>
        <p style={{ margin: '5px 0' }}>Version 2.1</p>
        <p style={{ margin: '5px 0' }}>Powered By <span style={{ color: '#007bff', fontWeight: 'bold' }}>Gemini ✨</span></p>
        <p style={{ margin: '5px
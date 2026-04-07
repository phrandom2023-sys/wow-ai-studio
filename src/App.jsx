import React, { useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [scenery, setScenery] = useState('');
  const [level, setLevel] = useState('');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [timeOfDay, setTimeOfDay] = useState('');

  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Copy States
  const [copiedImagePrompt, setCopiedImagePrompt] = useState(false);
  const [copiedNegImagePrompt, setCopiedNegImagePrompt] = useState(false);
  const [copiedVideoPrompt, setCopiedVideoPrompt] = useState(false);
  const [copiedNegVideoPrompt, setCopiedNegVideoPrompt] = useState(false);
  const [copiedYtd, setCopiedYtd] = useState(false);

  // BULLETPROOF PARSER
  const extractSection = (text, startMarker, endMarker) => {
    if (!text) return "";
    const lowerText = text.toLowerCase();
    const lowerStart = startMarker.toLowerCase();
    const lowerEnd = endMarker.toLowerCase();

    const startIndex = lowerText.indexOf(lowerStart);
    if (startIndex === -1) return "";
    
    const actualStartIndex = startIndex + startMarker.length;
    
    if (endMarker === "") {
        return text.substring(actualStartIndex).replace(/^[:\s]+/, '').trim();
    }
    
    const endIndex = lowerText.indexOf(lowerEnd, actualStartIndex);
    if (endIndex === -1) {
      return text.substring(actualStartIndex).replace(/^[:\s]+/, '').trim();
    }
    return text.substring(actualStartIndex, endIndex).replace(/^[:\s]+/, '').trim();
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

  // UPDATED SYSTEM INSTRUCTIONS WITH COMPLETE YT DETAILS
  const systemInstructions = `
    Role: You are the "World of Wonder AI" Lead Designer. 
    Core Rules: Generate seamless unibody RV construction concepts.
    
    CRITICAL OUTPUT FORMAT:
    Do NOT wrap your response in markdown code blocks. Return plain text formatted exactly like this:
    
    Concept Name: [Insert Concept Name Here]

    **Image Prompt:**
    (Hyper-detailed architectural prompt here. End with: --ar [Insert chosen Aspect Ratio])

    **Negative Prompt:**
    (disconnected cockpit, modular sections, house on a truck, bad proportions, distorted lines)

    **Video Prompt:**
    (Camera motion prompt describing cinematic movement around or inside the vehicle)

    **Negative Video Prompt:**
    (other vehicles, cars, trucks, traffic, pedestrians, crowded road, flickering, morphing objects)
    
    **#ytd:**
    Eye-catching Title: 
    Hook: 
    Description: 
    CTA: 

    Target Audience: U.S.
    
    SEO Hashtags:
    Post specific hashtags: 
    Niche specific hashtags: 
    Broad hashtags: #Viral #viralshorts #shorts #foryou #shortsfeed
    Other broad hashtags: 

    SEO Tags:
    Post specific tags: 
    Niche specific tags: 
    Broad tags: Viral, viral shorts, shorts, for you, shorts feed
    Other broad tags: 
  `;

  const generateConcept = async (isSurprise = false) => {
    setLoading(true);
    setResult('');
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      setResult("API Error: API Key is missing. Please check your Vercel Environment Variables or .env file.");
      setLoading(false);
      return;
    }

    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;
    
    let userIntent = "";
    if (isSurprise || prompt.toLowerCase() === "surprise me") {
      userIntent = "Surprise me with a completely random, mind-blowing luxury RV concept. Choose the vehicle type, scenery, and levels yourself. Aspect Ratio: " + aspectRatio;
    } else {
      userIntent = "Create a luxury RV with the following specs: \n" +
      "Vehicle Type: " + (vehicleType || 'AI Choice') + "\n" +
      "Scenery: " + (scenery || 'AI Choice') + "\n" +
      "Level/Stories: " + (level || 'AI Choice') + "\n" +
      "Time of Day: " + (timeOfDay || 'AI Choice') + "\n" +
      "Aspect Ratio: " + aspectRatio + "\n" +
      "Additional Custom Ideas: " + (prompt || 'Make it look highly realistic and aerodynamic.');
    }

    const fullPrompt = systemInstructions + "\n\nUser Request: " + userIntent;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content) {
        setResult(data.candidates[0].content.parts[0].text);
      } else if (data.error) {
         setResult("API Error: " + data.error.message);
      } else {
        setResult("API Error: Unknown error occurred.");
      }
    } catch (error) {
      console.error("API Error:", error);
      setResult("API Error: Failed to connect to Gemini API.");
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
  const copyBtnStyle = { marginLeft: '10px', fontSize: '12px', padding: '5px 10px', background: '#e0e0e0', border: 'none', color: '#333', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' };
  const boxStyle = { background: '#fff', padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px', whiteSpace: 'pre-wrap', marginTop: '8px' };

  const isFormattedCorrectly = result.toLowerCase().includes("**image prompt:**");
  const isError = result.startsWith("API Error:");

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ flex: 1 }}>
        <h1 style={{ textAlign: 'center' }}>🚐 WOW AI Builder Studio</h1>
        <p style={{ textAlign: 'center', color: '#555' }}>Select your parameters or just hit Surprise Me!</p>

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
            <option value="Neon Cyberpunk City">Neon Cyberpunk City</option>
          </select>
          <select style={selectStyle} value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">🏢 Level (Any)</option>
            <option value="1 Story with Rooftop Deck">1 Story + Rooftop</option>
            <option value="2 Story">2 Story</option>
            <option value="3 Story Mega-structure">3 Story</option>
          </select>
          <select style={selectStyle} value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)}>
            <option value="">🌅 Time (Any)</option>
            <option value="Golden Hour Sunset">Golden Hour Sunset</option>
            <option value="Foggy Morning">Foggy Morning</option>
            <option value="Midnight with Stars">Midnight with Stars</option>
          </select>
          <select style={selectStyle} value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
            <option value="9:16">📱 9:16 (Shorts)</option>
            <option value="16:9">🖥️ 16:9 (YT)</option>
            <option value="3:4">📸 3:4 (IG)</option>
          </select>
        </div>

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

        {result && (
          <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '10px', lineHeight: '1.6', textAlign: 'left', borderLeft: '5px solid #007bff' }}>
            
            {isError || !isFormattedCorrectly ? (
              <div>
                <h3 style={{ color: isError ? '#d93025' : '#e67e22', marginTop: 0 }}>
                  {isError ? "⚠️ Error Encountered" : "⚠️ Raw Output"}
                </h3>
                <div style={boxStyle}>{result}</div>
              </div>
            ) : (
              <div>
                <h2 style={{marginTop: '0'}}>**[ {extractSection(result, "Concept Name:", "**Image Prompt:**") || extractSection(result, "[", "]")} ]**</h2>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                  
                  {/* MAIN IMAGE PROMPT */}
                  <div>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                      <span style={{fontWeight: 'bold', color: '#2c3e50'}}>📋 Main Image Prompt:</span>
                      <button style={copyBtnStyle} onClick={() => copyToClipboard(extractSection(result, "**Image Prompt:**", "**Negative Prompt:**"), setCopiedImagePrompt)}>
                         {copiedImagePrompt ? 'Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    <div style={boxStyle}>{extractSection(result, "**Image Prompt:**", "**Negative Prompt:**")}</div>
                  </div>

                  {/* NEGATIVE IMAGE PROMPT */}
                  <div>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                      <span style={{fontWeight: 'bold', color: '#c0392b'}}>🚫 Negative Image Prompt:</span>
                      <button style={copyBtnStyle} onClick={() => copyToClipboard(extractSection(result, "**Negative Prompt:**", "**Video Prompt:**"), setCopiedNegImagePrompt)}>
                         {copiedNegImagePrompt ? 'Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    <div style={{...boxStyle, borderLeft: '3px solid #c0392b'}}>{extractSection(result, "**Negative Prompt:**", "**Video Prompt:**")}</div>
                  </div>

                  {/* MAIN VIDEO PROMPT */}
                  <div>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                      <span style={{fontWeight: 'bold', color: '#2980b9'}}>🎬 Main Video Prompt:</span>
                      <button style={copyBtnStyle} onClick={() => copyToClipboard(extractSection(result, "**Video Prompt:**", "**Negative Video Prompt:**"), setCopiedVideoPrompt)}>
                         {copiedVideoPrompt ? 'Copied!' : '🎬 Copy'}
                      </button>
                    </div>
                    <div style={boxStyle}>{extractSection(result, "**Video Prompt:**", "**Negative Video Prompt:**")}</div>
                  </div>

                  {/* NEGATIVE VIDEO PROMPT */}
                  <div>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                      <span style={{fontWeight: 'bold', color: '#c0392b'}}>🚫 Negative Video Prompt:</span>
                      <button style={copyBtnStyle} onClick={() => copyToClipboard(extractSection(result, "**Negative Video Prompt:**", "**#ytd:**"), setCopiedNegVideoPrompt)}>
                         {copiedNegVideoPrompt ? 'Copied!' : '🎬 Copy'}
                      </button>
                    </div>
                    <div style={{...boxStyle, borderLeft: '3px solid #c0392b'}}>{extractSection(result, "**Negative Video Prompt:**", "**#ytd:**")}</div>
                  </div>

                  {/* YOUTUBE DETAILS */}
                  <div>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                      <span style={{fontWeight: 'bold', color: '#8e44ad'}}>📺 YouTube SEO Details:</span>
                      <button style={copyBtnStyle} onClick={() => copyToClipboard(extractSection(result, "**#ytd:**", ""), setCopiedYtd)}>
                         {copiedYtd ? 'Copied!' : '📑 Copy All YT Text'}
                      </button>
                    </div>
                    <div style={{...boxStyle, background: '#fdfbfd', borderLeft: '3px solid #8e44ad'}}>{extractSection(result, "**#ytd:**", "")}</div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eaeaea', color: '#888', fontSize: '14px' }}>
        <p style={{ margin: '5px 0' }}>Powered By <span style={{ color: '#007bff', fontWeight: 'bold' }}>Gemini ✨</span></p>
        <p style={{ margin: '5px 0', fontSize: '12px' }}>Created and Owned by <strong>TART</strong></p>
      </footer>

    </div>
  );
}

export default App;
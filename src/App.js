import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";

const startDate = new Date("2024-06-17");
const names = ["Bosca", "Mraco"];

function getOwner(date) {
  const daysSinceStart = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
  return names[daysSinceStart % 2 === 0 ? 0 : 1];
}

export default function App() {
  const today = new Date();
  const [daysToShow] = useState(14);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [activeView, setActiveView] = useState("mraco");
  const [slideDirection, setSlideDirection] = useState("right");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Nuovo stato per tema dark
  const [breadStatus, setBreadStatus] = useState("caricamento..."); // Stato per pane bianco

  const currentOwner = getOwner(today);

  // All'avvio, imposta la vista sulla camera del proprietario del giorno
  useEffect(() => {
    const ownerView = currentOwner === "Mraco" ? "mraco" : "bosca";
    setActiveView(ownerView);
  }, [currentOwner]);

  const calendarDays = Array.from({ length: daysToShow }, (_, i) => {
    const day = addDays(today, i - 7);
    return {
      date: day,
      owner: getOwner(day),
      isToday: format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd"),
    };
  });

  const toggleTorch = () => {
    setIsTorchOn(!isTorchOn);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getDayName = (date) => {
    const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    return days[date.getDay()];
  };

  const handleViewChange = (newView) => {
    if (newView === activeView) return;
    
    // Controlla se il tab è disabilitato
    if (isTabDisabled(newView)) return;
    
    const viewOrder = ["mraco", "bosca", "pane"];
    const currentIndex = viewOrder.indexOf(activeView);
    const newIndex = viewOrder.indexOf(newView);
    
    setSlideDirection(newIndex > currentIndex ? "right" : "left");
    setActiveView(newView);
    
    // Se stiamo andando alla tab pane, carica i dati
    if (newView === "pane") {
      fetchBreadStatus();
    }
  };

  const isTabDisabled = (view) => {
    // Solo il tab del proprietario attuale è abilitato
    if (view === "mraco" && currentOwner === "Mraco") return false;
    if (view === "bosca" && currentOwner === "Bosca") return false;
    
    // La tab pane è sempre abilitata
    if (view === "pane") return false;
    
    // Tutti gli altri tab sono disabilitati
    return true;
  };

  const getImageForView = () => {
    switch (activeView) {
      case "mraco":
        return {
          src: "/images/mensola-mraco.png",
          alt: "Torcia sulla mensola di Mraco",
          className: "w-80 h-[500px] object-cover rounded-lg"
        };
      case "bosca":
        return {
          src: "/images/mensola-bosca.png",
          alt: "Torcia sulla mensola di Bosca",
          className: "w-80 h-[500px] object-cover rounded-lg"
        };
      default:
        return null;
    }
  };

  const openTorchModal = () => {
    setIsModalOpen(true);
  };

  const closeTorchModal = () => {
    setIsModalOpen(false);
  };

  // Funzione per leggere stato pane bianco da Google Sheets
  const fetchBreadStatus = async () => {
    setBreadStatus("caricamento...");
    try {
      const SHEET_ID = '1SKFaDCcdefFF0dNEJrCyZUfzT7-22FkNDvD5F6JjbyY';
      const API_KEY = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY;
      const RANGE = 'A1'; // Cella che contiene SI/NO
      
      if (!API_KEY) {
        throw new Error('API Key non configurata');
      }
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.values && data.values[0] && data.values[0][0]) {
        const value = data.values[0][0].toString().toUpperCase().trim();
        // Accetta SI, SÌ, YES, Y, 1 come positivi
        if (['SI', 'SÌ', 'YES', 'Y', '1'].includes(value)) {
          setBreadStatus('SI');
        } else {
          setBreadStatus('NO');
        }
      } else {
        setBreadStatus('NO'); // Cella vuota = no pane
      }
    } catch (error) {
      console.error('Errore nel leggere stato pane:', error);
      setBreadStatus('errore');
    }
  };

  const imageData = getImageForView();

  return (
    <div className={`p-6 max-w-4xl mx-auto font-sans min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`rounded-lg shadow-lg p-6 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      }`}>
        {/* Header con toggle tema e pulsante pane */}
        <div className="flex justify-between items-center mb-6">
          {/* Pulsante Verifica Pane Bianco a sinistra */}
          <button
            onClick={() => handleViewChange("pane")}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
              activeView === "pane"
              ? isDarkMode 
                ? "bg-orange-600 text-white shadow-lg" 
                : "bg-orange-500 text-white shadow-lg"
              : isDarkMode
              ? "bg-gray-700 text-orange-400 hover:bg-gray-600 border border-orange-400"
              : "bg-white text-orange-600 hover:bg-orange-50 border border-orange-300 shadow-sm"
            }`}
            title="Verifica Pane Bianco"
          >
            🍞
          </button>
          
          <h1 className="text-3xl font-bold text-center flex-1">
            🔦 Torcia App v2.1
          </h1>
          
          {/* Toggle tema a destra */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
              isDarkMode 
                ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900' 
                : 'bg-gray-800 hover:bg-gray-700 text-white'
            }`}
            title={isDarkMode ? 'Tema Chiaro' : 'Tema Scuro'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
        
        {/* Sezione proprietario */}
        <div className={`border-l-4 p-4 mb-6 rounded transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-yellow-900 border-yellow-600 text-yellow-300' 
            : 'bg-yellow-100 border-yellow-500 text-yellow-700'
        }`}>
          <p className="text-lg">
            Oggi la torcia è di <strong className="text-xl">{currentOwner}</strong>!
          </p>
        </div>

        {/* Sezione torcia con tab */}
        <div className="mb-8">
          <h2 className={`text-2xl font-semibold mb-4 text-center transition-colors duration-300 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Dove si trova la Torcia
          </h2>
          
          {/* Tab Navigation - Solo le camere */}
          <div className="flex justify-center mb-6">
            <div className={`p-1 rounded-lg flex transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <button
                onClick={() => handleViewChange("mraco")}
                disabled={isTabDisabled("mraco")}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-200 relative ${
                  isTabDisabled("mraco")
                    ? "text-gray-400 cursor-not-allowed opacity-50"
                    : activeView === "mraco"
                    ? isDarkMode 
                      ? "bg-gray-600 text-green-400 shadow-sm" 
                      : "bg-white text-green-600 shadow-sm"
                    : isDarkMode
                    ? "text-gray-300 hover:text-gray-100"
                    : "text-gray-600 hover:text-gray-800"
                } ${currentOwner === "Mraco" && !isTabDisabled("mraco") ? "ring-2 ring-green-300" : ""}`}
              >
                🏠 Camera Mraco
                {currentOwner === "Mraco" && !isTabDisabled("mraco") && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full">
                    OGGI
                  </span>
                )}
                {isTabDisabled("mraco") && (
                  <span className="absolute -top-1 -right-1 bg-gray-400 text-white text-xs px-1 py-0.5 rounded-full">
                    🚫
                  </span>
                )}              
                </button>
                
                <button
                  onClick={() => handleViewChange("bosca")}
                  disabled={isTabDisabled("bosca")}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 relative ${
                    isTabDisabled("bosca")
                      ? "text-gray-400 cursor-not-allowed opacity-50"
                      : activeView === "bosca"
                      ? isDarkMode 
                        ? "bg-gray-600 text-purple-400 shadow-sm" 
                        : "bg-white text-purple-600 shadow-sm"
                      : isDarkMode
                      ? "text-gray-300 hover:text-gray-100"
                      : "text-gray-600 hover:text-gray-800"
                  } ${currentOwner === "Bosca" && !isTabDisabled("bosca") ? "ring-2 ring-purple-300" : ""}`}
                >
                  🏠 Camera Bosca
                  {currentOwner === "Bosca" && !isTabDisabled("bosca") && (
                    <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs px-1 py-0.5 rounded-full">
                      OGGI
                    </span>
                  )}
                  {isTabDisabled("bosca") && (
                    <span className="absolute -top-1 -right-1 bg-gray-400 text-white text-xs px-1 py-0.5 rounded-full">
                      🚫
                    </span>
                  )}
                </button>
              </div>
            </div>

          {/* Messaggio informativo quando ci sono tab disabilitati - Solo per tab torce */}
          {activeView !== "pane" && (
            <div className="text-center mb-4">
              <p className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                🔒 La torcia si trova solo dove è il proprietario del giorno
              </p>
            </div>
          )}

          {/* Image Container with slide animation - Solo per torce */}
          {activeView !== "pane" && (
            <div className="relative overflow-hidden">
              <div 
                className={`transform transition-transform duration-300 ease-in-out ${
                  slideDirection === "right" ? "translate-x-0" : "translate-x-0"
                }`}
              >
                <div className={`p-8 rounded-lg shadow-inner text-center transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  {imageData && (
                    <img 
                      src={imageData.src}
                      alt={imageData.alt}
                      className={`${imageData.className} mx-auto mb-6 transition-all duration-300 shadow-lg`}
                    />
                  )}
                  
                  {/* Info e pulsante per usare la torcia */}
                  {activeView === "mraco" && (
                    <div>
                      <p className="text-lg text-green-700 font-semibold mb-2">
                        📍 Torcia nella camera di Mraco
                      </p>
                      <p className="text-xs text-green-600 mb-4 font-medium">
                        ✅ Disponibile oggi
                      </p>
                      <button
                        onClick={openTorchModal}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        🔦 Usa la Torcia
                      </button>
                    </div>
                  )}
                  
                  {activeView === "bosca" && (
                    <div>
                      <p className="text-lg text-purple-700 font-semibold mb-2">
                        📍 Torcia nella camera di Bosca
                      </p>
                      <p className="text-xs text-purple-600 mb-4 font-medium">
                        ✅ Disponibile oggi
                      </p>
                      <button
                        onClick={openTorchModal}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        🔦 Usa la Torcia
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Sezione dedicata Pane Bianco - Più spazio e centrale */}
          {activeView === "pane" && (
            <div className={`mt-8 p-8 rounded-lg shadow-inner transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <div className="max-w-2xl mx-auto text-center">
                <h3 className={`text-3xl font-bold mb-8 transition-colors duration-300 ${
                  isDarkMode ? 'text-orange-400' : 'text-orange-700'
                }`}>
                  🍞 Stato Pane Bianco
                </h3>
                
                <div className={`text-center p-8 rounded-xl mb-8 transition-all duration-300 ${
                  breadStatus === "SI" 
                    ? isDarkMode 
                      ? 'bg-green-900 border-2 border-green-600 shadow-lg'
                      : 'bg-green-100 border-2 border-green-300 shadow-lg'
                    : breadStatus === "NO"
                    ? isDarkMode
                      ? 'bg-red-900 border-2 border-red-600 shadow-lg'
                      : 'bg-red-100 border-2 border-red-300 shadow-lg'
                    : isDarkMode
                    ? 'bg-gray-600 border-2 border-gray-500 shadow-lg'
                    : 'bg-gray-200 border-2 border-gray-300 shadow-lg'
                }`}>
                  {breadStatus === "caricamento..." && (
                    <div className={`text-xl font-semibold animate-pulse ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      🔄 Caricamento...
                    </div>
                  )}
                  {breadStatus === "SI" && (
                    <div className={`text-3xl font-bold ${
                      isDarkMode ? 'text-green-300' : 'text-green-700'
                    }`}>
                      ✅ PANE BIANCO DISPONIBILE
                    </div>
                  )}
                  {breadStatus === "NO" && (
                    <div className={`text-3xl font-bold ${
                      isDarkMode ? 'text-red-300' : 'text-red-700'
                    }`}>
                      ❌ PANE BIANCO FINITO
                    </div>
                  )}
                  {breadStatus === "errore" && (
                    <div className={`text-xl font-semibold ${
                      isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
                    }`}>
                      ⚠️ Errore nel caricamento
                    </div>
                  )}
                </div>
                
                <button
                  onClick={fetchBreadStatus}
                  className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  🔄 Aggiorna Stato
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sezione calendario */}
        <div>
          <h2 className={`text-2xl font-semibold mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            📅 Calendario della Torcia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {calendarDays.map(({ date, owner, isToday }) => (
              <div
                key={date}
                className={`p-4 rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md ${
                  isToday 
                    ? isDarkMode
                      ? "bg-blue-900 border-blue-600 shadow-md text-blue-100" 
                      : "bg-blue-50 border-blue-300 shadow-md"
                    : isDarkMode
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-100"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className={`font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-100' : 'text-gray-800'
                    }`}>
                      {format(date, "dd/MM/yyyy")}
                    </div>
                    <div className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {getDayName(date)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      owner === "Bosca" ? "text-purple-600" : "text-green-600"
                    }`}>
                      {owner}
                    </div>
                    {isToday && (
                      <div className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${
                        isDarkMode 
                          ? 'bg-blue-800 text-blue-200' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        OGGI
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`text-center mt-8 text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <p>Torcia App v2.1 - Sistema di gestione torcia condivisa con controllo modale</p>
        </div>
      </div>

      {/* Modal per controllo torcia */}
      {isModalOpen && (
        <>
          {/* Stili CSS per l'animazione del fascio */}
          <style>{`
            @keyframes lightBeam {
              0% {
                opacity: 0.6;
                transform: translateX(-50%) rotate(15deg) scaleY(1);
              }
              100% {
                opacity: 0.9;
                transform: translateX(-50%) rotate(15deg) scaleY(1.1);
              }
            }
            @keyframes lightBeamReverse {
              0% {
                opacity: 0.4;
                transform: translateX(-50%) rotate(15deg) scaleY(1.1);
              }
              100% {
                opacity: 0.6;
                transform: translateX(-50%) rotate(15deg) scaleY(1);
              }
            }
          `}</style>
          
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <div className="text-center">
              <h3 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>
                🔦 Controllo Torcia
              </h3>
              
              {/* Immagine torcia */}
              <div className="mb-6 relative">
                {/* Fascio di luce - visibile solo quando accesa */}
                {isTorchOn && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none">
                    {/* Fascio principale */}
                    <div 
                      className="absolute left-1/2 transform -translate-x-1/2 opacity-70"
                      style={{
                        top: '140px', // Posizionato alla fine della torcia
                        left: 'calc(50% - 5px)', // Spostato ancora più a sinistra
                        width: '100px',
                        height: '180px',
                        background: 'linear-gradient(180deg, rgba(255,255,150,0.9) 0%, rgba(255,255,200,0.5) 50%, rgba(255,255,255,0.1) 100%)',
                        clipPath: 'polygon(48% 0%, 52% 0%, 75% 100%, 25% 100%)', // Ancora più inclinato verso destra
                        filter: 'blur(2px)',
                        animation: 'lightBeam 2s ease-in-out infinite alternate',
                        transform: 'translateX(-50%) rotate(15deg)', // Ridotta rotazione a 15 gradi
                        transformOrigin: 'top center'
                      }}
                    />
                    
                    {/* Fascio secondario più ampio */}
                    <div 
                      className="absolute left-1/2 transform -translate-x-1/2 opacity-40"
                      style={{
                        top: '140px',
                        left: 'calc(50% - 5px)', // Spostato ancora più a sinistra
                        width: '160px',
                        height: '220px',
                        background: 'linear-gradient(180deg, rgba(255,255,100,0.6) 0%, rgba(255,255,150,0.3) 40%, rgba(255,255,255,0.05) 100%)',
                        clipPath: 'polygon(45% 0%, 55% 0%, 85% 100%, 15% 100%)', // Ancora più inclinato verso destra
                        filter: 'blur(6px)',
                        animation: 'lightBeamReverse 3s ease-in-out infinite alternate',
                        transform: 'translateX(-50%) rotate(15deg)', // Ridotta rotazione a 15 gradi
                        transformOrigin: 'top center'
                      }}
                    />
                  </div>
                )}
                
                <img 
                  src={isTorchOn ? "/images/torcia-accesa.png" : "/images/torcia-spenta.png"}
                  alt={isTorchOn ? "Torcia accesa" : "Torcia spenta"}
                  className={`w-48 h-64 object-contain mx-auto transition-all duration-300 relative z-10 ${
                    isTorchOn ? 'drop-shadow-[0_0_20px_rgba(255,255,150,0.8)]' : ''
                  }`}
                />
              </div>

              {/* Stato attuale */}
              <p className={`mb-4 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Stato: <span className={`font-semibold ${isTorchOn ? "text-green-600" : isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {isTorchOn ? "ACCESA ✨" : "SPENTA"}
                </span>
              </p>

              {/* Pulsanti */}
              <div className="space-y-3">
                <button
                  onClick={toggleTorch}
                  className={`w-full px-6 py-3 rounded-lg text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                    isTorchOn 
                      ? "bg-red-500 hover:bg-red-600 shadow-lg" 
                      : "bg-green-500 hover:bg-green-600 shadow-lg"
                  }`}
                >
                  {isTorchOn ? "🔴 Spegni Torcia" : "🟢 Accendi Torcia"}
                </button>
                
                <button
                  onClick={closeTorchModal}
                  className={`w-full px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-600 hover:bg-gray-700 text-gray-100' 
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                >
                  ❌ Chiudi
                </button>
              </div>
            </div>
          </div>
          </div>
        </>
      )}
    </div>
  );
}
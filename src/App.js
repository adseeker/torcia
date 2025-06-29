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
  const [isCompassOpen, setIsCompassOpen] = useState(false); // Stato per modal bussola
  const [compassHeading, setCompassHeading] = useState(0); // Direzione magnetica
  const [compassError, setCompassError] = useState(null); // Errori della bussola
  const [isCompassCalibrating, setIsCompassCalibrating] = useState(false); // Stato calibrazione
  const [manualCompassHeading, setManualCompassHeading] = useState(0); // Bussola manuale
  const [useManualCompass, setUseManualCompass] = useState(false); // Modalità manuale

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

  // Funzioni per gestire la bussola
  const openCompass = () => {
    setIsCompassOpen(true);
    setCompassError(null);
    setIsCompassCalibrating(true);
    startCompass();
  };

  const closeCompass = () => {
    setIsCompassOpen(false);
    setIsCompassCalibrating(false);
    setUseManualCompass(false);
    stopCompass();
  };

  const startCompass = () => {
    if ('DeviceOrientationEvent' in window) {
      // Per iOS 13+ richiedi permessi esplicitamente
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(response => {
            if (response === 'granted') {
              startListening();
            } else {
              setIsCompassCalibrating(false);
              setCompassError('Permesso negato. Tocca l\'icona del lucchetto nella barra degli indirizzi per gestire i permessi.');
            }
          })
          .catch(() => {
            setIsCompassCalibrating(false);
            setCompassError('Impossibile richiedere i permessi. Prova ad aggiornare la pagina.');
          });
      } else {
        // Per Android e altri browser
        startListening();
      }
    } else {
      setIsCompassCalibrating(false);
      setCompassError('Il tuo browser non supporta l\'orientamento del dispositivo');
    }
  };

  const startListening = () => {
    // Usa sia deviceorientation che deviceorientationabsolute per maggiore compatibilità
    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('deviceorientationabsolute', handleOrientationAbsolute);
    
    // Test per verificare se ricevi dati validi
    setTimeout(() => {
      if (compassHeading === 0 && isCompassCalibrating) {
        setIsCompassCalibrating(false);
        setCompassError('Sensore magnetico non disponibile o non funzionante');
      }
    }, 4000);
  };

  const retryCompass = () => {
    setCompassError(null);
    setCompassHeading(0);
    setIsCompassCalibrating(true);
    setUseManualCompass(false);
    startCompass();
  };

  const switchToManualCompass = () => {
    setUseManualCompass(true);
    setCompassError(null);
    setIsCompassCalibrating(false);
    stopCompass();
  };

  const rotateManualCompass = (direction) => {
    const increment = direction === 'left' ? -15 : 15;
    setManualCompassHeading(prev => {
      let newHeading = prev + increment;
      if (newHeading < 0) newHeading += 360;
      if (newHeading >= 360) newHeading -= 360;
      return newHeading;
    });
  };

  const resetManualCompass = () => {
    setManualCompassHeading(0);
  };

  const stopCompass = () => {
    window.removeEventListener('deviceorientation', handleOrientation);
    window.removeEventListener('deviceorientationabsolute', handleOrientationAbsolute);
  };

  const handleOrientation = (event) => {
    processOrientationData(event, false);
  };

  const handleOrientationAbsolute = (event) => {
    processOrientationData(event, true);
  };

  const processOrientationData = (event, isAbsolute) => {
    let heading = event.alpha; // alpha è l'angolo di rotazione attorno all'asse Z
    
    if (heading !== null && heading !== undefined) {
      // Normalizza l'angolo (0-360 gradi)
      heading = heading < 0 ? heading + 360 : heading;
      
      // Per deviceorientationabsolute, l'heading è già corretto
      // Per deviceorientation normale, potrebbe servire inversione
      const correctedHeading = isAbsolute ? heading : (360 - heading);
      
      setCompassHeading(correctedHeading);
      
      // Se ricevi dati validi, rimuovi eventuali errori e ferma calibrazione
      if (compassError && (compassError.includes('non disponibile') || compassError.includes('non funzionante'))) {
        setCompassError(null);
      }
      if (isCompassCalibrating) {
        setIsCompassCalibrating(false);
      }
    }
  };

  // Funzione per ottenere la direzione cardinale
  const getCardinalDirection = (heading) => {
    const directions = [
      { name: 'N', min: 0, max: 11.25 },
      { name: 'NNE', min: 11.25, max: 33.75 },
      { name: 'NE', min: 33.75, max: 56.25 },
      { name: 'ENE', min: 56.25, max: 78.75 },
      { name: 'E', min: 78.75, max: 101.25 },
      { name: 'ESE', min: 101.25, max: 123.75 },
      { name: 'SE', min: 123.75, max: 146.25 },
      { name: 'SSE', min: 146.25, max: 168.75 },
      { name: 'S', min: 168.75, max: 191.25 },
      { name: 'SSO', min: 191.25, max: 213.75 },
      { name: 'SO', min: 213.75, max: 236.25 },
      { name: 'OSO', min: 236.25, max: 258.75 },
      { name: 'O', min: 258.75, max: 281.25 },
      { name: 'ONO', min: 281.25, max: 303.75 },
      { name: 'NO', min: 303.75, max: 326.25 },
      { name: 'NNO', min: 326.25, max: 348.75 },
      { name: 'N', min: 348.75, max: 360 }
    ];
    
    for (let dir of directions) {
      if (heading >= dir.min && heading < dir.max) {
        return dir.name;
      }
    }
    return 'N';
  };

  // Cleanup quando il componente si smonta
  useEffect(() => {
    return () => {
      if (isCompassOpen) {
        stopCompass();
      }
    };
  }, [isCompassOpen]);

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
    <div className={`p-6 w-full font-sans min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`rounded-lg shadow-lg p-6 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      }`}>
        {/* Header con toggle tema e pulsanti */}
        <div className="flex justify-between items-center mb-6">
          {/* Pulsanti a sinistra */}
          <div className="flex gap-2">
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
            
            <button
              onClick={openCompass}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isDarkMode
                ? "bg-gray-700 text-blue-400 hover:bg-gray-600 border border-blue-400"
                : "bg-white text-blue-600 hover:bg-blue-50 border border-blue-300 shadow-sm"
              }`}
              title="Bussola"
            >
              🧭
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-center flex-1">
            🔦 Torcia App v2.2
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
          <p>Torcia App v2.2 - Sistema di gestione torcia condivisa con bussola digitale</p>
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

      {/* Modal per la bussola */}
      {isCompassOpen && (
        <>
          {/* Stili CSS per l'animazione della bussola */}
          <style>{`
            @keyframes compassSpin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
            .compass-needle {
              transition: transform 0.3s ease-out;
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
                  🧭 Bussola Digitale
                </h3>
                
                {compassError ? (
                  <div className={`p-6 rounded-lg mb-6 transition-colors duration-300 ${
                    isDarkMode ? 'bg-red-900 border border-red-600' : 'bg-red-100 border border-red-300'
                  }`}>
                    <p className={`text-lg font-semibold mb-3 ${
                      isDarkMode ? 'text-red-300' : 'text-red-700'
                    }`}>
                      ⚠️ Bussola Non Disponibile
                    </p>
                    <p className={`text-sm mb-4 ${
                      isDarkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {compassError}
                    </p>
                    
                    {/* Suggerimenti specifici per tipo di errore */}
                    <div className="mt-4 space-y-3">
                      {compassError.includes('Permesso negato') && (
                        <div className={`text-xs p-3 rounded ${
                          isDarkMode ? 'bg-red-800 text-red-300' : 'bg-red-50 text-red-700'
                        }`}>
                          💡 <strong>Come abilitare:</strong><br/>
                          • <strong>Chrome/Edge:</strong> Tocca l'icona del lucchetto → Autorizzazioni sito<br/>
                          • <strong>Safari:</strong> Impostazioni → Safari → Movimento e orientamento<br/>
                          • <strong>Firefox:</strong> Tocca l'icona dello scudo → Autorizzazioni
                        </div>
                      )}
                      {(compassError.includes('non disponibile') || compassError.includes('non funzionante')) && (
                        <div className={`text-xs p-3 rounded ${
                          isDarkMode ? 'bg-red-800 text-red-300' : 'bg-red-50 text-red-700'
                        }`}>
                          📱 <strong>Possibili soluzioni:</strong><br/>
                          • Assicurati di essere su un dispositivo mobile<br/>
                          • Prova un browser diverso (Chrome, Safari, Firefox)<br/>
                          • Verifica che il dispositivo abbia una bussola integrata<br/>
                          • Allontanati da fonti magnetiche (altoparlanti, metalli)<br/>
                          • Se sei in HTTP, prova con HTTPS per maggiore compatibilità
                        </div>
                      )}
                      {compassError.includes('non supporta') && (
                        <div className={`text-xs p-3 rounded ${
                          isDarkMode ? 'bg-red-800 text-red-300' : 'bg-red-50 text-red-700'
                        }`}>
                          🖥️ <strong>Su Desktop:</strong> La bussola magnetica non è disponibile sui computer. Usa uno smartphone o tablet per accedere alla bussola.
                        </div>
                      )}
                      
                      {/* Bussola alternativa manuale */}
                      <div className={`text-xs p-4 rounded border-2 border-dashed ${
                        isDarkMode ? 'bg-blue-900 border-blue-600 text-blue-300' : 'bg-blue-50 border-blue-300 text-blue-700'
                      }`}>
                        🧭 <strong>Bussola Manuale:</strong> Puoi comunque orientarti guardando la posizione del sole o usando punti di riferimento noti!
                      </div>
                    </div>
                    
                    {/* Pulsante Riprova */}
                    <button
                      onClick={retryCompass}
                      className={`w-full mt-4 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-red-700 hover:bg-red-600 text-red-100' 
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      🔄 Riprova
                    </button>
                  </div>
                ) : isCompassCalibrating ? (
                  <div className="mb-6 text-center">
                    <div className={`p-8 rounded-lg transition-colors duration-300 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <div className="w-32 h-32 mx-auto mb-4 relative">
                        <div className={`w-full h-full rounded-full border-4 border-dashed animate-spin transition-colors duration-300 ${
                          isDarkMode ? 'border-blue-400' : 'border-blue-600'
                        }`} style={{ animationDuration: '2s' }}>
                          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          }`}>
                            🧭
                          </div>
                        </div>
                      </div>
                      <p className={`text-lg font-semibold mb-2 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        🔄 Calibrazione in corso...
                      </p>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Sto cercando il segnale magnetico
                      </p>
                    </div>
                  </div>
                ) : useManualCompass ? (
                  <div className="mb-6">
                    {/* Header bussola manuale */}
                    <div className={`p-4 rounded-lg mb-4 transition-colors duration-300 ${
                      isDarkMode ? 'bg-blue-900 border border-blue-600' : 'bg-blue-100 border border-blue-300'
                    }`}>
                      <p className={`text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-blue-300' : 'text-blue-700'
                      }`}>
                        🧑‍🦯 Modalità Manuale
                      </p>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        Ruota la bussola per orientarti secondo punti di riferimento noti
                      </p>
                    </div>
                    
                    {/* Bussola manuale */}
                    <div className={`relative w-64 h-64 mx-auto mb-6 rounded-full border-4 transition-colors duration-300 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                    }`}>
                      {/* Cerchio esterno con i punti cardinali */}
                      <div className="absolute inset-2 rounded-full border-2 border-dashed opacity-50">
                        {/* Punti cardinali */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <span className={`text-xl font-bold ${
                            isDarkMode ? 'text-red-400' : 'text-red-600'
                          }`}>N</span>
                        </div>
                        <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                          <span className={`text-lg font-semibold ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>E</span>
                        </div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                          <span className={`text-lg font-semibold ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>S</span>
                        </div>
                        <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <span className={`text-lg font-semibold ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>O</span>
                        </div>
                      </div>
                      
                      {/* Ago della bussola manuale */}
                      <div 
                        className="compass-needle absolute top-1/2 left-1/2 origin-bottom"
                        style={{
                          transform: `translate(-50%, -100%) rotate(${manualCompassHeading}deg)`,
                          width: '4px',
                          height: '80px',
                          background: 'linear-gradient(180deg, #3b82f6 0%, #3b82f6 60%, #6b7280 60%, #6b7280 100%)',
                          borderRadius: '2px 2px 0 0'
                        }}
                      />
                      
                      {/* Centro della bussola */}
                      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${
                        isDarkMode ? 'bg-gray-600 border-2 border-gray-500' : 'bg-gray-300 border-2 border-gray-400'
                      }`} />
                    </div>
                    
                    {/* Controlli manuali */}
                    <div className={`p-4 rounded-lg mb-4 transition-colors duration-300 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <div className="flex justify-center items-center space-x-4 mb-4">
                        <button
                          onClick={() => rotateManualCompass('left')}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            isDarkMode 
                              ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                          }`}
                        >
                          ← 15°
                        </button>
                        <button
                          onClick={resetManualCompass}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            isDarkMode 
                              ? 'bg-blue-700 hover:bg-blue-600 text-white' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => rotateManualCompass('right')}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            isDarkMode 
                              ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                          }`}
                        >
                          15° →
                        </button>
                      </div>
                      
                      {/* Informazioni digitali */}
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            Direzione
                          </p>
                          <p className={`text-2xl font-bold ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          }`}>
                            {getCardinalDirection(manualCompassHeading)}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            Gradi
                          </p>
                          <p className={`text-2xl font-bold ${
                            isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`}>
                            {Math.round(manualCompassHeading)}°
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Suggerimento per l'uso */}
                    <div className={`text-xs p-3 rounded ${
                      isDarkMode ? 'bg-yellow-900 border border-yellow-600 text-yellow-300' : 'bg-yellow-50 border border-yellow-300 text-yellow-700'
                    }`}>
                      💡 <strong>Come usare:</strong> Orienta fisicamente il tuo dispositivo verso nord, poi ruota l'ago della bussola fino a farlo puntare verso l'alto.
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    {/* Bussola automatica */}
                    <div className={`relative w-64 h-64 mx-auto mb-6 rounded-full border-4 transition-colors duration-300 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                    }`}>
                      {/* Cerchio esterno con i punti cardinali */}
                      <div className="absolute inset-2 rounded-full border-2 border-dashed opacity-50">
                        {/* Punti cardinali */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <span className={`text-xl font-bold ${
                            isDarkMode ? 'text-red-400' : 'text-red-600'
                          }`}>N</span>
                        </div>
                        <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                          <span className={`text-lg font-semibold ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>E</span>
                        </div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                          <span className={`text-lg font-semibold ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>S</span>
                        </div>
                        <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <span className={`text-lg font-semibold ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>O</span>
                        </div>
                      </div>
                      
                      {/* Ago della bussola */}
                      <div 
                        className="compass-needle absolute top-1/2 left-1/2 origin-bottom"
                        style={{
                          transform: `translate(-50%, -100%) rotate(${compassHeading}deg)`,
                          width: '4px',
                          height: '80px',
                          background: 'linear-gradient(180deg, #ef4444 0%, #ef4444 60%, #6b7280 60%, #6b7280 100%)',
                          borderRadius: '2px 2px 0 0'
                        }}
                      />
                      
                      {/* Centro della bussola */}
                      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${
                        isDarkMode ? 'bg-gray-600 border-2 border-gray-500' : 'bg-gray-300 border-2 border-gray-400'
                      }`} />
                    </div>
                    
                    {/* Informazioni digitali */}
                    <div className={`p-4 rounded-lg transition-colors duration-300 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            Direzione
                          </p>
                          <p className={`text-2xl font-bold ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          }`}>
                            {getCardinalDirection(compassHeading)}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            Gradi
                          </p>
                          <p className={`text-2xl font-bold ${
                            isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`}>
                            {Math.round(compassHeading)}°
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pulsanti */}
                <div className="space-y-3">
                  {!compassError && !useManualCompass && (
                    <button
                      onClick={retryCompass}
                      className={`w-full px-6 py-2 font-medium rounded-lg transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-blue-700 hover:bg-blue-600 text-blue-100' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      🔄 Aggiorna Bussola
                    </button>
                  )}
                  {useManualCompass && (
                    <button
                      onClick={retryCompass}
                      className={`w-full px-6 py-2 font-medium rounded-lg transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-green-700 hover:bg-green-600 text-green-100' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      🔄 Torna alla Bussola Automatica
                    </button>
                  )}
                  <button
                    onClick={closeCompass}
                    className={`w-full px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-600 hover:bg-gray-700 text-gray-100' 
                        : 'bg-gray-500 hover:bg-gray-600 text-white'
                    }`}
                  >
                    ❌ Chiudi Bussola
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
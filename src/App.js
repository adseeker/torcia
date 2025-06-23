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

  const getDayName = (date) => {
    const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    return days[date.getDay()];
  };

  const handleViewChange = (newView) => {
    if (newView === activeView) return;
    
    // Controlla se il tab è disabilitato
    if (isTabDisabled(newView)) return;
    
    const viewOrder = ["mraco", "bosca"];
    const currentIndex = viewOrder.indexOf(activeView);
    const newIndex = viewOrder.indexOf(newView);
    
    setSlideDirection(newIndex > currentIndex ? "right" : "left");
    setActiveView(newView);
  };

  const isTabDisabled = (view) => {
    // Solo il tab del proprietario attuale è abilitato
    if (view === "mraco" && currentOwner === "Mraco") return false;
    if (view === "bosca" && currentOwner === "Bosca") return false;
    
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

  const imageData = getImageForView();

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          🔦 Torcia App v2.1
        </h1>
        
        {/* Sezione proprietario */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
          <p className="text-lg">
            Oggi la torcia è di <strong className="text-xl">{currentOwner}</strong>!
          </p>
        </div>

        {/* Sezione torcia con tab */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
            Dove si trova la Torcia
          </h2>
          
          {/* Tab Navigation - Solo le camere */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                onClick={() => handleViewChange("mraco")}
                disabled={isTabDisabled("mraco")}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-200 relative ${
                  isTabDisabled("mraco")
                    ? "text-gray-400 cursor-not-allowed opacity-50"
                    : activeView === "mraco"
                    ? "bg-white text-green-600 shadow-sm"
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
                    ? "bg-white text-purple-600 shadow-sm"
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

          {/* Messaggio informativo quando ci sono tab disabilitati */}
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">
              🔒 La torcia si trova solo dove è il proprietario del giorno
            </p>
          </div>

          {/* Image Container with slide animation */}
          <div className="relative overflow-hidden">
            <div 
              className={`transform transition-transform duration-300 ease-in-out ${
                slideDirection === "right" ? "translate-x-0" : "translate-x-0"
              }`}
            >
              <div className="bg-gray-100 p-8 rounded-lg shadow-inner text-center">
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
        </div>

        {/* Sezione calendario */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            📅 Calendario della Torcia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {calendarDays.map(({ date, owner, isToday }) => (
              <div
                key={date}
                className={`p-4 rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md ${
                  isToday 
                    ? "bg-blue-50 border-blue-300 shadow-md" 
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-800">
                      {format(date, "dd/MM/yyyy")}
                    </div>
                    <div className="text-sm text-gray-600">
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
                      <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
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
        <div className="text-center mt-8 text-gray-500 text-sm">
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
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">
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
              <p className="mb-4 text-gray-600">
                Stato: <span className={`font-semibold ${isTorchOn ? "text-green-600" : "text-gray-500"}`}>
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
                  className="w-full px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200"
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
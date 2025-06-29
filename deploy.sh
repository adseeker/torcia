#!/bin/bash

echo "🚀 Torcia App v2.2 - Deploy Script"
echo "=================================="

# Controlla se siamo nella directory corretta
if [ ! -f "package.json" ]; then
    echo "❌ Errore: Non siamo nella directory del progetto torcia"
    exit 1
fi

echo "📁 Directory corretta trovata"

# Mostra lo stato attuale
echo "📋 Stato attuale del repository:"
git status

echo ""
echo "➕ Aggiungendo tutte le modifiche..."
git add .

echo ""
echo "📝 Committando le modifiche..."
git commit -m "Add compass feature v2.2 with manual fallback and improved error handling

Features added:
- Digital compass with real-time orientation
- Manual compass fallback for when sensors don't work
- Improved error handling and user guidance
- Support for both deviceorientation and deviceorientationabsolute
- Better permission management for iOS/Android
- Intuitive controls for manual compass mode
- Updated to version 2.2.0"

echo ""
echo "⬇️ Sincronizzando con il repository remoto..."
git pull origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "⬆️ Caricando le modifiche sul repository remoto..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ SUCCESSO! Torcia App v2.2 caricata con successo!"
        echo "🧭 La nuova bussola è ora disponibile online!"
    else
        echo ""
        echo "❌ Errore durante il push. Controlla i permessi del repository."
    fi
else
    echo ""
    echo "⚠️ Ci sono stati conflitti durante il pull."
    echo "🔧 Risolvi i conflitti manualmente, poi esegui:"
    echo "   git add ."
    echo "   git commit -m 'Resolve merge conflicts'"
    echo "   git push origin main"
fi

echo ""
echo "🎯 Deploy completato!"

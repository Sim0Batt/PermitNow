# PermitNow

PermitNow è un sistema integrato per la gestione digitale delle licenze di pesca e dei relativi permessi[cite: 3]. Il progetto mira a digitalizzare e semplificare l'emissione, il controllo e la registrazione delle catture, sostituendo i tradizionali libretti cartacei con un'infrastruttura cloud moderna.

## Struttura del Progetto

Il sistema è diviso in tre macro-componenti principali[cite: 3], contenuti nelle rispettive cartelle della repository:

*   **`server/` (Backend):** 
    Sviluppato in **Kotlin** utilizzando il framework **Ktor**. Si interfaccia con un database **MongoDB** (tramite KMongo) per la persistenza dei dati. Espone le API RESTful per l'autenticazione, la gestione OCR dei documenti e l'amministrazione delle licenze[cite: 3].
*   **`web-app/` (Dashboard Admin):** 
    Pannello di controllo web sviluppato in **React (Vite)** con **TypeScript** e **Tailwind CSS**. Permette agli amministratori e agli operatori di gestire gli utenti, verificare e approvare le licenze emesse[cite: 3].
*   **`mobile-app/` (App Utente):** 
    Applicazione mobile multipiattaforma sviluppata in **React Native (Expo)**. Dedicata ai pescatori per visualizzare la propria licenza digitale, scansionare documenti e registrare agilmente le giornate di pesca e le catture (libretto digitale)[cite: 3].

## Documentazione API

La documentazione completa delle API RESTful è scritta in formato API Blueprint ed è consultabile nel file `apiary.apib`[cite: 3] situato nella root del progetto. Può essere importata su Apiary per generare mock server e interfacce grafiche interattive.

## Gruppo

Questo progetto è stato progettato e sviluppato dal Gruppo 3, composto da:
*   **Simone Battisti**
*   **Nicola Avellino**
*   **Davide Basso**

---
*Progetto Ingegneria del Software - 2026*

# PermitNow

PermitNow è un sistema alternativo all'attuale forma di gestione dei servizi di caccia, pesca e attività boschifera. È definito da una applicazione mobile e una web application per tutti i servizi richiesti. PermitNow offre anche una dashboard di sistema (admin) da fornire agli enti adatti secondo una gestione Multi-Tenant.

## Struttura del Progetto

Il sistema è diviso in tre macro-componenti principali, contenuti nelle rispettive cartelle della repository:

*   **`server/` (Backend):** 
    Sviluppato in **Kotlin** utilizzando il framework **Ktor**. Si interfaccia con un database **MongoDB** (tramite KMongo) per la persistenza dei dati. Espone le API RESTful per l'autenticazione, la gestione OCR dei documenti e l'amministrazione delle licenze.
*   **`web-app/` (Dashboard Admin):** 
    Pannello di controllo web sviluppato in **React (Vite)** con **TypeScript** e **Tailwind CSS**. Permette agli amministratori e agli operatori di gestire gli utenti, verificare e approvare le licenze emesse.
*   **`mobile-app/` (App Utente):** 
    Applicazione mobile multipiattaforma sviluppata in **React Native (Expo)**. Dedicata ai pescatori per visualizzare la propria licenza digitale, scansionare documenti e registrare agilmente le giornate di pesca e le catture (libretto digitale). _da implementare_

## Documentazione API

La documentazione completa delle API RESTful è scritta in formato API Blueprint ed è consultabile nel file `apiary.apib` situato nella root del progetto, visualizzabile al link [here](https://permitnow.docs.apiary.io/#).

## Gruppo

Questo progetto è stato progettato e sviluppato dal Gruppo 3, composto da:
*   **Simone Battisti**
*   **Nicola Avellino**
*   **Davide Basso**

---
*Progetto Ingegneria del Software - 2026*

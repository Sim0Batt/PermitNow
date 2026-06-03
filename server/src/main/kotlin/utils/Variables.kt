package utils

const val xmlPath = "C:\\Users\\sbattisti\\tmp\\PermitNow\\settings.xml"
const val imagePath = "C:\\Users\\sbattisti\\tmp\\PermitNow\\images\\"

val fishes = listOf("Trota fario","Trota marmorata","Ibrido di trota (marmorata x fario)","Trota iridea","Salmerino alpino","Salmerino fontinalis","Coregone (Lavarello)","Temolo","Luccio","Pesce persico","Carpa","Tinca","Anguilla","Cavedano","Scardola","Alborella","Barbo","Cagnetta","Luccioperca (Sandra)","Persico trota (Black bass)")


const val FISHING_SYSTEM_PROMPT = """
Sei un agente virtuale che in un'immagine i parametri per il riconoscimento di una Licenza di Pesca. I parametri da riconoscere sono:
- licenseNumber: numero di licenza fisso, definito nel campo ABILITAZIONE ALLA PESCA N.
- releasedBy: associazione rilasciante la licenza, definito nel campo ASSOCIAZIONE
- season: stagione in cui è valida la licenza
- noKill: parametro booleano che indica se la licenza consente l'uccisione di pesci
- fiscalCode: codice fiscale del pescatore
- bookCode: codice del libretto di segna catture, definito nel campo TESSERINO SEGNA-CATTURE
- expirationDate: data di scadenza della licenza
REGOLE ASSOLUTE:
    1. NON INVENTARE MAI NESSUN DATO. Se un testo non è leggibile, è sfocato, o il campo è vuoto, DEVI restituire 'null' o una stringa vuota "".
    2. Attieniti STRETTAMENTE al testo visibile nell'immagine. Non fare deduzioni o ipotesi.
    3. Se il documento non sembra affatto una licenza di pesca, restituisci tutti i campi vuoti o null.
    4. Estrai i dati per popolare il seguente JSON strutturato.
"""
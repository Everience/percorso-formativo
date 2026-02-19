require('dotenv').config();
const { sql, poolPromise } = require('./config/db'); // Cambia il percorso se il tuo db.js è in un'altra cartella

async function testConnection() {
    console.log("⏳ Tentativo di connessione al database in corso...");
    console.log(`Host configurato: ${process.env.DB_HOST}`);
    console.log(`Database configurato: ${process.env.DB_NAME}`);

    try {
        // Aspetta che la connessione (poolPromise) sia pronta
        const pool = await poolPromise;
        
        // Fa una query di test per chiedere al DB il suo vero nome
        const result = await pool.request().query('SELECT DB_NAME() AS CurrentDB, @@SERVERNAME AS ServerName');
        
        console.log("\n✅ ==================================");
        console.log("✅ CONNESSIONE RIUSCITA CON SUCCESSO!");
        console.log("✅ ==================================");
        console.log("📌 Stai usando il Server:", result.recordset[0].ServerName);
        console.log("📌 Sei dentro il Database:", result.recordset[0].CurrentDB);
        
        process.exit(0); // Chiude lo script con successo

    } catch (err) {
        console.log("\n❌ ==================================");
        console.log("❌ ERRORE DI CONNESSIONE AL DATABASE!");
        console.log("❌ ==================================");
        console.error("Dettaglio Errore:", err.message);
        
        // Suggerimenti automatici basati sull'errore
        if (err.message.includes('Login failed')) {
            console.log("💡 SUGGERIMENTO: Utente (DB_USER) o Password (DB_PASSWORD) errati nel file .env.");
        } else if (err.message.includes('ENOTFOUND') || err.message.includes('refused')) {
            console.log("💡 SUGGERIMENTO: Il DB_HOST nel file .env è sbagliato, oppure SQL Server è spento.");
        }
        
        process.exit(1); // Chiude lo script con errore
    }
}

testConnection();
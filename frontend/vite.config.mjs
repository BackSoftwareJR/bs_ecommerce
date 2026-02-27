import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/frontend/dist/',      // <- AGGIUNGI QUESTA RIGA
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        prodotti: 'prodotti.html',
        prodotto: 'prodotto.html',
        pagina: 'pagina.html',
        admin: 'admin.html',
        'admin-login': 'admin-login.html',
        'admin-register': 'admin-register.html',
        'admin-prodotti': 'admin-prodotti.html',
        'admin-prodotto': 'admin-prodotto.html',
        'admin-pagine': 'admin-pagine.html',
        'admin-contatti': 'admin-contatti.html',
        'admin-statistiche': 'admin-statistiche.html',
        'admin-impostazioni': 'admin-impostazioni.html'
      }
    }
  }
});
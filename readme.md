cd frontend
npm i
npm run dev

cd ..
fastapi dev ./backend/main.py

rm -f client_history.db && sqlite3 client_history.db < db.sql